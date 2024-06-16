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
import { ServiceEvents } from './service';

/**
 * Events for {@link BluetoothDevice}.
 */
export interface BluetoothDeviceEvents extends ServiceEvents {
    /**
     * GATT server disconnected event
     */
    gattserverdisconnected: Event;
    /**
     * Advertisement received event
     */
    advertisementreceived: Event;
}

/**
 * Bluetooth Device class.
 * 
 * ### Events
 * 
 * | Name | Event | Description |
 * | ---- | ----- | ----------- |
 * | `advertisementreceived` | {@link BluetoothAdvertisingEvent} | Advertisement received. |
 * | `characteristicvaluechanged` | {@link Event} | The value of a BLE Characteristic has changed. |
 * | `gattserverdisconnected` | {@link Event} | GATT server has been disconnected. |
 * | `serviceadded` | {@link Event} | A new service is available. |
 * | `servicechanged` | {@link Event} | An existing service has changed. |
 * | `serviceremoved` | {@link Event} | A service is unavailable. |
 */
export class BluetoothDevice extends EventTarget {

    /**
     * The unique identifier of the device
     */
    public readonly id: string = undefined;

    /**
     * The name of the device
     */
    public readonly name: string = undefined;

    /**
     * The gatt server of the device
     */
    public readonly gatt: BluetoothRemoteGATTServer = undefined;

    /**
     * Whether adverts are being watched (not implemented)
     */
    public readonly watchingAdvertisements: boolean = false;

    /**
     * @hidden
     */
    public readonly _adData: {
        rssi?: number;
        txPower?: number;
        serviceData?: BluetoothServiceData;
        manufacturerData?: BluetoothManufacturerData;
    };

    /**
     * @hidden
     */
    public readonly _bluetooth: Bluetooth = undefined;

    /**
     * @hidden
     */
    public readonly _allowedServices: Array<string> = [];

    /**
     * @hidden
     */
    public readonly _serviceUUIDs: Array<string> = [];

    /** Events. */
    public addEventListener<K extends keyof BluetoothDeviceEvents>(
        type: K,
        callback: (this: this, event: BluetoothDeviceEvents[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void;
    /** @hidden */
    public addEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: EventListenerOptions | boolean
    ): void {
        super.addEventListener(type, callback, options);
    }

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

    private _onserviceadded: (ev: Event) => void;
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

    private _onservicechanged: (ev: Event) => void;
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

    private _onserviceremoved: (ev: Event) => void;
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

    private _ongattserverdisconnected: (ev: Event) => void;
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

    private _onadvertisementreceived: (ev: Event) => void;
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
     * Device constructor
     * @param init A partial class to initialise values
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
     * Forget this device
     */
    public async forget(): Promise<void> {
        this.forgetFn();
    }
}
