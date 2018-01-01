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

import { Emitter } from "./emitter";
import { BluetoothRemoteGATTService } from "./service";
import { BluetoothRemoteGATTDescriptor } from "./descriptor";
import { getDescriptorUUID } from "./helpers";
import { adapter } from "./adapter";

export class BluetoothRemoteGATTCharacteristic extends Emitter {

    /**
     * Characteristic Value Changed event
     * @event
     */
    public static EVENT_CHANGED: string = "characteristicvaluechanged";

    /**
     * @hidden
     */
    public _handle: string = null;

    /**
     * @hidden
     */
    public _descriptors: Array<BluetoothRemoteGATTDescriptor> = null;

    public service: BluetoothRemoteGATTService = null;
    public uuid = null;
    public value = null;

    public properties = {
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

    /**
     * @hidden
     */
    constructor(init?: Partial<BluetoothRemoteGATTCharacteristic>) {
        super();
        for (const key in init) {
            if (init.hasOwnProperty(key)) {
                this[key] = init[key];
            }
        }
    }

    public getDescriptor(descriptorUUID): Promise<BluetoothRemoteGATTDescriptor> {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("getDescriptor error: device not connected");
            if (!descriptorUUID) return reject("getDescriptor error: no descriptor specified");

            this.getDescriptors(descriptorUUID)
            .then(descriptors => {
                if (descriptors.length !== 1) return reject("getDescriptor error: descriptor not found");
                resolve(descriptors[0]);
            })
            .catch(error =>  {
                reject(`getDescriptor error: ${error}`);
            });
        });
    }

    public getDescriptors(descriptorUUID): Promise<Array<BluetoothRemoteGATTDescriptor>> {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("getDescriptors error: device not connected");

            function complete() {
                if (!descriptorUUID) return resolve(this._descriptors);

                const filtered = this._descriptors.filter(descriptor => {
                    return (descriptor.uuid === getDescriptorUUID(descriptorUUID));
                });

                if (filtered.length !== 1) return reject("getDescriptors error: descriptor not found");
                resolve(filtered);
            }

            if (this._descriptors) return complete.call(this);

            adapter.discoverDescriptors(this._handle, [], descriptors => {
                this._descriptors = descriptors.map(descriptorInfo => {
                    descriptorInfo.characteristic = this;
                    return new BluetoothRemoteGATTDescriptor(descriptorInfo);
                });

                complete.call(this);
            }, error => {
                reject(`getDescriptors error: ${error}`);
            });
        });
    }

    public readValue(): Promise<DataView> {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("readValue error: device not connected");

            adapter.readCharacteristic(this._handle, dataView => {
                this.value = dataView;
                resolve(dataView);
                this.emit(BluetoothRemoteGATTCharacteristic.EVENT_CHANGED);
            }, error => {
                reject(`readValue error: ${error}`);
            });
        });
    }

    public writeValue(bufferSource: ArrayBuffer | ArrayBufferView) {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("writeValue error: device not connected");

            function isView(source: ArrayBuffer | ArrayBufferView): source is ArrayBufferView {
                return (source as ArrayBufferView).buffer !== undefined;
            }

            const arrayBuffer = isView(bufferSource) ? bufferSource.buffer : bufferSource;
            const dataView = new DataView(arrayBuffer);

            adapter.writeCharacteristic(this._handle, dataView, () => {
                this.value = dataView;
                resolve();
            }, error => {
                reject(`writeValue error: ${error}`);
            });
        });
    }

    public startNotifications(): Promise<BluetoothRemoteGATTCharacteristic> {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("startNotifications error: device not connected");

            adapter.enableNotify(this._handle, dataView => {
                this.value = dataView;
                this.emit(BluetoothRemoteGATTCharacteristic.EVENT_CHANGED);
            }, () => {
                resolve(this);
            }, error => {
                reject(`startNotifications error: ${error}`);
            });
        });
    }

    public stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic> {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("stopNotifications error: device not connected");

            adapter.disableNotify(this._handle, () => {
                resolve(this);
            }, error => {
                reject(`stopNotifications error: ${error}`);
            });
        });
    }
}
