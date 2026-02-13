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

import { EventDispatcher } from './events';
import { adapter } from './adapters';
import { BluetoothDevice } from './device';
import { BluetoothRemoteGATTCharacteristic } from './characteristic';
import { BluetoothUUID } from './uuid';
import { BluetoothRemoteGATTServiceInit } from './adapters/adapter';

/**
 * Bluetooth Remote GATT Service class
 *
 * ### Events
 *
 * | Name | Event | Description |
 * | ---- | ----- | ----------- |
 * | `characteristicvaluechanged` | Event | The value of a BLE Characteristic has changed. |
 * | `serviceadded` | Event | A new service is available. |
 * | `servicechanged` | Event | An existing service has changed. |
 * | `serviceremoved` | Event | A service is unavailable. |
 */
class BluetoothRemoteGATTServiceImpl extends EventDispatcher<BluetoothRemoteGATTCharacteristicEventMap & BluetoothRemoteGATTServiceEventMap> implements BluetoothRemoteGATTService {

    /**
     * The device the service is related to
     */
    public readonly device: BluetoothDevice;

    /**
     * The unique identifier of the service
     */
    public readonly uuid: string;

    /**
     * Whether the service is a primary one
     */
    public readonly isPrimary: boolean = false;


    /**
     * @hidden
     */
    public _handle: string;
    private services: Array<BluetoothRemoteGATTService> | undefined;
    private characteristics: Array<BluetoothRemoteGATTCharacteristic> | undefined;

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

    /**
     * Service constructor
     * @param init A partial class to initialise values
     */
    constructor(init: BluetoothRemoteGATTServiceInit, device: BluetoothDevice) {
        super();

        this.device = device;
        this.uuid = init.uuid;
        this.isPrimary = init.isPrimary;
        this._handle = init._handle;

        this.dispatchEvent(new CustomEvent('serviceadded', { bubbles: true }));
        this.device.dispatchEvent(new CustomEvent('serviceadded', { bubbles: true }));
        this.device._bluetooth.dispatchEvent(new CustomEvent('serviceadded', { bubbles: true }));
    }

    /**
     * Gets a single characteristic contained in the service
     * @param characteristic characteristic UUID
     * @returns Promise containing the characteristic
     */
    public async getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic> {
        if (!this.device.gatt.connected) {
            throw new Error('getCharacteristic error: device not connected');
        }

        if (!characteristic) {
            throw new Error('getCharacteristic error: no characteristic specified');
        }

        const characteristics = await this.getCharacteristics(characteristic);
        if (characteristics.length !== 1) {
            throw new Error('getCharacteristic error: characteristic not found');
        }

        return characteristics[0];
    }

    /**
     * Gets a list of characteristics contained in the service
     * @param characteristic characteristic UUID
     * @returns Promise containing an array of characteristics
     */
    public async getCharacteristics(characteristic?: BluetoothCharacteristicUUID): Promise<Array<BluetoothRemoteGATTCharacteristic>> {
        if (!this.device.gatt.connected) {
            throw new Error('getCharacteristics error: device not connected');
        }

        if (!this.characteristics) {
            const characteristics = await adapter.discoverCharacteristics(this._handle);
            this.characteristics = characteristics.map(characteristicInfo => {
                return new BluetoothRemoteGATTCharacteristic(characteristicInfo, this);
            });
        }

        if (!characteristic) {
            return this.characteristics;
        }

        // Canonical-ize characteristic
        characteristic = BluetoothUUID.getCharacteristic(characteristic);

        const filtered = this.characteristics.filter(characteristicObject => characteristicObject.uuid === characteristic);

        if (filtered.length !== 1) {
            throw new Error('getCharacteristics error: characteristic not found');
        }

        return filtered;
    }

    /**
     * Gets a single service included in the service
     * @param service service UUID
     * @returns Promise containing the service
     */
    public async getIncludedService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService> {
        if (!this.device.gatt.connected) {
            throw new Error('getIncludedService error: device not connected');
        }

        if (!service) {
            throw new Error('getIncludedService error: no service specified');
        }

        const services = await this.getIncludedServices(service);
        if (services.length !== 1) {
            throw new Error('getIncludedService error: service not found');
        }

        return services[0];
    }

    /**
     * Gets a list of services included in the service
     * @param service service UUID
     * @returns Promise containing an array of services
     */
    public async getIncludedServices(service?: BluetoothServiceUUID): Promise<Array<BluetoothRemoteGATTService>> {
        if (!this.device.gatt.connected) {
            throw new Error('getIncludedServices error: device not connected');
        }

        if (!this.services) {
            const services = await adapter.discoverIncludedServices(this._handle, this.device._allowedServices);
            this.services = services.map(serviceInfo => {
                return new BluetoothRemoteGATTServiceImpl(serviceInfo, this.device);
            });
        }

        if (!service) {
            return this.services;
        }

        const filtered = this.services.filter(serviceObject => serviceObject.uuid === BluetoothUUID.getService(service));

        if (filtered.length !== 1) {
            throw new Error('getIncludedServices error: service not found');
        }

        return filtered;
    }
}

export { BluetoothRemoteGATTServiceImpl as BluetoothRemoteGATTService };
