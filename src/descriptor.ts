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
    /**
     * @hidden
     */
    public _handle: string = null;

    public characteristic: BluetoothRemoteGATTCharacteristic = null;
    public uuid = null;
    public value = null;

    /**
     * @hidden
     */
    constructor(init?: Partial<BluetoothRemoteGATTDescriptor>) {
        for (const key in init) {
            if (init.hasOwnProperty(key)) {
                this[key] = init[key];
            }
        }
    }

    public readValue(): Promise<DataView> {
        return new Promise((resolve, reject) =>  {
            if (!this.characteristic.service.device.gatt.connected) return reject("readValue error: device not connected");

            adapter.readDescriptor(this._handle, dataView => {
                this.value = dataView;
                resolve(dataView);
            }, error => {
                reject(`readValue error: ${error}`);
            });
        });
    }

    public writeValue(bufferSource: ArrayBuffer | ArrayBufferView) {
        return new Promise((resolve, reject) => {
            if (!this.characteristic.service.device.gatt.connected) return reject("writeValue error: device not connected");

            function isView(source: ArrayBuffer | ArrayBufferView): source is ArrayBufferView {
                return (source as ArrayBufferView).buffer !== undefined;
            }

            const arrayBuffer = isView(bufferSource) ? bufferSource.buffer : bufferSource;
            const dataView = new DataView(arrayBuffer);

            adapter.writeDescriptor(this._handle, dataView, () => {
                this.value = dataView;
                resolve();
            }, error => {
                reject(`writeValue error: ${error}`);
            });
        });
    }
}
