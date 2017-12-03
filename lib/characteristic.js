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
class BluetoothRemoteGATTCharacteristic {
}
exports.BluetoothRemoteGATTCharacteristic = BluetoothRemoteGATTCharacteristic;
/*
    // BluetoothRemoteGATTCharacteristic Object
    var BluetoothRemoteGATTCharacteristic = function(properties) {
        this._handle = null;
        this._descriptors = null;

        this.service = null;
        this.uuid = null;
        this.properties = {
            broadcast: false,
            read: false,
            writeWithoutResponse: false,
            write: false,
            notify: false,
            indicate: false,
            authenticatedSignedWrites: false,
            reliableWrite: false,
            writableAuxiliaries: false
        };
        this.value = null;

        mergeDictionary(this, properties);
    };
    BluetoothRemoteGATTCharacteristic.prototype.getDescriptor = function(descriptorUUID) {
        return new Promise(function(resolve, reject) {
            if (!this.service.device.gatt.connected) return reject("getDescriptor error: device not connected");
            if (!descriptorUUID) return reject("getDescriptor error: no descriptor specified");

            this.getDescriptors(descriptorUUID)
            .then(function(descriptors) {
                if (descriptors.length !== 1) return reject("getDescriptor error: descriptor not found");
                resolve(descriptors[0]);
            })
            .catch(function(error) {
                reject(error);
            });
        }.bind(this));
    };
    BluetoothRemoteGATTCharacteristic.prototype.getDescriptors = function(descriptorUUID) {
        return new Promise(function(resolve, reject) {
            if (!this.service.device.gatt.connected) return reject("getDescriptors error: device not connected");

            function complete() {
                if (!descriptorUUID) return resolve(this._descriptors);
                var filtered = this._descriptors.filter(function(descriptor) {
                    return (descriptor.uuid === helpers.getDescriptorUUID(descriptorUUID));
                });
                if (filtered.length !== 1) return reject("getDescriptors error: descriptor not found");
                resolve(filtered);
            }
            if (this._descriptors) return complete.call(this);
            adapter.discoverDescriptors(this._handle, [], function(descriptors) {
                this._descriptors = descriptors.map(function(descriptorInfo) {
                    descriptorInfo.characteristic = this;
                    return new BluetoothRemoteGATTDescriptor(descriptorInfo);
                }.bind(this));
                complete.call(this);
            }.bind(this), wrapReject(reject, "getDescriptors error"));
        }.bind(this));
    };
    BluetoothRemoteGATTCharacteristic.prototype.readValue = function() {
        return new Promise(function(resolve, reject) {
            if (!this.service.device.gatt.connected) return reject("readValue error: device not connected");

            adapter.readCharacteristic(this._handle, function(dataView) {
                this.value = dataView;
                resolve(dataView);
                this.dispatchEvent({ type: "characteristicvaluechanged", bubbles: true });
            }.bind(this), wrapReject(reject, "readValue error"));
        }.bind(this));
    };
    BluetoothRemoteGATTCharacteristic.prototype.writeValue = function(bufferSource) {
        return new Promise(function(resolve, reject) {
            if (!this.service.device.gatt.connected) return reject("writeValue error: device not connected");

            var arrayBuffer = bufferSource.buffer || bufferSource;
            var dataView = new DataView(arrayBuffer);
            adapter.writeCharacteristic(this._handle, dataView, function() {
                this.value = dataView;
                resolve();
            }.bind(this), wrapReject(reject, "writeValue error"));
        }.bind(this));
    };
    BluetoothRemoteGATTCharacteristic.prototype.startNotifications = function() {
        return new Promise(function(resolve, reject) {
            if (!this.service.device.gatt.connected) return reject("startNotifications error: device not connected");

            adapter.enableNotify(this._handle, function(dataView) {
                this.value = dataView;
                this.dispatchEvent({ type: "characteristicvaluechanged", bubbles: true });
            }.bind(this), function() {
                resolve(this);
            }.bind(this), wrapReject(reject, "startNotifications error"));
        }.bind(this));
    };
    BluetoothRemoteGATTCharacteristic.prototype.stopNotifications = function() {
        return new Promise(function(resolve, reject) {
            if (!this.service.device.gatt.connected) return reject("stopNotifications error: device not connected");

            adapter.disableNotify(this._handle, function() {
                resolve(this);
            }.bind(this), wrapReject(reject, "stopNotifications error"));
        }.bind(this));
    };
    BluetoothRemoteGATTCharacteristic.prototype.addEventListener = createListenerFn([
        "characteristicvaluechanged"
    ]);
    BluetoothRemoteGATTCharacteristic.prototype.removeEventListener = removeEventListener;
    BluetoothRemoteGATTCharacteristic.prototype.dispatchEvent = dispatchEvent;
*/

//# sourceMappingURL=characteristic.js.map
