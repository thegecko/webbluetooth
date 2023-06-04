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
import { DOMEvent } from './events';
import {
    BluetoothDeviceEventMap,
    BluetoothDevice,
} from './device';

/**
 * Bluetooth options.
 */
export interface BluetoothOptions {
    /**
     * A `device found` callback function to allow the user to select a device.
     */
    deviceFound?: (device: BluetoothDevice, selectFn: () => void) => boolean;

    /**
     * The amount of seconds to scan for the device (default is 10).
     */
    scanTime?: number;

    /**
     * Optional flag to automatically allow all devices.
     */
    allowAllDevices?: boolean;

    /**
     * An optional referring device.
     */
    referringDevice?: BluetoothDevice;
}

/** @hidden Events for {@link BluetoothDevice} */
export interface BluetoothEventMap extends BluetoothDeviceEventMap {
    /** Bluetooth Availability Changed event. */
    availabilitychanged: Event;
}

/**
 * Bluetooth class.
 */
export class Bluetooth extends EventTarget {
    private deviceFound: (device: BluetoothDevice, selectFn: () => void) => boolean = undefined;
    private scanTime: number = 10.24 * 1000;
    private scanner = undefined;
    private allowedDevices = new Set<string>();
    private _oncharacteristicvaluechanged: EventListenerOrEventListenerObject;
    private _onserviceadded?: EventListenerOrEventListenerObject;
    private _onservicechanged?: EventListenerOrEventListenerObject;
    private _onserviceremoved?: EventListenerOrEventListenerObject;
    private _ongattserverdisconnected?: EventListenerOrEventListenerObject;
    private _onadvertisementreceived?: EventListenerOrEventListenerObject;
    private _onavailabilitychanged?: EventListenerOrEventListenerObject;

    /**
     * Referring device for the bluetooth instance.
     */
    public readonly referringDevice?: BluetoothDevice;

    /**
     * Bluetooth constructor.
     * @param options Bluetooth initialisation options.
     */
    constructor(private options: BluetoothOptions = {}) {
        super();
        this.referringDevice = options.referringDevice;
        this.deviceFound = options.deviceFound;
        if (options.scanTime) {
            this.scanTime = options.scanTime * 1000;
        }

        adapter.addEventListener("enabledchanged", (_) => {
            // TODO: WebBluetooth says e.value should be a boolean.
            this.dispatchEvent(new DOMEvent(this, 'availabilitychanged'));
        });
    }

    public set oncharacteristicvaluechanged(fn: EventListenerOrEventListenerObject) {
        if (this._oncharacteristicvaluechanged) {
            this.removeEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
            this._oncharacteristicvaluechanged = undefined;
        }
        if (fn) {
            this._oncharacteristicvaluechanged = fn;
            this.addEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
        }
    }

    public set onserviceadded(fn: EventListenerOrEventListenerObject) {
        if (this._onserviceadded) {
            this.removeEventListener('serviceadded', this._onserviceadded);
            this._onserviceadded = undefined;
        }
        if (fn) {
            this._onserviceadded = fn;
            this.addEventListener('serviceadded', this._onserviceadded);
        }
    }

    public set onservicechanged(fn: EventListenerOrEventListenerObject) {
        if (this._onservicechanged) {
            this.removeEventListener('servicechanged', this._onservicechanged);
            this._onservicechanged = undefined;
        }
        if (fn) {
            this._onservicechanged = fn;
            this.addEventListener('servicechanged', this._onservicechanged);
        }
    }

    public set onserviceremoved(fn: EventListenerOrEventListenerObject) {
        if (this._onserviceremoved) {
            this.removeEventListener('serviceremoved', this._onserviceremoved);
            this._onserviceremoved = undefined;
        }
        if (fn) {
            this._onserviceremoved = fn;
            this.addEventListener('serviceremoved', this._onserviceremoved);
        }
    }

    public set ongattserverdisconnected(fn: EventListenerOrEventListenerObject) {
        if (this._ongattserverdisconnected) {
            this.removeEventListener('gattserverdisconnected', this._ongattserverdisconnected);
            this._ongattserverdisconnected = undefined;
        }
        if (fn) {
            this._ongattserverdisconnected = fn;
            this.addEventListener('gattserverdisconnected', this._ongattserverdisconnected);
        }
    }

    public set onadvertisementreceived(fn: EventListenerOrEventListenerObject) {
        if (this._onadvertisementreceived) {
            this.removeEventListener('advertisementreceived', this._onadvertisementreceived);
            this._onadvertisementreceived = undefined;
        }
        if (fn) {
            this._onadvertisementreceived = fn;
            this.addEventListener('advertisementreceived', this._onadvertisementreceived);
        }
    }

    public set onavailabilitychanged(fn: EventListenerOrEventListenerObject) {
        if (this._onavailabilitychanged) {
            this.removeEventListener('availabilitychanged', this._onavailabilitychanged);
            this._onavailabilitychanged = undefined;
        }
        if (fn) {
            this._onavailabilitychanged = fn;
            this.addEventListener('availabilitychanged', this._onavailabilitychanged);
        }
    }

    private filterDevice(
        filters: Array<BluetoothLEScanFilter>,
        deviceInfo: Partial<BluetoothDevice>,
        validServices: BluetoothServiceUUID[]
    ): Partial<BluetoothDevice> | undefined {
        let valid = false;

        filters.forEach(filter => {
            // Name
            if (filter.name && filter.name !== deviceInfo.name) return;

            // NamePrefix
            if (filter.namePrefix) {
                if (!deviceInfo.name || filter.namePrefix.length > deviceInfo.name.length) return;
                if (filter.namePrefix !== deviceInfo.name.substr(0, filter.namePrefix.length)) return;
            }

            // Services
            if (filter.services) {
                const serviceUUIDs = filter.services.map(BluetoothUUID.getService);
                const servicesValid = serviceUUIDs.every(serviceUUID => {
                    return (deviceInfo._serviceUUIDs.indexOf(serviceUUID) > -1);
                });

                if (!servicesValid) return;
                validServices = validServices.concat(serviceUUIDs);
            }

            // Service Data
            if (filter.serviceData) {
                if (!deviceInfo._adData.serviceData) return;
                const services = [...deviceInfo._adData.serviceData.keys()];
                for (const entry of filter.serviceData) {
                    if (!services.includes(entry.service)) return;
                }
            }

            // Manufacturer Data
            if (filter.manufacturerData) {
                if (!deviceInfo._adData.manufacturerData) return;
                const manufacturers = [...deviceInfo._adData.manufacturerData.keys()];
                for (const entry of filter.manufacturerData) {
                    if (!manufacturers.includes(entry.companyIdentifier)) return;
                }
            }

            valid = true;
        });

        if (!valid) return undefined;
        return deviceInfo;
    }

    private forgetDevice(uuid: string): void {
        this.allowedDevices.delete(uuid);
    }

    /**
     * Gets the availability of a bluetooth adapter
     * @returns Promise containing a flag indicating bluetooth availability
     */
    public getAvailability(): Promise<boolean> {
        return adapter.getEnabled();
    }

    /**
     * Scans for a device matching optional filters
     * @param options The options to use when scanning
     * @returns Promise containing a device which matches the options
     */
    public requestDevice(options: RequestDeviceOptions = { filters: [] }): Promise<BluetoothDevice> {
        if (this.scanner !== undefined) {
            throw new Error('requestDevice error: request in progress');
        }

        interface Filtered {
            filters: Array<BluetoothLEScanFilter>;
            optionalServices?: Array<BluetoothServiceUUID>;
        }

        interface AcceptAll {
            acceptAllDevices: boolean;
            optionalServices?: Array<BluetoothServiceUUID>;
        }

        const isFiltered = (maybeFiltered: RequestDeviceOptions): maybeFiltered is Filtered =>
            (maybeFiltered as Filtered).filters !== undefined;

        const isAcceptAll = (maybeAcceptAll: RequestDeviceOptions): maybeAcceptAll is AcceptAll =>
            (maybeAcceptAll as AcceptAll).acceptAllDevices === true;

        let searchUUIDs = [];

        if (isFiltered(options)) {
            // Must have a filter
            if (options.filters.length === 0) {
                throw new TypeError('requestDevice error: no filters specified');
            }

            // Don't allow empty filters
            const emptyFilter = options.filters.some(filter => {
                return (Object.keys(filter).length === 0);
            });
            if (emptyFilter) {
                throw new TypeError('requestDevice error: empty filter specified');
            }

            // Don't allow empty namePrefix
            const emptyPrefix = options.filters.some(filter => {
                return (typeof filter.namePrefix !== 'undefined' && filter.namePrefix === '');
            });
            if (emptyPrefix) {
                throw new TypeError('requestDevice error: empty namePrefix specified');
            }

            options.filters.forEach(filter => {
                if (filter.services) searchUUIDs = searchUUIDs.concat(filter.services.map(BluetoothUUID.getService));

                // Unique-ify
                searchUUIDs = searchUUIDs.filter((item, index, array) => {
                    return array.indexOf(item) === index;
                });
            });
        } else if (!isAcceptAll(options)) {
            throw new TypeError('requestDevice error: specify filters or acceptAllDevices');
        }

        return new Promise((resolve, reject) => {
            let found = false;
            this.scanner = setTimeout(() => {
                this.cancelRequest();
                if (!found) {
                    reject('requestDevice error: no devices found');
                }
            }, this.scanTime);

            adapter.startScan(searchUUIDs, deviceInfo => {
                let validServices = [];

                const complete = (bluetoothDevice: BluetoothDevice) => {
                    this.allowedDevices.add(bluetoothDevice.id);
                    this.cancelRequest();
                    resolve(bluetoothDevice);
                };

                // filter devices if filters specified
                if (isFiltered(options)) {
                    deviceInfo = this.filterDevice(options.filters, deviceInfo, validServices);
                }

                if (deviceInfo) {
                    found = true;

                    // Add additional services
                    if (options.optionalServices) {
                        validServices = validServices.concat(options.optionalServices.map(BluetoothUUID.getService));
                    }

                    // Set unique list of allowed services
                    const allowedServices = validServices.filter((item, index, array) => {
                        return array.indexOf(item) === index;
                    });
                    Object.assign(deviceInfo, {
                        _bluetooth: this,
                        _allowedServices: allowedServices
                    });

                    const bluetoothDevice = new BluetoothDevice(deviceInfo, () => this.forgetDevice(deviceInfo.id));

                    const selectFn = () => {
                        complete.call(this, bluetoothDevice);
                    };

                    if (!this.deviceFound || this.deviceFound(bluetoothDevice, selectFn.bind(this)) === true) {
                        // If no deviceFound function, or deviceFound returns true, resolve with this device immediately
                        complete.call(this, bluetoothDevice);
                    }
                }
            });
        });
    }

    /**
     * Get all bluetooth devices
     */
    public getDevices(): Promise<BluetoothDevice[]> {
        if (this.scanner !== undefined) {
            throw new Error('getDevices error: request in progress');
        }

        return new Promise(resolve => {
            const devices: BluetoothDevice[] = [];

            this.scanner = setTimeout(() => {
                this.cancelRequest();
                resolve(devices);
            }, this.scanTime);

            adapter.startScan([], deviceInfo => {
                if (this.options?.allowAllDevices || this.allowedDevices.has(deviceInfo.id)) {
                    Object.assign(deviceInfo, {
                        _bluetooth: this,
                        _allowedServices: []
                    });

                    const bluetoothDevice = new BluetoothDevice(deviceInfo, () => this.forgetDevice(deviceInfo.id));
                    devices.push(bluetoothDevice);
                }
            });
        });
    }

    /**
     * Cancels the scan for devices
     */
    public cancelRequest(): void {
        if (this.scanner) {
            clearTimeout(this.scanner);
            this.scanner = undefined;
            adapter.stopScan();
        }
    }

    /**
     * @hidden
     * Request LE scan (not implemented)
     */
    public requestLEScan(_options?: BluetoothLEScanOptions): Promise<BluetoothLEScan> {
        throw new Error('requestLEScan error: method not implemented.');
    }
}
