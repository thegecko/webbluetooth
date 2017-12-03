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

import { BluetoothRemoteGATTServer } from "./server";

export class BluetoothDevice {

    public _handle: string = null;
    public _allowedServices: Array<string> = [];
    public id: string = "unknown";
    public name: string = null;
    // public adData: {
    //    public appearance?: null;
    //    public txPower?: null;
    //    rssi?: number;
    //    manufacturerData = new Map();
    //    serviceData = new Map();
    // }
    public gatt: BluetoothRemoteGATTServer = new BluetoothRemoteGATTServer();
    public uuids: Array<string> = [];

    constructor(init?: Partial<BluetoothDevice>) {
        for (const key in init) {
            if (init.hasOwnProperty(key)) {
                this[key] = init[key];
            }
        }

        this.gatt.device = this;
    }
}

/*
    // BluetoothDevice Object
    var BluetoothDevice = function(properties) {
        this._handle = null;
        this._allowedServices = [];

        this.id = "unknown";
        this.name = null;
        this.adData = {
            appearance: null,
            txPower: null,
            rssi: null,
            manufacturerData: new Map(),
            serviceData: new Map()
        };
        this.gatt = new BluetoothRemoteGATTServer();
        this.gatt.device = this;
        this.uuids = [];

        mergeDictionary(this, properties);
    };
    BluetoothDevice.prototype.addEventListener = createListenerFn([
        "gattserverdisconnected",
    ]);
    BluetoothDevice.prototype.removeEventListener = removeEventListener;
    BluetoothDevice.prototype.dispatchEvent = dispatchEvent;
*/
