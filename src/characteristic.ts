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

import { EventDispatcher } from "./dispatcher";
import { BluetoothRemoteGATTService } from "./service";
import { BluetoothRemoteGATTDescriptor } from "./descriptor";
import { getDescriptorUUID } from "./helpers";
import { adapter } from "./adapter";

/**
 * Bluetooth Characteristic Properties interface
 */
export interface BluetoothCharacteristicProperties {
    /**
     * Broadcast property
     */
    broadcast: boolean;
    /**
     * Read property
     */
    read: boolean;
    /**
     * Write without response property
     */
    writeWithoutResponse: boolean;
    /**
     * Write property
     */
    write: boolean;
    /**
     * Notify property
     */
    notify: boolean;
    /**
     * Indicate property
     */
    indicate: boolean;
    /**
     * Authenticated signed writes property
     */
    authenticatedSignedWrites: boolean;
    /**
     * Reliable write property
     */
    reliableWrite: boolean;
    /**
     * Writable auxiliaries property
     */
    writableAuxiliaries: boolean;
}

/**
 * Bluetooth Remote GATT Characteristic class
 */
export class BluetoothRemoteGATTCharacteristic extends EventDispatcher {

    /**
     * Characteristic Value Changed event
     * @event
     */
    public static EVENT_CHANGED: string = "characteristicvaluechanged";

    /**
     * The service the characteristic is related to
     */
    public readonly service: BluetoothRemoteGATTService = null;

    /**
     * The unique identifier of the characteristic
     */
    public readonly uuid = null;

    /**
     * The properties of the characteristic
     */
    public readonly properties: BluetoothCharacteristicProperties;

    private _value: DataView = null;
    /**
     * The value of the characteristic
     */
    public get value(): DataView {
        return this._value;
    }

    private handle: string = null;
    private descriptors: Array<BluetoothRemoteGATTDescriptor> = null;

    /**
     * Characteristic constructor
     * @param init A partial class to initialise values
     */
    constructor(init: Partial<BluetoothRemoteGATTCharacteristic>) {
        super();

        this.service = init.service;
        this.uuid = init.uuid;
        this.properties = init.properties;
        this._value = init.value;

        this.handle = this.uuid;
    }

    private setValue(value?: DataView, emit?: boolean) {
        this._value = value;
        if (emit) {
            this.dispatchEvent(BluetoothRemoteGATTCharacteristic.EVENT_CHANGED, value);
            this.service.dispatchEvent(BluetoothRemoteGATTCharacteristic.EVENT_CHANGED, value);
            this.service.device.dispatchEvent(BluetoothRemoteGATTCharacteristic.EVENT_CHANGED, value);
            this.service.device._bluetooth.dispatchEvent(BluetoothRemoteGATTCharacteristic.EVENT_CHANGED, value);
        }
    }

    /**
     * Gets a single characteristic descriptor
     * @param descriptor descriptor UUID
     * @returns Promise containing the descriptor
     */
    public getDescriptor(descriptor: string | number): Promise<BluetoothRemoteGATTDescriptor> {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("getDescriptor error: device not connected");
            if (!descriptor) return reject("getDescriptor error: no descriptor specified");

            this.getDescriptors(descriptor)
            .then(descriptors => {
                if (descriptors.length !== 1) return reject("getDescriptor error: descriptor not found");
                resolve(descriptors[0]);
            })
            .catch(error =>  {
                reject(`getDescriptor error: ${error}`);
            });
        });
    }

    /**
     * Gets a list of the characteristic's descriptors
     * @param descriptor descriptor UUID
     * @returns Promise containing an array of descriptors
     */
    public getDescriptors(descriptor?: string | number): Promise<Array<BluetoothRemoteGATTDescriptor>> {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("getDescriptors error: device not connected");

            function complete() {
                if (!descriptor) return resolve(this.descriptors);

                const filtered = this.descriptors.filter(descriptorObject => {
                    return (descriptorObject.uuid === getDescriptorUUID(descriptor));
                });

                if (filtered.length !== 1) return reject("getDescriptors error: descriptor not found");
                resolve(filtered);
            }

            if (this.descriptors) return complete.call(this);

            adapter.discoverDescriptors(this.handle, [], descriptors => {
                this.descriptors = descriptors.map(descriptorInfo => {
                    Object.assign(descriptorInfo, {
                        characteristic: this
                    });
                    return new BluetoothRemoteGATTDescriptor(descriptorInfo);
                });

                complete.call(this);
            }, error => {
                reject(`getDescriptors error: ${error}`);
            });
        });
    }

    /**
     * Gets the value of the characteristic
     * @returns Promise containing the value
     */
    public readValue(): Promise<DataView> {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("readValue error: device not connected");

            adapter.readCharacteristic(this.handle, dataView => {
                this.setValue(dataView, true);
                resolve(dataView);
            }, error => {
                reject(`readValue error: ${error}`);
            });
        });
    }

    /**
     * Updates the value of the characteristic
     * @param value The value to write
     */
    public writeValue(value: ArrayBuffer | ArrayBufferView): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("writeValue error: device not connected");

            function isView(source: ArrayBuffer | ArrayBufferView): source is ArrayBufferView {
                return (source as ArrayBufferView).buffer !== undefined;
            }

            const arrayBuffer = isView(value) ? value.buffer : value;
            const dataView = new DataView(arrayBuffer);

            adapter.writeCharacteristic(this.handle, dataView, () => {
                this.setValue (dataView);
                resolve();
            }, error => {
                reject(`writeValue error: ${error}`);
            });
        });
    }

    /**
     * Start notifications of changes for the characteristic
     * @returns Promise containing the characteristic
     */
    public startNotifications(): Promise<BluetoothRemoteGATTCharacteristic> {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("startNotifications error: device not connected");

            adapter.enableNotify(this.handle, dataView => {
                this.setValue(dataView, true);
            }, () => {
                resolve(this);
            }, error => {
                reject(`startNotifications error: ${error}`);
            });
        });
    }

    /**
     * Stop notifications of changes for the characteristic
     * @returns Promise containing the characteristic
     */
    public stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic> {
        return new Promise((resolve, reject) => {
            if (!this.service.device.gatt.connected) return reject("stopNotifications error: device not connected");

            adapter.disableNotify(this.handle, () => {
                resolve(this);
            }, error => {
                reject(`stopNotifications error: ${error}`);
            });
        });
    }
}
