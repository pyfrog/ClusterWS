module.exports=function(t){function r(e){if(n[e])return n[e].exports;var o=n[e]={i:e,l:!1,exports:{}};return t[e].call(o.exports,o,o.exports,r),o.l=!0,o.exports}var n={};return r.m=t,r.c=n,r.d=function(t,n,e){r.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:e})},r.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(n,"a",n),n},r.o=function(t,r){return Object.prototype.hasOwnProperty.call(t,r)},r.p="",r(r.s=2)}([function(t,r,n){"use strict";t.exports.curry=function(t){return"function"!=typeof t?console.log("Curry: No function was provided."):function r(){for(var n=arguments.length,e=Array(n),o=0;o<n;o++)e[o]=arguments[o];return e.length<t.length?function(){for(var t=arguments.length,n=Array(t),o=0;o<t;o++)n[o]=arguments[o];return r.call.apply(r,[null].concat(e,n))}:t.length?t.call.apply(t,[null].concat(e)):t}}},function(t,r,n){"use strict";var e=n(0).curry,o=function(t){this.__value=t};o.of=function(t){return new o(t)},o.prototype.map=function(t){return o.of(t(this.__value))};var u=function(t){this.__value=t};u.of=function(t){return new u(t)},u.prototype.map=function(){return this};var c=e(function(t,r,n){return n.constructor===u?t(n.__value):r(n.__value)});t.exports.Left=u,t.exports.Right=o,t.exports.either=c},function(t,r,n){"use strict";var e={id:n(3).id,map:n(4).map,prop:n(5).prop,curry:n(0).curry,compose:n(6).compose,Left:n(1).Left,Right:n(1).Right,either:n(1).either,switch:n(7).switch};t.exports=e},function(t,r,n){"use strict";t.exports.id=function(t){return t}},function(t,r,n){"use strict";var e=n(0).curry,o=function(t,r){for(var n=-1,e=null==r?0:r.length,o=new Array(e);++n<e;)o[n]=t(r[n],n,r);return o},u=function(t,r){r=Object(r);var n={};return Object.keys(r).forEach(function(e){n[e]=t(r[e],e,r)}),n};t.exports.map=e(function(t,r){return(r instanceof Array?o:u)(t,r)})},function(t,r,n){"use strict";var e=n(0).curry;t.exports.prop=e(function(t,r){return r[t]})},function(t,r,n){"use strict";t.exports.compose=function(){for(var t=arguments.length,r=Array(t),n=0;n<t;n++)r[n]=arguments[n];return r.length<1?console.log("Compose: No function was provided."):r.reduce(function(t,r){return function(){return t(r.apply(void 0,arguments))}})}},function(t,r,n){"use strict";var e=n(0).curry,o=function(t){return"function"==typeof t?t():t},u=e(function(t,r){return o(r in t?t[r]:t.default)});t.exports.switch=u}]);