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
exports.BluetoothRemoteGATTCharacteristic = void 0;
var dispatcher_1 = require("./dispatcher");
var descriptor_1 = require("./descriptor");
var helpers_1 = require("./helpers");
var adapter_1 = require("./adapter");
var events_1 = require("./events");
var isView = function (source) { return source.buffer !== undefined; };
/**
 * Bluetooth Remote GATT Characteristic class
 */
var BluetoothRemoteGATTCharacteristic = /** @class */ (function (_super) {
    __extends(BluetoothRemoteGATTCharacteristic, _super);
    /**
     * Characteristic constructor
     * @param init A partial class to initialise values
     */
    function BluetoothRemoteGATTCharacteristic(init) {
        var _this = _super.call(this) || this;
        /**
         * The service the characteristic is related to
         */
        _this.service = undefined;
        /**
         * The unique identifier of the characteristic
         */
        _this.uuid = undefined;
        _this._value = undefined;
        _this.handle = undefined;
        _this.descriptors = undefined;
        _this.service = init.service;
        _this.uuid = init.uuid;
        _this.properties = init.properties;
        _this._value = init.value;
        _this.handle = _this.uuid;
        return _this;
    }
    Object.defineProperty(BluetoothRemoteGATTCharacteristic.prototype, "value", {
        /**
         * The value of the characteristic
         */
        get: function () {
            return this._value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BluetoothRemoteGATTCharacteristic.prototype, "oncharacteristicvaluechanged", {
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
    BluetoothRemoteGATTCharacteristic.prototype.setValue = function (value, emit) {
        this._value = value;
        if (emit) {
            this.dispatchEvent(new events_1.DOMEvent(this, 'characteristicvaluechanged'));
            this.service.dispatchEvent(new events_1.DOMEvent(this, 'characteristicvaluechanged'));
            this.service.device.dispatchEvent(new events_1.DOMEvent(this, 'characteristicvaluechanged'));
            this.service.device._bluetooth.dispatchEvent(new events_1.DOMEvent(this, 'characteristicvaluechanged'));
        }
    };
    /**
     * Gets a single characteristic descriptor
     * @param descriptor descriptor UUID
     * @returns Promise containing the descriptor
     */
    BluetoothRemoteGATTCharacteristic.prototype.getDescriptor = function (descriptor) {
        return __awaiter(this, void 0, void 0, function () {
            var descriptors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service.device.gatt.connected) {
                            throw new Error('getDescriptor error: device not connected');
                        }
                        if (!descriptor) {
                            throw new Error('getDescriptor error: no descriptor specified');
                        }
                        return [4 /*yield*/, this.getDescriptors(descriptor)];
                    case 1:
                        descriptors = _a.sent();
                        if (descriptors.length !== 1) {
                            throw new Error('getDescriptor error: descriptor not found');
                        }
                        return [2 /*return*/, descriptors[0]];
                }
            });
        });
    };
    /**
     * Gets a list of the characteristic's descriptors
     * @param descriptor descriptor UUID
     * @returns Promise containing an array of descriptors
     */
    BluetoothRemoteGATTCharacteristic.prototype.getDescriptors = function (descriptor) {
        return __awaiter(this, void 0, void 0, function () {
            var descriptors, filtered;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service.device.gatt.connected) {
                            throw new Error('getDescriptors error: device not connected');
                        }
                        if (!!this.descriptors) return [3 /*break*/, 2];
                        return [4 /*yield*/, adapter_1.adapter.discoverDescriptors(this.handle)];
                    case 1:
                        descriptors = _a.sent();
                        this.descriptors = descriptors.map(function (descriptorInfo) {
                            Object.assign(descriptorInfo, {
                                characteristic: _this
                            });
                            return new descriptor_1.BluetoothRemoteGATTDescriptor(descriptorInfo);
                        });
                        _a.label = 2;
                    case 2:
                        if (!descriptor) {
                            return [2 /*return*/, this.descriptors];
                        }
                        filtered = this.descriptors.filter(function (descriptorObject) { return descriptorObject.uuid === helpers_1.getDescriptorUUID(descriptor); });
                        if (filtered.length !== 1) {
                            throw new Error('getDescriptors error: descriptor not found');
                        }
                        return [2 /*return*/, filtered];
                }
            });
        });
    };
    /**
     * Gets the value of the characteristic
     * @returns Promise containing the value
     */
    BluetoothRemoteGATTCharacteristic.prototype.readValue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dataView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service.device.gatt.connected) {
                            throw new Error('readValue error: device not connected');
                        }
                        return [4 /*yield*/, adapter_1.adapter.readCharacteristic(this.handle)];
                    case 1:
                        dataView = _a.sent();
                        this.setValue(dataView, true);
                        return [2 /*return*/, dataView];
                }
            });
        });
    };
    /**
     * Updates the value of the characteristic
     * @param value The value to write
     */
    BluetoothRemoteGATTCharacteristic.prototype.writeValue = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var arrayBuffer, dataView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service.device.gatt.connected) {
                            throw new Error('writeValue error: device not connected');
                        }
                        arrayBuffer = isView(value) ? value.buffer : value;
                        dataView = new DataView(arrayBuffer);
                        return [4 /*yield*/, adapter_1.adapter.writeCharacteristic(this.handle, dataView)];
                    case 1:
                        _a.sent();
                        this.setValue(dataView);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates the value of the characteristic and waits for a response
     * @param value The value to write
     */
    BluetoothRemoteGATTCharacteristic.prototype.writeValueWithResponse = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var arrayBuffer, dataView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service.device.gatt.connected) {
                            throw new Error('writeValue error: device not connected');
                        }
                        arrayBuffer = isView(value) ? value.buffer : value;
                        dataView = new DataView(arrayBuffer);
                        return [4 /*yield*/, adapter_1.adapter.writeCharacteristic(this.handle, dataView, false)];
                    case 1:
                        _a.sent();
                        this.setValue(dataView);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates the value of the characteristic without waiting for a response
     * @param value The value to write
     */
    BluetoothRemoteGATTCharacteristic.prototype.writeValueWithoutResponse = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var arrayBuffer, dataView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service.device.gatt.connected) {
                            throw new Error('writeValue error: device not connected');
                        }
                        arrayBuffer = isView(value) ? value.buffer : value;
                        dataView = new DataView(arrayBuffer);
                        return [4 /*yield*/, adapter_1.adapter.writeCharacteristic(this.handle, dataView, true)];
                    case 1:
                        _a.sent();
                        this.setValue(dataView);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start notifications of changes for the characteristic
     * @returns Promise containing the characteristic
     */
    BluetoothRemoteGATTCharacteristic.prototype.startNotifications = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service.device.gatt.connected) {
                            throw new Error('startNotifications error: device not connected');
                        }
                        return [4 /*yield*/, adapter_1.adapter.enableNotify(this.handle, function (dataView) {
                                _this.setValue(dataView, true);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Stop notifications of changes for the characteristic
     * @returns Promise containing the characteristic
     */
    BluetoothRemoteGATTCharacteristic.prototype.stopNotifications = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.service.device.gatt.connected) {
                            throw new Error('stopNotifications error: device not connected');
                        }
                        return [4 /*yield*/, adapter_1.adapter.disableNotify(this.handle)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    return BluetoothRemoteGATTCharacteristic;
}(dispatcher_1.EventDispatcher));
exports.BluetoothRemoteGATTCharacteristic = BluetoothRemoteGATTCharacteristic;
//# sourceMappingURL=characteristic.js.map