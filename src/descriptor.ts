/*
* Node Web Bluetooth
* Copyright (c) 2026 Rob Moran
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
import { BluetoothRemoteGATTDescriptorInit } from './adapters/adapter';

/**
 * Bluetooth Remote GATT Descriptor class
 */
class BluetoothRemoteGATTDescriptorImpl implements BluetoothRemoteGATTDescriptor {

    /**
     * The characteristic the descriptor is related to
     */
    public readonly characteristic: BluetoothRemoteGATTCharacteristic;

    /**
     * The unique identifier of the descriptor
     */
    public readonly uuid: string;

    private _value: DataView = new DataView(new ArrayBuffer(0));
    /**
     * The value of the descriptor
     */
    public get value(): DataView {
        return this._value;
    }

    /**
     * @hidden
     */
    public _handle: string;

    /**
     * Descriptor constructor
     * @param init A partial class to initialise values
     */
    constructor(init: BluetoothRemoteGATTDescriptorInit, characteristic: BluetoothRemoteGATTCharacteristic) {
        this.characteristic = characteristic;
        this.uuid = init.uuid;
        this._handle = init._handle;
    }

    /**
     * Gets the value of the descriptor
     * @returns Promise containing the value
     */
    public async readValue(): Promise<DataView> {
        if (!this.characteristic.service.device.gatt?.connected) {
            throw new Error('readValue error: device not connected');
        }

        const dataView = await adapter.readDescriptor(this._handle);
        this._value = dataView;
        return dataView;
    }

    /**
     * Updates the value of the descriptor
     * @param value The value to write
     */
    public async writeValue(value: ArrayBuffer | ArrayBufferView): Promise<void> {
        if (!this.characteristic.service.device.gatt?.connected) {
            throw new Error('writeValue error: device not connected');
        }

        const isView = (source: ArrayBuffer | ArrayBufferView): source is ArrayBufferView => (source as ArrayBufferView).buffer !== undefined;
        const arrayBuffer = isView(value) ? value.buffer : value;
        const dataView = new DataView(arrayBuffer);

        await adapter.writeDescriptor(this._handle, dataView);
        this._value = dataView;
    }
}

export { BluetoothRemoteGATTDescriptorImpl as BluetoothRemoteGATTDescriptor };
