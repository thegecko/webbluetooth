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
Object.defineProperty(exports, "__esModule", { value: true });
class BluetoothRemoteGATTService {
}
exports.BluetoothRemoteGATTService = BluetoothRemoteGATTService;
/*
    // BluetoothRemoteGATTService Object
    var BluetoothRemoteGATTService = function(properties) {
        this._handle = null;
        this._services = null;
        this._characteristics = null;

        this.device = null;
        this.uuid = null;
        this.isPrimary = false;

        mergeDictionary(this, properties);
        this.dispatchEvent({ type: "serviceadded", bubbles: true });
    };
    BluetoothRemoteGATTService.prototype.getCharacteristic = function(characteristicUUID) {
        return new Promise(function(resolve, reject) {
            if (!this.device.gatt.connected) return reject("getCharacteristic error: device not connected");
            if (!characteristicUUID) return reject("getCharacteristic error: no characteristic specified");

            this.getCharacteristics(characteristicUUID)
            .then(function(characteristics) {
                if (characteristics.length !== 1) return reject("getCharacteristic error: characteristic not found");
                resolve(characteristics[0]);
            })
            .catch(function(error) {
                reject(error);
            });
        }.bind(this));
    };
    BluetoothRemoteGATTService.prototype.getCharacteristics = function(characteristicUUID) {
        return new Promise(function(resolve, reject) {
            if (!this.device.gatt.connected) return reject("getCharacteristics error: device not connected");

            function complete() {
                if (!characteristicUUID) return resolve(this._characteristics);
                var filtered = this._characteristics.filter(function(characteristic) {
                    return (characteristic.uuid === helpers.getCharacteristicUUID(characteristicUUID));
                });
                if (filtered.length !== 1) return reject("getCharacteristics error: characteristic not found");
                resolve(filtered);
            }
            if (this._characteristics) return complete.call(this);
            adapter.discoverCharacteristics(this._handle, [], function(characteristics) {
                this._characteristics = characteristics.map(function(characteristicInfo) {
                    characteristicInfo.service = this;
                    return new BluetoothRemoteGATTCharacteristic(characteristicInfo);
                }.bind(this));
                complete.call(this);
            }.bind(this), wrapReject(reject, "getCharacteristics error"));
        }.bind(this));
    };
    BluetoothRemoteGATTService.prototype.getIncludedService = function(serviceUUID) {
        return new Promise(function(resolve, reject) {
            if (!this.device.gatt.connected) return reject("getIncludedService error: device not connected");
            if (!serviceUUID) return reject("getIncludedService error: no service specified");

            this.getIncludedServices(serviceUUID)
            .then(function(services) {
                if (services.length !== 1) return reject("getIncludedService error: service not found");
                resolve(services[0]);
            })
            .catch(function(error) {
                reject(error);
            });
        }.bind(this));
    };
    BluetoothRemoteGATTService.prototype.getIncludedServices = function(serviceUUID) {
        return new Promise(function(resolve, reject) {
            if (!this.device.gatt.connected) return reject("getIncludedServices error: device not connected");

            function complete() {
                if (!serviceUUID) return resolve(this._services);
                var filtered = this._services.filter(function(service) {
                    return (service.uuid === helpers.getServiceUUID(serviceUUID));
                });
                if (filtered.length !== 1) return reject("getIncludedServices error: service not found");
                resolve(filtered);
            }
            if (this._services) return complete.call(this);
            adapter.discoverIncludedServices(this._handle, this.device._allowedServices, function(services) {
                this._services = services.map(function(serviceInfo) {
                    serviceInfo.device = this.device;
                    return new BluetoothRemoteGATTService(serviceInfo);
                }.bind(this));
                complete.call(this);
            }.bind(this), wrapReject(reject, "getIncludedServices error"));
        }.bind(this));
    };
    BluetoothRemoteGATTService.prototype.addEventListener = createListenerFn([
        "serviceadded",
        "servicechanged",
        "serviceremoved"
    ]);
    BluetoothRemoteGATTService.prototype.removeEventListener = removeEventListener;
    BluetoothRemoteGATTService.prototype.dispatchEvent = dispatchEvent;
*/

//# sourceMappingURL=service.js.map
