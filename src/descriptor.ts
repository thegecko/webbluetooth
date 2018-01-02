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

import { BluetoothRemoteGATTCharacteristic } from "./characteristic";
import { adapter } from "./adapter";

export class BluetoothRemoteGATTDescriptor {

    public readonly characteristic: BluetoothRemoteGATTCharacteristic = null;
    public readonly uuid: string = null;

    private _value: DataView = null;
    public get value(): DataView {
        return this._value;
    }

    private handle: string = null;

    constructor(init?: Partial<BluetoothRemoteGATTDescriptor>) {
        Object.assign(this, init);
        this.handle = `${this.characteristic.uuid}-${this.uuid}`;
    }

    public readValue(): Promise<DataView> {
        return new Promise((resolve, reject) =>  {
            if (!this.characteristic.service.device.gatt.connected) return reject("readValue error: device not connected");

            adapter.readDescriptor(this.handle, dataView => {
                this._value = dataView;
                resolve(dataView);
            }, error => {
                reject(`readValue error: ${error}`);
            });
        });
    }

    public writeValue(bufferSource: ArrayBuffer | ArrayBufferView): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.characteristic.service.device.gatt.connected) return reject("writeValue error: device not connected");

            function isView(source: ArrayBuffer | ArrayBufferView): source is ArrayBufferView {
                return (source as ArrayBufferView).buffer !== undefined;
            }

            const arrayBuffer = isView(bufferSource) ? bufferSource.buffer : bufferSource;
            const dataView = new DataView(arrayBuffer);

            adapter.writeDescriptor(this.handle, dataView, () => {
                this._value = dataView;
                resolve();
            }, error => {
                reject(`writeValue error: ${error}`);
            });
        });
    }
}
