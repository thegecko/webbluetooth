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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.BluetoothRemoteGATTService = void 0;
var dispatcher_1 = require("./dispatcher");
var characteristic_1 = require("./characteristic");
var helpers_1 = require("./helpers");
var adapters_1 = require("./adapters");
var events_1 = require("./events");
/**
 * Bluetooth Remote GATT Service class
 */
var BluetoothRemoteGATTService = /** @class */ (function (_super) {
    __extends(BluetoothRemoteGATTService, _super);
    /**
     * Service constructor
     * @param init A partial class to initialise values
     */
    function BluetoothRemoteGATTService(init) {
        var _this = _super.call(this) || this;
        /**
         * The device the service is related to
         */
        _this.device = undefined;
        /**
         * The unique identifier of the service
         */
        _this.uuid = undefined;
        /**
         * Whether the service is a primary one
         */
        _this.isPrimary = false;
        _this.handle = undefined;
        _this.services = undefined;
        _this.characteristics = undefined;
        _this.device = init.device;
        _this.uuid = init.uuid;
        _this.isPrimary = init.isPrimary;
        _this.handle = _this.uuid;
        _this.dispatchEvent(new events_1.DOMEvent(_this, 'serviceadded'));
        _this.device.dispatchEvent(new events_1.DOMEvent(_this, 'serviceadded'));
        _this.device._bluetooth.dispatchEvent(new events_1.DOMEvent(_this, 'serviceadded'));
        return _this;
    }
    Object.defineProperty(BluetoothRemoteGATTService.prototype, "oncharacteristicvaluechanged", {
        set: function (fn) {
            if (this._oncharacteristicvaluechanged) {
                this.removeEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
            }
            this._oncharacteristicvaluechanged = fn;
            this.addEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BluetoothRemoteGATTService.prototype, "onserviceadded", {
        set: function (fn) {
            if (this._onserviceadded) {
                this.removeEventListener('serviceadded', this._onserviceadded);
            }
            this._onserviceadded = fn;
            this.addEventListener('serviceadded', this._onserviceadded);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BluetoothRemoteGATTService.prototype, "onservicechanged", {
        set: function (fn) {
            if (this._onservicechanged) {
                this.removeEventListener('servicechanged', this._onservicechanged);
            }
            this._onservicechanged = fn;
            this.addEventListener('servicechanged', this._onservicechanged);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BluetoothRemoteGATTService.prototype, "onserviceremoved", {
        set: function (fn) {
            if (this._onserviceremoved) {
                this.removeEventListener('serviceremoved', this._onserviceremoved);
            }
            this._onserviceremoved = fn;
            this.addEventListener('serviceremoved', this._onserviceremoved);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets a single characteristic contained in the service
     * @param characteristic characteristic UUID
     * @returns Promise containing the characteristic
     */
    BluetoothRemoteGATTService.prototype.getCharacteristic = function (characteristic) {
        return __awaiter(this, void 0, void 0, function () {
            var characteristics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.device.gatt.connected) {
                            throw new Error('getCharacteristic error: device not connected');
                        }
                        if (!characteristic) {
                            throw new Error('getCharacteristic error: no characteristic specified');
                        }
                        return [4 /*yield*/, this.getCharacteristics(characteristic)];
                    case 1:
                        characteristics = _a.sent();
                        if (characteristics.length !== 1) {
                            throw new Error('getCharacteristic error: characteristic not found');
                        }
                        return [2 /*return*/, characteristics[0]];
                }
            });
        });
    };
    /**
     * Gets a list of characteristics contained in the service
     * @param characteristic characteristic UUID
     * @returns Promise containing an array of characteristics
     */
    BluetoothRemoteGATTService.prototype.getCharacteristics = function (characteristic) {
        return __awaiter(this, void 0, void 0, function () {
            var characteristics, filtered;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.device.gatt.connected) {
                            throw new Error('getCharacteristics error: device not connected');
                        }
                        if (!!this.characteristics) return [3 /*break*/, 2];
                        return [4 /*yield*/, adapters_1.adapter.discoverCharacteristics(this.handle)];
                    case 1:
                        characteristics = _a.sent();
                        this.characteristics = characteristics.map(function (characteristicInfo) {
                            Object.assign(characteristicInfo, {
                                service: _this
                            });
                            return new characteristic_1.BluetoothRemoteGATTCharacteristic(characteristicInfo);
                        });
                        _a.label = 2;
                    case 2:
                        if (!characteristic) {
                            return [2 /*return*/, this.characteristics];
                        }
                        // Canonical-ize characteristic
                        characteristic = (0, helpers_1.getCharacteristicUUID)(characteristic);
                        filtered = this.characteristics.filter(function (characteristicObject) { return characteristicObject.uuid === characteristic; });
                        if (filtered.length !== 1) {
                            throw new Error('getCharacteristics error: characteristic not found');
                        }
                        return [2 /*return*/, filtered];
                }
            });
        });
    };
    /**
     * Gets a single service included in the service
     * @param service service UUID
     * @returns Promise containing the service
     */
    BluetoothRemoteGATTService.prototype.getIncludedService = function (service) {
        return __awaiter(this, void 0, void 0, function () {
            var services;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.device.gatt.connected) {
                            throw new Error('getIncludedService error: device not connected');
                        }
                        if (!service) {
                            throw new Error('getIncludedService error: no service specified');
                        }
                        return [4 /*yield*/, this.getIncludedServices(service)];
                    case 1:
                        services = _a.sent();
                        if (services.length !== 1) {
                            throw new Error('getIncludedService error: service not found');
                        }
                        return [2 /*return*/, services[0]];
                }
            });
        });
    };
    /**
     * Gets a list of services included in the service
     * @param service service UUID
     * @returns Promise containing an array of services
     */
    BluetoothRemoteGATTService.prototype.getIncludedServices = function (service) {
        return __awaiter(this, void 0, void 0, function () {
            var services, filtered;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.device.gatt.connected) {
                            throw new Error('getIncludedServices error: device not connected');
                        }
                        if (!!this.services) return [3 /*break*/, 2];
                        return [4 /*yield*/, adapters_1.adapter.discoverIncludedServices(this.handle, this.device._allowedServices)];
                    case 1:
                        services = _a.sent();
                        this.services = services.map(function (serviceInfo) {
                            Object.assign(serviceInfo, {
                                device: _this.device
                            });
                            return new BluetoothRemoteGATTService(serviceInfo);
                        });
                        _a.label = 2;
                    case 2:
                        if (!service) {
                            return [2 /*return*/, this.services];
                        }
                        filtered = this.services.filter(function (serviceObject) { return serviceObject.uuid === (0, helpers_1.getServiceUUID)(service); });
                        if (filtered.length !== 1) {
                            throw new Error('getIncludedServices error: service not found');
                        }
                        return [2 /*return*/, filtered];
                }
            });
        });
    };
    return BluetoothRemoteGATTService;
}(dispatcher_1.EventDispatcher));
exports.BluetoothRemoteGATTService = BluetoothRemoteGATTService;
//# sourceMappingURL=service.js.map