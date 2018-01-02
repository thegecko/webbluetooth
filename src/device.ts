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
import { Bluetooth } from "./bluetooth";
import { BluetoothRemoteGATTServer } from "./server";

export class BluetoothDevice extends EventDispatcher {

    /**
     * Server Disconnected event
     * @event
     */
    public static EVENT_DISCONNECTED: string = "gattserverdisconnected";

    public readonly id: string = "unknown";
    public readonly name: string = null;
    public readonly gatt: BluetoothRemoteGATTServer = null;
    public readonly watchingAdvertisements: boolean = false;

    /**
     * @hidden
     */
    public readonly adData: {
        rssi?: number;
        txPower?: null;
        serviceData?: Map<string, DataView>;
        manufacturerData?: Map<string, DataView>;
    };

    /**
     * @hidden
     */
    public readonly _bluetooth: Bluetooth = null;

    /**
     * @hidden
     */
    public readonly _allowedServices: Array<string> = [];

    /**
     * @hidden
     */
    public _serviceUUIDs: Array<string> = [];

    constructor(init?: Partial<BluetoothDevice>) {
        super();
        Object.assign(this, init);
        this.gatt = new BluetoothRemoteGATTServer(this);
    }
    /*
    public watchAdvertisements(): Promise<void> {
    }

    public unwatchAdvertisements() {
    }
    */
}
