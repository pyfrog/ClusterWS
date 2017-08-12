export function processMessages(type: string, data?: any) {
    return { type: type, data: data }
}


/**
 * Here different messages generates for different communication reasons
 *
 * 
 * class ProcessMessages : is used for communication between
 * master and workers.
 */
export class ProcessMessages {
    constructor(public type: string, public data?: any) { }
}

/**
 * class ProcessErrors : is used for building error messages.
 */
export class ProcessErrors {
    constructor(public err: string, public is: string, public pid: number) { }
}

/**
 * class EmitMessage : is used for sending emit messages trough
 * WebSocket to the client
 */
class EmitMessage {
    action: string = 'emit';

    constructor(public event: string, public data?: any) { }
}

/**
 * class PublishMessage : is used for sending publish messages
 * trough WebSocket to the client.
 */
class PublishMessage {
    action: string = 'publish';

    constructor(public channel: string, public data?: any) { }
}

/**
 * class InternalMessage : is used for sending messages to client
 * which are used by ClusterWS (not for client use).
 */
class InternalMessage {
    action: string = 'internal';

    constructor(public event: string, public data?: any) { }
}

/**
 * class BrokerMessage : is used for sending messages between workers
 * and broker.
 */
class BrokerMessage {
    constructor(public channel: string, public data?: any) { }
}

/**
 * class MessageFactory: is main class where all above messages generating,
 * also place where filters applies.
 */

export class MessageFactory {
    static emitMessage(event: string, data?: any) {
        return JSON.stringify(new EmitMessage(event, data));
    }

    static publishMessage(channel: string, data?: any) {
        return JSON.stringify(new PublishMessage(channel, data));
    }

    static brokerMessage(channel: string, data?: any) {
        return JSON.stringify(new BrokerMessage(channel, data));
    }

    static internalMessage(event: string, data?: any) {
        return JSON.stringify(new InternalMessage(event, data));
    }
    static processErrors(err: any, is: string, pid: number) {
        return new ProcessErrors(err, is, pid);
    }
    static processMessages(type: string, data?: any) {
        return new ProcessMessages(type, data);
    }
}