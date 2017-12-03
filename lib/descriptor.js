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
class BluetoothRemoteGATTDescriptor {
}
exports.BluetoothRemoteGATTDescriptor = BluetoothRemoteGATTDescriptor;
/*
    // BluetoothRemoteGATTDescriptor Object
    var BluetoothRemoteGATTDescriptor = function(properties) {
        this._handle = null;

        this.characteristic = null;
        this.uuid = null;
        this.value = null;

        mergeDictionary(this, properties);
    };
    BluetoothRemoteGATTDescriptor.prototype.readValue = function() {
        return new Promise(function(resolve, reject) {
            if (!this.characteristic.service.device.gatt.connected) return reject("readValue error: device not connected");

            adapter.readDescriptor(this._handle, function(dataView) {
                this.value = dataView;
                resolve(dataView);
            }.bind(this), wrapReject(reject, "readValue error"));
        }.bind(this));
    };
    BluetoothRemoteGATTDescriptor.prototype.writeValue = function(bufferSource) {
        return new Promise(function(resolve, reject) {
            if (!this.characteristic.service.device.gatt.connected) return reject("writeValue error: device not connected");

            var arrayBuffer = bufferSource.buffer || bufferSource;
            var dataView = new DataView(arrayBuffer);
            adapter.writeDescriptor(this._handle, dataView, function() {
                this.value = dataView;
                resolve();
            }.bind(this), wrapReject(reject, "writeValue error"));
        }.bind(this));
    };
*/

//# sourceMappingURL=descriptor.js.map
