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

import { adapter } from './adapter/adapter';
import { BluetoothUUID } from './uuid';
import { BluetoothRemoteGATTService } from './service';
import { DOMEvent } from './events';
import type { BluetoothDevice } from './device';

/**
 * Bluetooth Remote GATT Server class.
 */
export class BluetoothRemoteGATTServer extends EventTarget {
    private _connected = false;
    private handle: string = undefined;
    private services: BluetoothRemoteGATTService[] = undefined;

    /**
     * The device the gatt server is related to.
     */
    public readonly device: BluetoothDevice = undefined;

    /**
     * Whether the gatt server is connected.
     */
    public get connected(): boolean {
        return this._connected;
    }

    /**
     * Server constructor.
     * @param device Device the gatt server relates to.
     */
    constructor(device: BluetoothDevice) {
        super();
        this.device = device;
        this.handle = this.device.id;
    }

    /**
     * Connect the gatt server.
     * @returns Promise containing the gatt server.
     */
    public async connect(): Promise<BluetoothRemoteGATTServer> {
        if (this.connected) {
            throw new Error('connect error: device already connected');
        }

        await adapter.connect(this.handle, () => {
            this.services = undefined;
            this._connected = false;
            this.device.dispatchEvent(new DOMEvent(this.device, 'gattserverdisconnected'));
            this.device._bluetooth.dispatchEvent(new DOMEvent(this.device, 'gattserverdisconnected'));
        });

        this._connected = true;
        return this;
    }

    /**
     * Disconnect the gatt server.
     */
    public disconnect(): void {
        adapter.disconnect(this.handle);
        this._connected = false;
    }

    /**
     * Gets a single primary service contained in the gatt server.
     * @param service Service UUID.
     * @returns Promise containing the service.
     */
    public async getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService> {
        if (!this.connected) {
            throw new Error('getPrimaryService error: device not connected');
        }

        if (!service) {
            throw new Error('getPrimaryService error: no service specified');
        }

        const services = await this.getPrimaryServices(service);
        if (services.length !== 1) {
            throw new Error('getPrimaryService error: service not found');
        }

        return services[0];
    }

    /**
     * Gets a list of primary services contained in the gatt server.
     * @param service Service UUID.
     * @returns Promise containing an array of services.
     */
    public async getPrimaryServices(service?: BluetoothServiceUUID): Promise<Array<BluetoothRemoteGATTService>> {
        if (!this.connected) {
            throw new Error('getPrimaryServices error: device not connected');
        }

        if (!this.services) {
            const services = await adapter.discoverServices(this.handle, this.device._allowedServices);
            this.services = services.map(serviceInfo => {
                Object.assign(serviceInfo, {
                    device: this.device
                });
                return new BluetoothRemoteGATTService(serviceInfo);
            });
        }

        if (!service) {
            return this.services;
        }

        const filtered = this.services.filter(serviceObject => serviceObject.uuid === BluetoothUUID.getService(service));

        if (filtered.length !== 1) {
            throw new Error('getPrimaryServices error: service not found');
        }

        return filtered;
    }
}
