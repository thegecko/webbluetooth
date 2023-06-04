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

import { BluetoothRemoteGATTServer } from './server';
import type { BluetoothRemoteGATTServiceEventMap } from './service';

/** @hidden Interface for creating an Advertisement event. */
export interface BluetoothAdvertisingEventInit extends EventInit {
    device: BluetoothDevice;
    uuids: BluetoothServiceUUID[];
    name?: string;
    appearance?: number;
    txPower?: number;
    rssi?: number;
    manufacturerData: BluetoothManufacturerData;
    serviceData: BluetoothServiceData;
}

/** Bluetooth Advertisement event. */
export class BluetoothAdvertisingEvent extends Event {
    readonly device: BluetoothDevice;
    readonly uuids: BluetoothServiceUUID[];
    readonly name?: string | undefined;
    readonly appearance?: number | undefined;
    readonly txPower?: number | undefined;
    readonly rssi?: number | undefined;
    readonly manufacturerData: BluetoothManufacturerData;
    readonly serviceData: BluetoothServiceData;

    constructor(dict: BluetoothAdvertisingEventInit) {
        super("advertisementreceived", dict);
        this.device = dict.device;
        this.uuids = dict.uuids;
        this.name = dict.name;
        this.appearance = dict.appearance;
        this.txPower = dict.txPower;
        this.rssi = dict.rssi;
        this.manufacturerData = dict.manufacturerData;
        this.serviceData = dict.serviceData;
    }
}

/** @hidden Events for {@link BluetoothDevice} */
export interface BluetoothDeviceEventMap extends BluetoothRemoteGATTServiceEventMap {
    advertisementreceived: BluetoothAdvertisingEvent;
    gattserverdisconnected: Event;
}

/**
 * Bluetooth Device class.
 */
export class BluetoothDevice extends EventTarget {
    private _oncharacteristicvaluechanged: (ev: Event) => void;
    private _onserviceadded: (ev: Event) => void;
    private _onservicechanged: (ev: Event) => void;
    private _onserviceremoved: (ev: Event) => void;
    private _ongattserverdisconnected: (ev: Event) => void;
    private _onadvertisementreceived: (ev: Event) => void;

    /**
     * The unique identifier of the device.
     */
    public readonly id: string = undefined;

    /**
     * The name of the device.
     */
    public readonly name: string = undefined;

    /**
     * The gatt server of the device.
     */
    public readonly gatt: BluetoothRemoteGATTServer = undefined;

    /**
     * Whether advertisements are being watched (not implemented)
     */
    public readonly watchingAdvertisements: boolean = false;

    /** @hidden Advertisement data. */
    public readonly _adData: {
        rssi?: number;
        txPower?: number;
        serviceData?: BluetoothServiceData;
        manufacturerData?: BluetoothManufacturerData;
    };

    /** @hidden Root Bluetooth instance. */
    public readonly _bluetooth: Bluetooth = undefined;

    /** @hidden Allowed services */
    public readonly _allowedServices: Array<string> = [];

    /** @hidden List of Service UUIDs. */
    public readonly _serviceUUIDs: Array<string> = [];

    /** A listener for the `characteristicvaluechanged` event. */
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

    /** A listener for the `serviceadded` event. */
    public set onserviceadded(fn: (ev: Event) => void) {
        if (this._onserviceadded) {
            this.removeEventListener('serviceadded', this._onserviceadded);
            this._onserviceadded = undefined;
        }
        if (fn) {
            this._onserviceadded = fn;
            this.addEventListener('serviceadded', this._onserviceadded);
        }
    }

    /** A listener for the `servicechanged` event. */
    public set onservicechanged(fn: (ev: Event) => void) {
        if (this._onservicechanged) {
            this.removeEventListener('servicechanged', this._onservicechanged);
            this._onservicechanged = undefined;
        }
        if (fn) {
            this._onservicechanged = fn;
            this.addEventListener('servicechanged', this._onservicechanged);
        }
    }

    /** A listener for the `serviceremoved` event. */
    public set onserviceremoved(fn: (ev: Event) => void) {
        if (this._onserviceremoved) {
            this.removeEventListener('serviceremoved', this._onserviceremoved);
            this._onserviceremoved = undefined;
        }
        if (fn) {
            this._onserviceremoved = fn;
            this.addEventListener('serviceremoved', this._onserviceremoved);
        }
    }

    /** A listener for the `gattserverdisconnected` event. */
    public set ongattserverdisconnected(fn: (ev: Event) => void) {
        if (this._ongattserverdisconnected) {
            this.removeEventListener('gattserverdisconnected', this._ongattserverdisconnected);
            this._ongattserverdisconnected = undefined;
        }
        if (fn) {
            this._ongattserverdisconnected = fn;
            this.addEventListener('gattserverdisconnected', this._ongattserverdisconnected);
        }
    }

    /** A listener for the `advertisementreceived` event. */
    public set onadvertisementreceived(fn: (ev: Event) => void) {
        if (this._onadvertisementreceived) {
            this.removeEventListener('advertisementreceived', this._onadvertisementreceived);
            this._onadvertisementreceived = undefined;
        }
        if (fn) {
            this._onadvertisementreceived = fn;
            this.addEventListener('advertisementreceived', this._onadvertisementreceived);
        }
    }

    /**
     * Device constructor.
     * @param init A partial class to initialise values.
     */
    constructor(init: Partial<BluetoothDevice>, private forgetFn: () => void) {
        super();

        this.id = init.id;
        this.name = init.name;
        this.gatt = init.gatt;

        this._adData = init._adData;
        this._bluetooth = init._bluetooth;
        this._allowedServices = init._allowedServices;
        this._serviceUUIDs = init._serviceUUIDs;

        if (!this.name) this.name = `Unknown or Unsupported Device (${this.id})`;
        if (!this.gatt) this.gatt = new BluetoothRemoteGATTServer(this);
    }

    /**
     * Starts watching adverts from this device (not implemented)
     */
    public watchAdvertisements(): Promise<void> {
        throw new Error('watchAdvertisements error: method not implemented');
    }

    /**
     * Stops watching adverts from this device (not implemented)
     */
    public unwatchAdvertisements(): Promise<void> {
        throw new Error('unwatchAdvertisements error: method not implemented');
    }

    /**
     * Forget this device.
     */
    public async forget(): Promise<void> {
        this.forgetFn();
    }
}
