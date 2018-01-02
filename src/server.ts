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
import { BluetoothRemoteGATTService } from "./service";
import { getServiceUUID } from "./helpers";
import { adapter } from "./adapter";

export class BluetoothRemoteGATTServer {
    /**
     * @hidden
     */
    public _services: Array<BluetoothRemoteGATTService> = null;

    public device: BluetoothDevice = null;
    public connected: boolean = false;

    public connect(): Promise<BluetoothRemoteGATTServer> {
        return new Promise((resolve, reject) => {
            if (this.connected) return reject("connect error: device already connected");

            adapter.connect(this.device._handle, () => {
                this.connected = true;
                resolve(this);
            }, () => {
                this._services = null;
                this.connected = false;
                this.device.dispatchEvent(BluetoothDevice.EVENT_DISCONNECTED);
            }, error => {
                reject(`connect Error: ${error}`);
            });
        });
    }

    public disconnect() {
        adapter.disconnect(this.device._handle);
        this.connected = false;
    }

    public getPrimaryService(serviceUUID): Promise<BluetoothRemoteGATTService> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject("getPrimaryService error: device not connected");
            if (!serviceUUID) return reject("getPrimaryService error: no service specified");

            this.getPrimaryServices(serviceUUID)
            .then(services => {
                if (services.length !== 1) return reject("getPrimaryService error: service not found");
                resolve(services[0]);
            })
            .catch(error => {
                reject(`getPrimaryService error: ${error}`);
            });
        });
    }

    public getPrimaryServices(serviceUUID): Promise<Array<BluetoothRemoteGATTService>> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject("getPrimaryServices error: device not connected");

            function complete() {
                if (!serviceUUID) return resolve(this._services);

                const filtered = this._services.filter(service => {
                    return (service.uuid === getServiceUUID(serviceUUID));
                });

                if (filtered.length !== 1) return reject("getPrimaryServices error: service not found");
                resolve(filtered);
            }

            if (this._services) return complete.call(this);

            adapter.discoverServices(this.device._handle, this.device._allowedServices, services => {
                this._services = services.map(serviceInfo => {
                    serviceInfo.device = this.device;
                    return new BluetoothRemoteGATTService(serviceInfo);
                });

                complete.call(this);
            }, error => {
                reject(`getPrimaryServices error: ${error}`);
            });
        });
    }
}
