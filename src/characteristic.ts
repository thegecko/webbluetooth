/*
* Node Web Bluetooth
* Copyright (c) 2025 Rob Moran
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

import { adapter } from './adapters';
import { BluetoothRemoteGATTDescriptorImpl } from './descriptor';
import { BluetoothUUID } from './uuid';
import { BluetoothRemoteGATTServiceImpl } from './service';
import { BluetoothRemoteGATTCharacteristicInit } from './adapters/adapter';
import { EventDispatcher, DOMEvent } from './events';

const isView = (source: ArrayBuffer | ArrayBufferView): source is ArrayBufferView => (source as ArrayBufferView).buffer !== undefined;

/**
 * @hidden
 */
export interface CharacteristicEvents {
    /**
     * Characteristic value changed event
     */
    characteristicvaluechanged: Event;
}

/**
 * Bluetooth Remote GATT Characteristic class
 */
export class BluetoothRemoteGATTCharacteristicImpl extends EventDispatcher<CharacteristicEvents> implements BluetoothRemoteGATTCharacteristic {

    /**
     * The service the characteristic is related to
     */
    public readonly service: BluetoothRemoteGATTServiceImpl = undefined;

    /**
     * The unique identifier of the characteristic
     */
    public readonly uuid: string = undefined;

    /**
     * The properties of the characteristic
     */
    public readonly properties: BluetoothCharacteristicProperties;

    private _value: DataView | undefined;
    /**
     * The value of the characteristic
     */
    public get value(): DataView | undefined {
        return this._value;
    }

    /**
     * @hidden
     */
    public _handle: string = undefined;
    private descriptors: Array<BluetoothRemoteGATTDescriptor> = undefined;

    private _oncharacteristicvaluechanged: (ev: Event) => void;
    public set oncharacteristicvaluechanged(fn: (ev: Event) => void) {
        if (this._oncharacteristicvaluechanged) {
            this.removeEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
            this._oncharacteristicvaluechanged = undefined;
        }
        if (fn) {
            this._oncharacteristicvaluechanged = fn;
            this.addEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
        }
    }

    /**
     * Characteristic constructor
     * @param init A partial class to initialise values
     */
    constructor(init: BluetoothRemoteGATTCharacteristicInit, service: BluetoothRemoteGATTServiceImpl) {
        super();

        this.service = service;
        this.uuid = init.uuid;
        this.properties = init.properties;
        this._handle = init._handle;
        this._value = init.value;
    }

    private setValue(value?: DataView, emit?: boolean) {
        this._value = value;
        if (emit) {
            this.dispatchEvent(new DOMEvent(this, 'characteristicvaluechanged'));
            this.service.dispatchEvent(new DOMEvent(this, 'characteristicvaluechanged'));
            this.service.device.dispatchEvent(new DOMEvent(this, 'characteristicvaluechanged'));
            this.service.device._bluetooth.dispatchEvent(new DOMEvent(this, 'characteristicvaluechanged'));
        }
    }

    /**
     * Gets a single characteristic descriptor
     * @param descriptor descriptor UUID
     * @returns Promise containing the descriptor
     */
    public async getDescriptor(descriptor: string | number): Promise<BluetoothRemoteGATTDescriptor> {
        if (!this.service.device.gatt.connected) {
            throw new Error('getDescriptor error: device not connected');
        }

        if (!descriptor) {
            throw new Error('getDescriptor error: no descriptor specified');
        }

        const descriptors = await this.getDescriptors(descriptor);
        if (descriptors.length !== 1) {
            throw new Error('getDescriptor error: descriptor not found');
        }

        return descriptors[0];
    }

    /**
     * Gets a list of the characteristic's descriptors
     * @param descriptor descriptor UUID
     * @returns Promise containing an array of descriptors
     */
    public async getDescriptors(descriptor?: string | number): Promise<Array<BluetoothRemoteGATTDescriptor>> {
        if (!this.service.device.gatt.connected) {
            throw new Error('getDescriptors error: device not connected');
        }

        if (!this.descriptors) {
            const descriptors = await adapter.discoverDescriptors(this._handle);
            this.descriptors = descriptors.map(descriptorInfo => {
                return new BluetoothRemoteGATTDescriptorImpl(descriptorInfo, this);
            });
        }

        if (!descriptor) {
            return this.descriptors;
        }

        const filtered = this.descriptors.filter(descriptorObject => descriptorObject.uuid === BluetoothUUID.getDescriptor(descriptor));

        if (filtered.length !== 1) {
            throw new Error('getDescriptors error: descriptor not found');
        }
        return filtered;
    }

    /**
     * Gets the value of the characteristic
     * @returns Promise containing the value
     */
    public async readValue(): Promise<DataView> {
        if (!this.service.device.gatt.connected) {
            throw new Error('readValue error: device not connected');
        }

        const dataView = await adapter.readCharacteristic(this._handle);
        this.setValue(dataView, true);
        return dataView;
    }

    /**
     * Updates the value of the characteristic
     * @param value The value to write
     */
    public async writeValue(value: ArrayBuffer | ArrayBufferView): Promise<void> {
        if (!this.service.device.gatt.connected) {
            throw new Error('writeValue error: device not connected');
        }

        const arrayBuffer = isView(value) ? value.buffer : value;
        const dataView = new DataView(arrayBuffer);

        await adapter.writeCharacteristic(this._handle, dataView);
        this.setValue(dataView);
    }

    /**
     * Updates the value of the characteristic and waits for a response
     * @param value The value to write
     */
    public async writeValueWithResponse(value: ArrayBuffer | ArrayBufferView): Promise<void> {
        if (!this.service.device.gatt.connected) {
            throw new Error('writeValue error: device not connected');
        }

        const arrayBuffer = isView(value) ? value.buffer : value;
        const dataView = new DataView(arrayBuffer);

        await adapter.writeCharacteristic(this._handle, dataView, false);
        this.setValue(dataView);
    }

    /**
     * Updates the value of the characteristic without waiting for a response
     * @param value The value to write
     */
    public async writeValueWithoutResponse(value: ArrayBuffer | ArrayBufferView): Promise<void> {
        if (!this.service.device.gatt.connected) {
            throw new Error('writeValue error: device not connected');
        }

        const arrayBuffer = isView(value) ? value.buffer : value;
        const dataView = new DataView(arrayBuffer);

        await adapter.writeCharacteristic(this._handle, dataView, true);
        this.setValue(dataView);
    }

    /**
     * Start notifications of changes for the characteristic
     * @returns Promise containing the characteristic
     */
    public async startNotifications(): Promise<BluetoothRemoteGATTCharacteristic> {
        if (!this.service.device.gatt.connected) {
            throw new Error('startNotifications error: device not connected');
        }

        await adapter.enableNotify(this._handle, dataView => {
            this.setValue(dataView, true);
        });

        return this;
    }

    /**
     * Stop notifications of changes for the characteristic
     * @returns Promise containing the characteristic
     */
    public async stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic> {
        if (!this.service.device.gatt.connected) {
            throw new Error('stopNotifications error: device not connected');
        }

        await adapter.disableNotify(this._handle);
        return this;
    }
}
