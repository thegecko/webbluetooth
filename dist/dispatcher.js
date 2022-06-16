"use strict";
/*
* Node Web Bluetooth
* Copyright (c) 2019 Rob Moran
*
* The MIT License (MIT)
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = void 0;
var events_1 = require("events");
/**
 * @hidden
 */
var EventDispatcher = /** @class */ (function (_super) {
    __extends(EventDispatcher, _super);
    function EventDispatcher() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isEventListenerObject = function (listener) { return listener.handleEvent !== undefined; };
        return _this;
    }
    EventDispatcher.prototype.addEventListener = function (type, listener) {
        if (listener) {
            var handler = this.isEventListenerObject(listener) ? listener.handleEvent : listener;
            _super.prototype.addListener.call(this, type, handler);
        }
    };
    EventDispatcher.prototype.removeEventListener = function (type, callback) {
        if (callback) {
            var handler = this.isEventListenerObject(callback) ? callback.handleEvent : callback;
            _super.prototype.removeListener.call(this, type, handler);
        }
    };
    EventDispatcher.prototype.dispatchEvent = function (event) {
        return _super.prototype.emit.call(this, event.type, event);
    };
    return EventDispatcher;
}(events_1.EventEmitter));
exports.EventDispatcher = EventDispatcher;
//# sourceMappingURL=dispatcher.js.map