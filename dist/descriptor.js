"use strict";
/*
* Node Web Bluetooth
* Copyright (c) 2017 Rob Moran
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BluetoothRemoteGATTDescriptor = void 0;
var adapter_1 = require("./adapter");
/**
 * Bluetooth Remote GATT Descriptor class
 */
var BluetoothRemoteGATTDescriptor = /** @class */ (function () {
    /**
     * Descriptor constructor
     * @param init A partial class to initialise values
     */
    function BluetoothRemoteGATTDescriptor(init) {
        /**
         * The characteristic the descriptor is related to
         */
        this.characteristic = undefined;
        /**
         * The unique identifier of the descriptor
         */
        this.uuid = undefined;
        this._value = undefined;
        this.handle = undefined;
        this.characteristic = init.characteristic;
        this.uuid = init.uuid;
        this._value = init.value;
        this.handle = this.characteristic.uuid + "-" + this.uuid;
    }
    Object.defineProperty(BluetoothRemoteGATTDescriptor.prototype, "value", {
        /**
         * The value of the descriptor
         */
        get: function () {
            return this._value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the value of the descriptor
     * @returns Promise containing the value
     */
    BluetoothRemoteGATTDescriptor.prototype.readValue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dataView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.characteristic.service.device.gatt.connected) {
                            throw new Error('readValue error: device not connected');
                        }
                        return [4 /*yield*/, adapter_1.adapter.readDescriptor(this.handle)];
                    case 1:
                        dataView = _a.sent();
                        this._value = dataView;
                        return [2 /*return*/, dataView];
                }
            });
        });
    };
    /**
     * Updates the value of the descriptor
     * @param value The value to write
     */
    BluetoothRemoteGATTDescriptor.prototype.writeValue = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var isView, arrayBuffer, dataView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.characteristic.service.device.gatt.connected) {
                            throw new Error('writeValue error: device not connected');
                        }
                        isView = function (source) { return source.buffer !== undefined; };
                        arrayBuffer = isView(value) ? value.buffer : value;
                        dataView = new DataView(arrayBuffer);
                        return [4 /*yield*/, adapter_1.adapter.writeDescriptor(this.handle, dataView)];
                    case 1:
                        _a.sent();
                        this._value = dataView;
                        return [2 /*return*/];
                }
            });
        });
    };
    return BluetoothRemoteGATTDescriptor;
}());
exports.BluetoothRemoteGATTDescriptor = BluetoothRemoteGATTDescriptor;
//# sourceMappingURL=descriptor.js.map