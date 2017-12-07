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

import { BluetoothDevice } from "./device";

export class BluetoothRemoteGATTServer {
    /**
     * @hidden
     */
    public _services: Array<string> = null;

    public device: BluetoothDevice = null;
    public connected: boolean = false;
}

/*
    // BluetoothRemoteGATTServer Object
    var BluetoothRemoteGATTServer = function() {
        this._services = null;

        this.device = null;
        this.connected = false;
    };
    BluetoothRemoteGATTServer.prototype.connect = function() {
        return new Promise(function(resolve, reject) {
            if (this.connected) return reject("connect error: device already connected");

            adapter.connect(this.device._handle, function() {
                this.connected = true;
                resolve(this);
            }.bind(this), function() {
                this._services = null;
                this.connected = false;
                this.device.dispatchEvent({ type: "gattserverdisconnected", bubbles: true });
            }.bind(this), wrapReject(reject, "connect error"));
        }.bind(this));
    };
    BluetoothRemoteGATTServer.prototype.disconnect = function() {
        adapter.disconnect(this.device._handle);
        this.connected = false;
    };
    BluetoothRemoteGATTServer.prototype.getPrimaryService = function(serviceUUID) {
        return new Promise(function(resolve, reject) {
            if (!this.connected) return reject("getPrimaryService error: device not connected");
            if (!serviceUUID) return reject("getPrimaryService error: no service specified");

            this.getPrimaryServices(serviceUUID)
            .then(function(services) {
                if (services.length !== 1) return reject("getPrimaryService error: service not found");
                resolve(services[0]);
            })
            .catch(function(error) {
                reject(error);
            });
        }.bind(this));
    };
    BluetoothRemoteGATTServer.prototype.getPrimaryServices = function(serviceUUID) {
        return new Promise(function(resolve, reject) {
            if (!this.connected) return reject("getPrimaryServices error: device not connected");

            function complete() {
                if (!serviceUUID) return resolve(this._services);
                var filtered = this._services.filter(function(service) {
                    return (service.uuid === helpers.getServiceUUID(serviceUUID));
                });
                if (filtered.length !== 1) return reject("getPrimaryServices error: service not found");
                resolve(filtered);
            }
            if (this._services) return complete.call(this);
            adapter.discoverServices(this.device._handle, this.device._allowedServices, function(services) {
                this._services = services.map(function(serviceInfo) {
                    serviceInfo.device = this.device;
                    return new BluetoothRemoteGATTService(serviceInfo);
                }.bind(this));
                complete.call(this);
            }.bind(this), wrapReject(reject, "getPrimaryServices error"));
        }.bind(this));
    };
*/
