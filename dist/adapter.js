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
exports.adapter = exports.NobleAdapter = void 0;
var os_1 = require("os");
var events_1 = require("events");
var helpers_1 = require("./helpers");
var noble = require("@abandonware/noble");
/**
 * @hidden
 */
var NobleAdapter = /** @class */ (function (_super) {
    __extends(NobleAdapter, _super);
    function NobleAdapter() {
        var _this = _super.call(this) || this;
        _this.deviceHandles = new Map();
        _this.serviceHandles = new Map();
        _this.characteristicHandles = new Map();
        _this.descriptorHandles = new Map();
        _this.charNotifies = new Map();
        _this.initialised = false;
        _this.enabled = false;
        _this.os = os_1.platform();
        _this.enabled = _this.state;
        noble.on('stateChange', function () {
            if (_this.enabled !== _this.state) {
                _this.enabled = _this.state;
                _this.emit(NobleAdapter.EVENT_ENABLED, _this.enabled);
            }
        });
        return _this;
    }
    Object.defineProperty(NobleAdapter.prototype, "state", {
        get: function () {
            return (noble.state === 'poweredOn');
        },
        enumerable: false,
        configurable: true
    });
    NobleAdapter.prototype.init = function () {
        var _this = this;
        if (this.initialised) {
            return;
        }
        noble.on('discover', function (deviceInfo) {
            if (_this.discoverFn)
                _this.discoverFn(deviceInfo);
        });
        this.initialised = true;
    };
    NobleAdapter.prototype.bufferToDataView = function (buffer) {
        // Buffer to ArrayBuffer
        var arrayBuffer = new Uint8Array(buffer).buffer;
        return new DataView(arrayBuffer);
    };
    NobleAdapter.prototype.dataViewToBuffer = function (dataView) {
        // DataView to TypedArray
        var typedArray = new Uint8Array(dataView.buffer);
        return new Buffer(typedArray);
    };
    NobleAdapter.prototype.validDevice = function (deviceInfo, serviceUUIDs) {
        if (serviceUUIDs.length === 0) {
            // Match any device
            return true;
        }
        if (!deviceInfo.advertisement.serviceUuids) {
            // No advertised services, no match
            return false;
        }
        var advertisedUUIDs = deviceInfo.advertisement.serviceUuids.map(function (serviceUUID) {
            return helpers_1.getCanonicalUUID(serviceUUID);
        });
        return serviceUUIDs.some(function (serviceUUID) {
            // An advertised UUID matches our search UUIDs
            return (advertisedUUIDs.indexOf(serviceUUID) >= 0);
        });
    };
    NobleAdapter.prototype.deviceToBluetoothDevice = function (deviceInfo) {
        var deviceID = (deviceInfo.address && deviceInfo.address !== 'unknown') ? deviceInfo.address : deviceInfo.id;
        var serviceUUIDs = deviceInfo.advertisement.serviceUuids ? deviceInfo.advertisement.serviceUuids.map(function (serviceUUID) { return helpers_1.getCanonicalUUID(serviceUUID); }) : [];
        var manufacturerData = new Map();
        if (deviceInfo.advertisement.manufacturerData) {
            // First 2 bytes are 16-bit company identifier
            var company = deviceInfo.advertisement.manufacturerData.readUInt16LE(0);
            // Remove company ID
            var buffer = deviceInfo.advertisement.manufacturerData.slice(2);
            manufacturerData.set(('0000' + company.toString(16)).slice(-4), this.bufferToDataView(buffer));
        }
        var serviceData = new Map();
        if (deviceInfo.advertisement.serviceData) {
            for (var _i = 0, _a = deviceInfo.advertisement.serviceData; _i < _a.length; _i++) {
                var serviceAdvert = _a[_i];
                serviceData.set(helpers_1.getCanonicalUUID(serviceAdvert.uuid), this.bufferToDataView(serviceAdvert.data));
            }
        }
        return {
            id: deviceID,
            name: deviceInfo.advertisement.localName,
            _serviceUUIDs: serviceUUIDs,
            adData: {
                rssi: deviceInfo.rssi,
                txPower: deviceInfo.advertisement.txPowerLevel,
                serviceData: serviceData,
                manufacturerData: manufacturerData
            }
        };
    };
    NobleAdapter.prototype.getEnabled = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (noble.state === 'unknown' || noble.state === 'poweredOff') {
                    return [2 /*return*/, new Promise(function (resolve) { return noble.once('stateChange', function () { return resolve(_this.state); }); })];
                }
                return [2 /*return*/, this.state];
            });
        });
    };
    NobleAdapter.prototype.startScan = function (serviceUUIDs, foundFn) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.discoverFn = function (deviceInfo) {
                            if (_this.validDevice(deviceInfo, serviceUUIDs)) {
                                var device = _this.deviceToBluetoothDevice(deviceInfo);
                                if (!_this.deviceHandles.has(device.id)) {
                                    _this.deviceHandles.set(device.id, deviceInfo);
                                    // Only call the found function the first time we find a valid device
                                    foundFn(device);
                                }
                            }
                        };
                        this.init();
                        this.deviceHandles.clear();
                        if (!(noble.state === 'unknown' || noble.state === 'poweredOff')) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) { return noble.once('stateChange', function () { return resolve(undefined); }); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (this.state === false) {
                            throw new Error('adapter not enabled');
                        }
                        // Noble doesn't correctly match short and canonical UUIDs on Linux, so we need to check ourselves
                        // Continually scan to pick up all advertised UUIDs
                        return [4 /*yield*/, noble.startScanningAsync([], true)];
                    case 3:
                        // Noble doesn't correctly match short and canonical UUIDs on Linux, so we need to check ourselves
                        // Continually scan to pick up all advertised UUIDs
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NobleAdapter.prototype.stopScan = function (_errorFn) {
        this.discoverFn = undefined;
        noble.stopScanning();
    };
    NobleAdapter.prototype.connect = function (handle, disconnectFn) {
        var _this = this;
        var baseDevice = this.deviceHandles.get(handle);
        baseDevice.removeAllListeners('connect');
        baseDevice.removeAllListeners('disconnect');
        if (disconnectFn) {
            baseDevice.once('disconnect', function () {
                _this.serviceHandles.clear();
                _this.characteristicHandles.clear();
                _this.descriptorHandles.clear();
                _this.charNotifies.clear();
                disconnectFn();
            });
        }
        return baseDevice.connectAsync();
    };
    NobleAdapter.prototype.disconnect = function (handle) {
        var baseDevice = this.deviceHandles.get(handle);
        return baseDevice.disconnectAsync();
    };
    NobleAdapter.prototype.discoverServices = function (handle, serviceUUIDs) {
        return __awaiter(this, void 0, void 0, function () {
            var baseDevice, services, discovered, _i, services_1, serviceInfo, serviceUUID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseDevice = this.deviceHandles.get(handle);
                        return [4 /*yield*/, baseDevice.discoverServicesAsync()];
                    case 1:
                        services = _a.sent();
                        discovered = [];
                        for (_i = 0, services_1 = services; _i < services_1.length; _i++) {
                            serviceInfo = services_1[_i];
                            serviceUUID = helpers_1.getCanonicalUUID(serviceInfo.uuid);
                            if (!serviceUUIDs || serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceUUID) >= 0) {
                                if (!this.serviceHandles.has(serviceUUID)) {
                                    this.serviceHandles.set(serviceUUID, serviceInfo);
                                }
                                discovered.push({
                                    uuid: serviceUUID,
                                    primary: true
                                });
                            }
                        }
                        return [2 /*return*/, discovered];
                }
            });
        });
    };
    NobleAdapter.prototype.discoverIncludedServices = function (handle, serviceUUIDs) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceInfo, services, discovered, _i, services_2, service, serviceUUID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serviceInfo = this.serviceHandles.get(handle);
                        return [4 /*yield*/, serviceInfo.discoverIncludedServicesAsync()];
                    case 1:
                        services = _a.sent();
                        discovered = [];
                        // TODO: check retiurn here!
                        for (_i = 0, services_2 = services; _i < services_2.length; _i++) {
                            service = services_2[_i];
                            serviceUUID = helpers_1.getCanonicalUUID(service);
                            if (!serviceUUIDs || serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceUUID) >= 0) {
                                /*
                                if (!this.serviceHandles.has(serviceUUID)) {
                                    this.serviceHandles.set(serviceUUID, service);
                                }
                                */
                                discovered.push({
                                    uuid: serviceUUID,
                                    primary: false
                                });
                            }
                        }
                        return [2 /*return*/, discovered];
                }
            });
        });
    };
    NobleAdapter.prototype.discoverCharacteristics = function (handle, characteristicUUIDs) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceInfo, characteristics, discovered, _loop_1, this_1, _i, characteristics_1, characteristicInfo;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serviceInfo = this.serviceHandles.get(handle);
                        return [4 /*yield*/, serviceInfo.discoverCharacteristicsAsync()];
                    case 1:
                        characteristics = _a.sent();
                        discovered = [];
                        _loop_1 = function (characteristicInfo) {
                            var charUUID = helpers_1.getCanonicalUUID(characteristicInfo.uuid);
                            if (!characteristicUUIDs || characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(charUUID) >= 0) {
                                if (!this_1.characteristicHandles.has(charUUID)) {
                                    this_1.characteristicHandles.set(charUUID, characteristicInfo);
                                }
                                discovered.push({
                                    uuid: charUUID,
                                    properties: {
                                        broadcast: (characteristicInfo.properties.indexOf('broadcast') >= 0),
                                        read: (characteristicInfo.properties.indexOf('read') >= 0),
                                        writeWithoutResponse: (characteristicInfo.properties.indexOf('writeWithoutResponse') >= 0),
                                        write: (characteristicInfo.properties.indexOf('write') >= 0),
                                        notify: (characteristicInfo.properties.indexOf('notify') >= 0),
                                        indicate: (characteristicInfo.properties.indexOf('indicate') >= 0),
                                        authenticatedSignedWrites: (characteristicInfo.properties.indexOf('authenticatedSignedWrites') >= 0),
                                        reliableWrite: (characteristicInfo.properties.indexOf('reliableWrite') >= 0),
                                        writableAuxiliaries: (characteristicInfo.properties.indexOf('writableAuxiliaries') >= 0)
                                    }
                                });
                                characteristicInfo.on('data', function (data, isNotification) {
                                    if (isNotification === true && _this.charNotifies.has(charUUID)) {
                                        var dataView = _this.bufferToDataView(data);
                                        _this.charNotifies.get(charUUID)(dataView);
                                    }
                                });
                            }
                        };
                        this_1 = this;
                        for (_i = 0, characteristics_1 = characteristics; _i < characteristics_1.length; _i++) {
                            characteristicInfo = characteristics_1[_i];
                            _loop_1(characteristicInfo);
                        }
                        return [2 /*return*/, discovered];
                }
            });
        });
    };
    NobleAdapter.prototype.discoverDescriptors = function (handle, descriptorUUIDs) {
        return __awaiter(this, void 0, void 0, function () {
            var characteristicInfo, descriptors, discovered, _i, descriptors_1, descriptorInfo, descUUID, descHandle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        characteristicInfo = this.characteristicHandles.get(handle);
                        return [4 /*yield*/, characteristicInfo.discoverDescriptorsAsync()];
                    case 1:
                        descriptors = _a.sent();
                        discovered = [];
                        for (_i = 0, descriptors_1 = descriptors; _i < descriptors_1.length; _i++) {
                            descriptorInfo = descriptors_1[_i];
                            descUUID = helpers_1.getCanonicalUUID(descriptorInfo.uuid);
                            if (!descriptorUUIDs || descriptorUUIDs.length === 0 || descriptorUUIDs.indexOf(descUUID) >= 0) {
                                descHandle = characteristicInfo.uuid + '-' + descriptorInfo.uuid;
                                if (!this.descriptorHandles.has(descHandle)) {
                                    this.descriptorHandles.set(descHandle, descriptorInfo);
                                }
                                discovered.push({
                                    uuid: descUUID
                                });
                            }
                        }
                        return [2 /*return*/, discovered];
                }
            });
        });
    };
    NobleAdapter.prototype.readCharacteristic = function (handle) {
        return __awaiter(this, void 0, void 0, function () {
            var characteristic, data, dataView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        characteristic = this.characteristicHandles.get(handle);
                        return [4 /*yield*/, characteristic.readAsync()];
                    case 1:
                        data = _a.sent();
                        dataView = this.bufferToDataView(data);
                        return [2 /*return*/, dataView];
                }
            });
        });
    };
    NobleAdapter.prototype.writeCharacteristic = function (handle, value, withoutResponse) {
        if (withoutResponse === void 0) { withoutResponse = false; }
        return __awaiter(this, void 0, void 0, function () {
            var buffer, characteristic;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        buffer = this.dataViewToBuffer(value);
                        characteristic = this.characteristicHandles.get(handle);
                        if (withoutResponse === undefined) {
                            // writeWithoutResponse and authenticatedSignedWrites don't require a response
                            withoutResponse = characteristic.properties.indexOf('writeWithoutResponse') >= 0
                                || characteristic.properties.indexOf('authenticatedSignedWrites') >= 0;
                        }
                        return [4 /*yield*/, characteristic.writeAsync(buffer, withoutResponse)];
                    case 1:
                        _a.sent();
                        if (!(this.os !== 'darwin' && withoutResponse)) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 25); })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    NobleAdapter.prototype.enableNotify = function (handle, notifyFn) {
        var _this = this;
        if (this.charNotifies.has(handle)) {
            this.charNotifies.set(handle, notifyFn);
            return Promise.resolve();
        }
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var characteristic;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        characteristic = this.characteristicHandles.get(handle);
                        // TODO: check type emitted
                        characteristic.once('notify', function (state) {
                            if (state !== 'true') {
                                reject('notify failed to enable');
                            }
                            _this.charNotifies.set(handle, notifyFn);
                            resolve(undefined);
                        });
                        return [4 /*yield*/, characteristic.notifyAsync(true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    NobleAdapter.prototype.disableNotify = function (handle) {
        var _this = this;
        if (!this.charNotifies.has(handle)) {
            return Promise.resolve();
        }
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var characteristic;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        characteristic = this.characteristicHandles.get(handle);
                        // TODO: check type emitted
                        characteristic.once('notify', function (state) {
                            if (state !== 'false') {
                                reject('notify failed to disable');
                            }
                            if (_this.charNotifies.has(handle)) {
                                _this.charNotifies.delete(handle);
                            }
                            resolve(undefined);
                        });
                        return [4 /*yield*/, characteristic.notifyAsync(false)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    NobleAdapter.prototype.readDescriptor = function (handle) {
        return __awaiter(this, void 0, void 0, function () {
            var data, dataView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.descriptorHandles.get(handle).readValueAsync()];
                    case 1:
                        data = _a.sent();
                        dataView = this.bufferToDataView(data);
                        return [2 /*return*/, dataView];
                }
            });
        });
    };
    NobleAdapter.prototype.writeDescriptor = function (handle, value) {
        var buffer = this.dataViewToBuffer(value);
        return this.descriptorHandles.get(handle).writeValueAsync(buffer);
    };
    NobleAdapter.EVENT_ENABLED = 'enabledchanged';
    return NobleAdapter;
}(events_1.EventEmitter));
exports.NobleAdapter = NobleAdapter;
/**
 * @hidden
 */
exports.adapter = new NobleAdapter();
//# sourceMappingURL=adapter.js.map