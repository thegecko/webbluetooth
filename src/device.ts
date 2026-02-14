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

import { BluetoothDeviceInit } from './adapters/adapter';
import { BluetoothRemoteGATTServerImpl } from './server';
import { ServiceEvents } from './service';
import { EventDispatcher } from './events';

/**
 * @hidden
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
 * Bluetooth Device class
 */
export class BluetoothDeviceImpl extends EventDispatcher<BluetoothDeviceEvents> implements BluetoothDevice {

    /**
     * The unique identifier of the device
     */
    public readonly id: string;

    /**
     * The name of the device
     */
    public readonly name: string;

    /**
     * The gatt server of the device
     */
    public readonly gatt: BluetoothRemoteGATTServer;

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
        mtu?: number;
        serviceData?: BluetoothServiceData;
        manufacturerData?: BluetoothManufacturerData;
    };

    /**
     * @hidden
     */
    public readonly _bluetooth: Bluetooth;

    /**
     * @hidden
     */
    public readonly _allowedServices: Array<string> = [];

    /**
     * @hidden
     */
    public readonly _serviceUUIDs: Array<string> = [];

    private _oncharacteristicvaluechanged: ((ev: Event) => void) | undefined;
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

    private _onserviceadded: ((ev: Event) => void) | undefined;
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

    private _onservicechanged: ((ev: Event) => void) | undefined;
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

    private _onserviceremoved: ((ev: Event) => void) | undefined;
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

    private _ongattserverdisconnected: ((ev: Event) => void) | undefined;
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

    private _onadvertisementreceived: ((ev: Event) => void) | undefined;
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
    constructor(init: BluetoothDeviceInit, bluetooth: Bluetooth, allowedServices: string[], private forgetFn: () => void) {
        super();

        this.id = init.id;
        this.name = init.name || `Unknown or Unsupported Device (${this.id})`;

        this._adData = init._adData;
        this._bluetooth = bluetooth;
        this._allowedServices = allowedServices;
        this._serviceUUIDs = init._serviceUUIDs;

        this.gatt = new BluetoothRemoteGATTServerImpl(this);
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
