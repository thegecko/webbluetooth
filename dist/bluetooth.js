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
exports.Bluetooth = void 0;
var dispatcher_1 = require("./dispatcher");
var device_1 = require("./device");
var helpers_1 = require("./helpers");
var adapter_1 = require("./adapter");
var events_1 = require("./events");
/**
 * Bluetooth class
 */
var Bluetooth = /** @class */ (function (_super) {
    __extends(Bluetooth, _super);
    /**
     * Bluetooth constructor
     * @param options Bluetooth initialisation options
     */
    function Bluetooth(options) {
        var _this = _super.call(this) || this;
        _this.deviceFound = undefined;
        _this.scanTime = 10.24 * 1000;
        _this.scanner = undefined;
        options = options || {};
        _this.referringDevice = options.referringDevice;
        _this.deviceFound = options.deviceFound;
        if (options.scanTime)
            _this.scanTime = options.scanTime * 1000;
        adapter_1.adapter.on(adapter_1.NobleAdapter.EVENT_ENABLED, function (_value) {
            _this.dispatchEvent(new events_1.DOMEvent(_this, 'availabilitychanged'));
        });
        return _this;
    }
    Object.defineProperty(Bluetooth.prototype, "oncharacteristicvaluechanged", {
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
    Object.defineProperty(Bluetooth.prototype, "onserviceadded", {
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
    Object.defineProperty(Bluetooth.prototype, "onservicechanged", {
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
    Object.defineProperty(Bluetooth.prototype, "onserviceremoved", {
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
    Object.defineProperty(Bluetooth.prototype, "ongattserverdisconnected", {
        set: function (fn) {
            if (this._ongattserverdisconnected) {
                this.removeEventListener('gattserverdisconnected', this._ongattserverdisconnected);
            }
            this._ongattserverdisconnected = fn;
            this.addEventListener('gattserverdisconnected', this._ongattserverdisconnected);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bluetooth.prototype, "onadvertisementreceived", {
        set: function (fn) {
            if (this._onadvertisementreceived) {
                this.removeEventListener('advertisementreceived', this._onadvertisementreceived);
            }
            this._onadvertisementreceived = fn;
            this.addEventListener('advertisementreceived', this._onadvertisementreceived);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bluetooth.prototype, "onavailabilitychanged", {
        set: function (fn) {
            if (this._onavailabilitychanged) {
                this.removeEventListener('availabilitychanged', this._onavailabilitychanged);
            }
            this._onavailabilitychanged = fn;
            this.addEventListener('availabilitychanged', this._onavailabilitychanged);
        },
        enumerable: false,
        configurable: true
    });
    Bluetooth.prototype.filterDevice = function (filters, deviceInfo, validServices) {
        var valid = false;
        filters.forEach(function (filter) {
            // Name
            if (filter.name && filter.name !== deviceInfo.name)
                return;
            // NamePrefix
            if (filter.namePrefix) {
                if (!deviceInfo.name || filter.namePrefix.length > deviceInfo.name.length)
                    return;
                if (filter.namePrefix !== deviceInfo.name.substr(0, filter.namePrefix.length))
                    return;
            }
            // Services
            if (filter.services) {
                var serviceUUIDs = filter.services.map(helpers_1.getServiceUUID);
                var servicesValid = serviceUUIDs.every(function (serviceUUID) {
                    return (deviceInfo._serviceUUIDs.indexOf(serviceUUID) > -1);
                });
                if (!servicesValid)
                    return;
                validServices = validServices.concat(serviceUUIDs);
            }
            valid = true;
        });
        if (!valid)
            return false;
        return deviceInfo;
    };
    /**
     * Gets the availability of a bluetooth adapter
     * @returns Promise containing a flag indicating bluetooth availability
     */
    Bluetooth.prototype.getAvailability = function () {
        return adapter_1.adapter.getEnabled();
    };
    /**
     * Scans for a device matching optional filters
     * @param options The options to use when scanning
     * @returns Promise containing a device which matches the options
     */
    Bluetooth.prototype.requestDevice = function (options) {
        var _this = this;
        if (options === void 0) { options = { filters: [] }; }
        if (this.scanner !== undefined) {
            throw new Error('requestDevice error: request in progress');
        }
        var isFiltered = function (maybeFiltered) {
            return maybeFiltered.filters !== undefined;
        };
        var isAcceptAll = function (maybeAcceptAll) {
            return maybeAcceptAll.acceptAllDevices === true;
        };
        var searchUUIDs = [];
        if (isFiltered(options)) {
            // Must have a filter
            if (options.filters.length === 0) {
                throw new TypeError('requestDevice error: no filters specified');
            }
            // Don't allow empty filters
            var emptyFilter = options.filters.some(function (filter) {
                return (Object.keys(filter).length === 0);
            });
            if (emptyFilter) {
                throw new TypeError('requestDevice error: empty filter specified');
            }
            // Don't allow empty namePrefix
            var emptyPrefix = options.filters.some(function (filter) {
                return (typeof filter.namePrefix !== 'undefined' && filter.namePrefix === '');
            });
            if (emptyPrefix) {
                throw new TypeError('requestDevice error: empty namePrefix specified');
            }
            options.filters.forEach(function (filter) {
                if (filter.services)
                    searchUUIDs = searchUUIDs.concat(filter.services.map(helpers_1.getServiceUUID));
                // Unique-ify
                searchUUIDs = searchUUIDs.filter(function (item, index, array) {
                    return array.indexOf(item) === index;
                });
            });
        }
        else if (!isAcceptAll(options)) {
            throw new TypeError('requestDevice error: specify filters or acceptAllDevices');
        }
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var found;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        found = false;
                        return [4 /*yield*/, adapter_1.adapter.startScan(searchUUIDs, function (deviceInfo) {
                                var validServices = [];
                                var complete = function (bluetoothDevice) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.cancelRequest()];
                                            case 1:
                                                _a.sent();
                                                resolve(bluetoothDevice);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); };
                                // filter devices if filters specified
                                if (isFiltered(options)) {
                                    deviceInfo = _this.filterDevice(options.filters, deviceInfo, validServices);
                                }
                                if (deviceInfo) {
                                    found = true;
                                    // Add additional services
                                    if (options.optionalServices) {
                                        validServices = validServices.concat(options.optionalServices.map(helpers_1.getServiceUUID));
                                    }
                                    // Set unique list of allowed services
                                    var allowedServices = validServices.filter(function (item, index, array) {
                                        return array.indexOf(item) === index;
                                    });
                                    Object.assign(deviceInfo, {
                                        _bluetooth: _this,
                                        _allowedServices: allowedServices
                                    });
                                    var bluetoothDevice_1 = new device_1.BluetoothDevice(deviceInfo);
                                    var selectFn = function () {
                                        complete.call(_this, bluetoothDevice_1);
                                    };
                                    if (!_this.deviceFound || _this.deviceFound(bluetoothDevice_1, selectFn.bind(_this)) === true) {
                                        // If no deviceFound function, or deviceFound returns true, resolve with this device immediately
                                        complete.call(_this, bluetoothDevice_1);
                                    }
                                }
                            })];
                    case 1:
                        _a.sent();
                        this.scanner = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.cancelRequest()];
                                    case 1:
                                        _a.sent();
                                        if (!found) {
                                            reject('requestDevice error: no devices found');
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }, this.scanTime);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Get all bluetooth devices
     */
    Bluetooth.prototype.getDevices = function () {
        var _this = this;
        if (this.scanner !== undefined) {
            throw new Error('getDevices error: request in progress');
        }
        return new Promise(function (resolve) {
            var devices = [];
            adapter_1.adapter.startScan([], function (deviceInfo) {
                Object.assign(deviceInfo, {
                    _bluetooth: _this,
                    _allowedServices: []
                });
                var bluetoothDevice = new device_1.BluetoothDevice(deviceInfo);
                devices.push(bluetoothDevice);
            });
            _this.scanner = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.cancelRequest()];
                        case 1:
                            _a.sent();
                            resolve(devices);
                            return [2 /*return*/];
                    }
                });
            }); }, _this.scanTime);
        });
    };
    /**
     * Cancels the scan for devices
     */
    Bluetooth.prototype.cancelRequest = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.scanner) {
                    clearTimeout(this.scanner);
                    this.scanner = undefined;
                    adapter_1.adapter.stopScan();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * @hidden
     * Request LE scan (not implemented)
     */
    Bluetooth.prototype.requestLEScan = function (_options) {
        throw new Error('requestLEScan error: method not implemented.');
    };
    /**
     * Bluetooth Availability Changed event
     * @event
     */
    Bluetooth.EVENT_AVAILABILITY = 'availabilitychanged';
    return Bluetooth;
}(dispatcher_1.EventDispatcher));
exports.Bluetooth = Bluetooth;
//# sourceMappingURL=bluetooth.js.map