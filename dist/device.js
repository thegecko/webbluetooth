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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BluetoothDevice = void 0;
var dispatcher_1 = require("./dispatcher");
var server_1 = require("./server");
/**
 * Bluetooth Device class
 */
var BluetoothDevice = /** @class */ (function (_super) {
    __extends(BluetoothDevice, _super);
    /**
     * Device constructor
     * @param init A partial class to initialise values
     */
    function BluetoothDevice(init) {
        var _this = _super.call(this) || this;
        /**
         * The unique identifier of the device
         */
        _this.id = undefined;
        /**
         * The name of the device
         */
        _this.name = undefined;
        /**
         * The gatt server of the device
         */
        _this.gatt = undefined;
        /**
         * Whether adverts are being watched (not implemented)
         */
        _this.watchingAdvertisements = false;
        /**
         * @hidden
         */
        _this._bluetooth = undefined;
        /**
         * @hidden
         */
        _this._allowedServices = [];
        /**
         * @hidden
         */
        _this._serviceUUIDs = [];
        _this.id = init.id;
        _this.name = init.name;
        _this.gatt = init.gatt;
        _this.watchAdvertisements = init.watchAdvertisements;
        _this.adData = init.adData;
        _this._bluetooth = init._bluetooth;
        _this._allowedServices = init._allowedServices;
        _this._serviceUUIDs = init._serviceUUIDs;
        if (!_this.name)
            _this.name = "Unknown or Unsupported Device (" + _this.id + ")";
        if (!_this.gatt)
            _this.gatt = new server_1.BluetoothRemoteGATTServer(_this);
        return _this;
    }
    Object.defineProperty(BluetoothDevice.prototype, "oncharacteristicvaluechanged", {
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
    Object.defineProperty(BluetoothDevice.prototype, "onserviceadded", {
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
    Object.defineProperty(BluetoothDevice.prototype, "onservicechanged", {
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
    Object.defineProperty(BluetoothDevice.prototype, "onserviceremoved", {
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
    Object.defineProperty(BluetoothDevice.prototype, "ongattserverdisconnected", {
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
    Object.defineProperty(BluetoothDevice.prototype, "onadvertisementreceived", {
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
    /**
     * Starts watching adverts from this device (not implemented)
     */
    BluetoothDevice.prototype.watchAdvertisements = function () {
        throw new Error('watchAdvertisements error: method not implemented');
    };
    /**
     * Stops watching adverts from this device (not implemented)
     */
    BluetoothDevice.prototype.unwatchAdvertisements = function () {
        throw new Error('unwatchAdvertisements error: method not implemented');
    };
    /**
     * Forget this device (not implemented)
     */
    BluetoothDevice.prototype.forget = function () {
        throw new Error('forget error: method not implemented');
    };
    return BluetoothDevice;
}(dispatcher_1.EventDispatcher));
exports.BluetoothDevice = BluetoothDevice;
//# sourceMappingURL=device.js.map