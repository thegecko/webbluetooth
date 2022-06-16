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
exports.BluetoothRemoteGATTServer = void 0;
var helpers_1 = require("./helpers");
var adapter_1 = require("./adapter");
var service_1 = require("./service");
var events_1 = require("./events");
/**
 * Bluetooth Remote GATT Server class
 */
var BluetoothRemoteGATTServer = /** @class */ (function () {
    /**
     * Server constructor
     * @param device Device the gatt server relates to
     */
    function BluetoothRemoteGATTServer(device) {
        /**
         * The device the gatt server is related to
         */
        this.device = undefined;
        this._connected = false;
        this.handle = undefined;
        this.services = undefined;
        this.device = device;
        this.handle = this.device.id;
    }
    Object.defineProperty(BluetoothRemoteGATTServer.prototype, "connected", {
        /**
         * Whether the gatt server is connected
         */
        get: function () {
            return this._connected;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Connect the gatt server
     * @returns Promise containing the gatt server
     */
    BluetoothRemoteGATTServer.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.connected) {
                            throw new Error('connect error: device already connected');
                        }
                        return [4 /*yield*/, adapter_1.adapter.connect(this.handle, function () {
                                _this.services = undefined;
                                _this._connected = false;
                                _this.device.dispatchEvent(new events_1.DOMEvent(_this.device, 'gattserverdisconnected'));
                                _this.device._bluetooth.dispatchEvent(new events_1.DOMEvent(_this.device, 'gattserverdisconnected'));
                            })];
                    case 1:
                        _a.sent();
                        this._connected = true;
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Disconnect the gatt server
     */
    BluetoothRemoteGATTServer.prototype.disconnect = function () {
        adapter_1.adapter.disconnect(this.handle);
        this._connected = false;
    };
    /**
     * Gets a single primary service contained in the gatt server
     * @param service service UUID
     * @returns Promise containing the service
     */
    BluetoothRemoteGATTServer.prototype.getPrimaryService = function (service) {
        return __awaiter(this, void 0, void 0, function () {
            var services;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected) {
                            throw new Error('getPrimaryService error: device not connected');
                        }
                        if (!service) {
                            throw new Error('getPrimaryService error: no service specified');
                        }
                        return [4 /*yield*/, this.getPrimaryServices(service)];
                    case 1:
                        services = _a.sent();
                        if (services.length !== 1) {
                            throw new Error('getPrimaryService error: service not found');
                        }
                        return [2 /*return*/, services[0]];
                }
            });
        });
    };
    /**
     * Gets a list of primary services contained in the gatt server
     * @param service service UUID
     * @returns Promise containing an array of services
     */
    BluetoothRemoteGATTServer.prototype.getPrimaryServices = function (service) {
        return __awaiter(this, void 0, void 0, function () {
            var services, filtered;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected) {
                            throw new Error('getPrimaryServices error: device not connected');
                        }
                        if (!!this.services) return [3 /*break*/, 2];
                        return [4 /*yield*/, adapter_1.adapter.discoverServices(this.handle, this.device._allowedServices)];
                    case 1:
                        services = _a.sent();
                        this.services = services.map(function (serviceInfo) {
                            Object.assign(serviceInfo, {
                                device: _this.device
                            });
                            return new service_1.BluetoothRemoteGATTService(serviceInfo);
                        });
                        _a.label = 2;
                    case 2:
                        if (!service) {
                            return [2 /*return*/, this.services];
                        }
                        filtered = this.services.filter(function (serviceObject) { return serviceObject.uuid === helpers_1.getServiceUUID(service); });
                        if (filtered.length !== 1) {
                            throw new Error('getPrimaryServices error: service not found');
                        }
                        return [2 /*return*/, filtered];
                }
            });
        });
    };
    return BluetoothRemoteGATTServer;
}());
exports.BluetoothRemoteGATTServer = BluetoothRemoteGATTServer;
//# sourceMappingURL=server.js.map