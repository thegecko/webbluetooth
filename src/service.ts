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

import { EventDispatcher, TypedDispatcher } from "./dispatcher";
import { BluetoothDevice } from "./device";
import { BluetoothRemoteGATTCharacteristic, BluetoothRemoteGATTCharacteristicEvents } from "./characteristic";
import { getCharacteristicUUID, getServiceUUID } from "./helpers";
import { adapter } from "./adapter";
import { W3CBluetoothRemoteGATTService } from "./interfaces";
import { DOMEvent } from "./events";

/**
 * @hidden
 */
export interface BluetoothRemoteGATTServiceEvents extends BluetoothRemoteGATTCharacteristicEvents {
    /**
     * Service added event
     */
    serviceadded: Event;
    /**
     * Service changed event
     */
    servicechanged: Event;
    /**
     * Service removed event
     */
    serviceremoved: Event;
}

/**
 * Bluetooth Remote GATT Service class
 */
export class BluetoothRemoteGATTService extends (EventDispatcher as new() => TypedDispatcher<BluetoothRemoteGATTServiceEvents>) implements W3CBluetoothRemoteGATTService {

    /**
     * The device the service is related to
     */
    public readonly device: BluetoothDevice = null;

    /**
     * The unique identifier of the service
     */
    public readonly uuid: string = null;

    /**
     * Whether the service is a primary one
     */
    public readonly isPrimary: boolean = false;

    private handle: string = null;
    private services: Array<BluetoothRemoteGATTService> = null;
    private characteristics: Array<BluetoothRemoteGATTCharacteristic> = null;

    private _oncharacteristicvaluechanged: (ev: Event) => void;
    public set oncharacteristicvaluechanged(fn: (ev: Event) => void) {
        if (this._oncharacteristicvaluechanged) {
            this.removeEventListener("characteristicvaluechanged", this._oncharacteristicvaluechanged);
        }
        this._oncharacteristicvaluechanged = fn;
        this.addEventListener("characteristicvaluechanged", this._oncharacteristicvaluechanged);
    }

    private _onserviceadded: (ev: Event) => void;
    public set onserviceadded(fn: (ev: Event) => void) {
        if (this._onserviceadded) {
            this.removeEventListener("serviceadded", this._onserviceadded);
        }
        this._onserviceadded = fn;
        this.addEventListener("serviceadded", this._onserviceadded);
    }

    private _onservicechanged: (ev: Event) => void;
    public set onservicechanged(fn: (ev: Event) => void) {
        if (this._onservicechanged) {
            this.removeEventListener("servicechanged", this._onservicechanged);
        }
        this._onservicechanged = fn;
        this.addEventListener("servicechanged", this._onservicechanged);
    }

    private _onserviceremoved: (ev: Event) => void;
    public set onserviceremoved(fn: (ev: Event) => void) {
        if (this._onserviceremoved) {
            this.removeEventListener("serviceremoved", this._onserviceremoved);
        }
        this._onserviceremoved = fn;
        this.addEventListener("serviceremoved", this._onserviceremoved);
    }

    /**
     * Service constructor
     * @param init A partial class to initialise values
     */
    constructor(init: Partial<BluetoothRemoteGATTService>) {
        super();

        this.device = init.device;
        this.uuid = init.uuid;
        this.isPrimary = init.isPrimary;

        this.handle = this.uuid;

        this.dispatchEvent(new DOMEvent(this, "serviceadded"));
        this.device.dispatchEvent(new DOMEvent(this, "serviceadded"));
        this.device._bluetooth.dispatchEvent(new DOMEvent(this, "serviceadded"));
    }

    /**
     * Gets a single characteristic contained in the service
     * @param characteristic characteristic UUID
     * @returns Promise containing the characteristic
     */
    public getCharacteristic(characteristic: string | number): Promise<BluetoothRemoteGATTCharacteristic> {
        return new Promise((resolve, reject) => {
            if (!this.device.gatt.connected) return reject("getCharacteristic error: device not connected");
            if (!characteristic) return reject("getCharacteristic error: no characteristic specified");

            this.getCharacteristics(characteristic)
            .then(characteristics => {
                if (characteristics.length !== 1) return reject("getCharacteristic error: characteristic not found");
                resolve(characteristics[0]);
            })
            .catch(error => {
                reject(`getCharacteristic error: ${error}`);
            });
        });
    }

    /**
     * Gets a list of characteristics contained in the service
     * @param characteristic characteristic UUID
     * @returns Promise containing an array of characteristics
     */
    public getCharacteristics(characteristic?: string | number): Promise<Array<BluetoothRemoteGATTCharacteristic>> {
        return new Promise((resolve, reject) => {
            if (!this.device.gatt.connected) return reject("getCharacteristics error: device not connected");

            function complete() {
                if (!characteristic) return resolve(this.characteristics);

                // Canonical-ize characteristic
                characteristic = getCharacteristicUUID(characteristic);

                const filtered = this.characteristics.filter(characteristicObject => {
                    return (characteristicObject.uuid === characteristic);
                });

                if (filtered.length !== 1) return reject("getCharacteristics error: characteristic not found");
                resolve(filtered);
            }

            if (this.characteristics) return complete.call(this);

            adapter.discoverCharacteristics(this.handle, [], characteristics => {
                this.characteristics = characteristics.map(characteristicInfo => {
                    Object.assign(characteristicInfo, {
                        service: this
                    });
                    return new BluetoothRemoteGATTCharacteristic(characteristicInfo);
                });

                complete.call(this);
            }, error => {
                reject(`getCharacteristics error: ${error}`);
            });
        });
    }

    /**
     * Gets a single service included in the service
     * @param service service UUID
     * @returns Promise containing the service
     */
    public getIncludedService(service: string | number): Promise<BluetoothRemoteGATTService> {
        return new Promise((resolve, reject) => {
            if (!this.device.gatt.connected) return reject("getIncludedService error: device not connected");
            if (!service) return reject("getIncludedService error: no service specified");

            this.getIncludedServices(service)
            .then(services => {
                if (services.length !== 1) return reject("getIncludedService error: service not found");
                resolve(services[0]);
            })
            .catch(error => {
                reject(`getIncludedService error: ${error}`);
            });
        });
    }

    /**
     * Gets a list of services included in the service
     * @param service service UUID
     * @returns Promise containing an array of services
     */
    public getIncludedServices(service?: string | number): Promise<Array<BluetoothRemoteGATTService>> {
        return new Promise((resolve, reject) => {
            if (!this.device.gatt.connected) return reject("getIncludedServices error: device not connected");

            function complete() {
                if (!service) return resolve(this.services);

                const filtered = this.services.filter(serviceObject => {
                    return (serviceObject.uuid === getServiceUUID(service));
                });

                if (filtered.length !== 1) return reject("getIncludedServices error: service not found");
                resolve(filtered);
            }

            if (this.services) return complete.call(this);

            adapter.discoverIncludedServices(this.handle, this.device._allowedServices, services => {
                this.services = services.map(serviceInfo => {
                    Object.assign(serviceInfo, {
                        device: this.device
                    });
                    return new BluetoothRemoteGATTService(serviceInfo);
                });

                complete.call(this);
            }, error => {
                reject(`getIncludedServices error: ${error}`);
            });
        });
    }
}
