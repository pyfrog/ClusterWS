import { unlinkSync } from 'fs';
import { Networking } from './networking';
import { randomBytes } from 'crypto';
import { Socket, Server, createServer } from 'net';

const SUBSCRIBE: number = 's'.charCodeAt(0);
const UNSUBSCRIBE: number = 'u'.charCodeAt(0);

type ExtendedSocket = Networking & { id?: string, channels?: { [key: string]: string }, isAlive?: boolean };

function generateUid(length: number): string {
  return randomBytes(length / 2).toString('hex');
}

interface BrokerServerOptions {
  port?: number;
  path?: string;
  onReady?: () => void;
  // onError: (server: boolean, err: Error) => void;
  // onMetrics?: (data: any) => void;
}

export class BrokerServer {
  private server: Server;
  private connectedClients: ExtendedSocket[] = [];

  constructor(private options: BrokerServerOptions) {
    if (this.options.path) {
      try { unlinkSync(this.options.path); } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }

      if (process.platform === 'win32') {
        this.options.path = this.options.path.replace(/^\//, '');
        this.options.path = this.options.path.replace(/\//g, '-');
        this.options.path = `\\\\.\\pipe\\${this.options.path}`;
      }
    }

    this.startServer();
    this.scheduleHeartbeat();
  }

  private startServer(): void {
    this.server = createServer((rawSocket: Socket) => {
      const socket: ExtendedSocket = this.registerSocket(rawSocket);

      socket.on('message', (message: Buffer) => {
        if (message[0] === SUBSCRIBE) {
          return this.subscribe(socket, message.slice(1).toString().split(','));
        }

        if (message[0] === UNSUBSCRIBE) {
          return this.unsubscribe(socket, message.slice(1).toString().split(','));
        }

        try {
          this.broadcast(socket.id, JSON.parse(message as any));
        } catch (err) {
          // TODO: write logic in here to drop connection
        }
      });

      socket.on('error', (err: Error) => {
        // TODO: add error emit
        this.unregisterSocket(socket.id);
      });

      socket.on('close', () => {
        this.unregisterSocket(socket.id);
      });

      socket.on('pong', () => {
        socket.isAlive = true;
      });
    });

    this.server.listen(this.options.path || this.options.port, this.options.onReady);
  }

  private subscribe(socket: ExtendedSocket, channels: string[]): void {
    for (let i: number = 0, len: number = channels.length; i < len; i++) {
      if (!socket.channels[channels[i]]) {
        socket.channels[channels[i]] = '1';
      }
    }
  }

  private unsubscribe(socket: ExtendedSocket, channels: string[]): void {
    for (let i: number = 0, len: number = channels.length; i < len; i++) {
      delete socket.channels[channels[i]];
    }
  }

  private registerSocket(rawSocket: Socket): ExtendedSocket {
    const socket: ExtendedSocket = new Networking(rawSocket);
    socket.id = generateUid(4);
    socket.isAlive = true;
    socket.channels = {};
    this.connectedClients.push(socket);
    return socket;
  }

  private unregisterSocket(id: string): void {
    for (let i: number = 0, len: number = this.connectedClients.length; i < len; i++) {
      const socket: ExtendedSocket = this.connectedClients[i];
      if (socket.id === id) {
        this.connectedClients.splice(i, 1);
        break;
      }
    }
  }

  private scheduleHeartbeat(): void {
    for (let i: number = 0, len: number = this.connectedClients.length; i < len; i++) {
      const socket: ExtendedSocket = this.connectedClients[i];
      if (!socket.isAlive) {
        socket.terminate();
        this.unregisterSocket(socket.id);
        continue;
      }

      socket.isAlive = false;
      socket.ping();
    }

    // heartbeat every 10s
    setTimeout(() => this.scheduleHeartbeat(), 10000);
  }

  private broadcast(id: string, data: object): void {
    for (let i: number = 0, len: number = this.connectedClients.length; i < len; i++) {
      const socket: ExtendedSocket = this.connectedClients[i];
      if (socket.id !== id) {
        let empty: boolean = true;
        const preparedMessage: object = {};

        for (const key in data) {
          if (!socket.channels[key]) {
            continue;
          }

          empty = false;
          preparedMessage[key] = data[key];
        }

        if (!empty) {
          socket.send(JSON.stringify(preparedMessage));
        }
      }
    }
  }
}
