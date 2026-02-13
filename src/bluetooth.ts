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
import { adapter, EVENT_ENABLED } from './adapters';
import { BluetoothDeviceInit } from './adapters/adapter';
import { BluetoothDevice } from './device';
import { BluetoothUUID } from './uuid';

/**
 * Bluetooth Options interface
 */
export interface BluetoothOptions {
    /**
     * A `device found` callback function to allow the user to select a device
     */
    deviceFound?: (device: BluetoothDevice, selectFn: () => void) => boolean;

    /**
     * The amount of seconds to scan for the device (default is 10)
     */
    scanTime?: number;

    /**
     * Optional flag to automatically allow all devices
     */
    allowAllDevices?: boolean;

    /**
     * An optional referring device
     */
    referringDevice?: BluetoothDevice;

    /**
     * An optional index of bluetooth adapter to use
     */
    adapterIndex?: number;
}

/**
 * Bluetooth class
 *
 * ### Events
 *
 * | Name | Event | Description |
 * | ---- | ----- | ----------- |
 * | `advertisementreceived` | {@link BluetoothAdvertisingEvent} | Advertisement received. |
 * | `availabilitychanged` | Event | Bluetooth availability changed. |
 * | `characteristicvaluechanged` | Event | The value of a BLE Characteristic has changed. |
 * | `gattserverdisconnected` | Event | GATT server has been disconnected. |
 * | `serviceadded` | Event | A new service is available. |
 * | `servicechanged` | Event | An existing service has changed. |
 * | `serviceremoved` | Event | A service is unavailable. |
 */
class BluetoothImpl extends EventDispatcher<BluetoothEventMap & BluetoothDeviceEventMap & BluetoothRemoteGATTCharacteristicEventMap & BluetoothRemoteGATTServiceEventMap> implements Bluetooth {
    /**
     * Referring device for the bluetooth instance
     */
    public readonly referringDevice?: BluetoothDevice;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private scanner: any;
    private deviceFound: ((device: BluetoothDevice, selectFn: () => void) => boolean) | undefined;
    private scanTime: number = 10.24 * 1000;
    private allowedDevices = new Set<string>();

    /**
     * Bluetooth constructor
     * @param options Bluetooth initialisation options
     */
    constructor(private options: BluetoothOptions = {}) {
        super();

        this.referringDevice = options.referringDevice;
        this.deviceFound = options.deviceFound;
        if (options.scanTime) {
            this.scanTime = options.scanTime * 1000;
        }

        if (typeof options.adapterIndex === 'number') {
            adapter.useAdapter(options.adapterIndex);
        }

        adapter.on(EVENT_ENABLED, _value => {
            this.dispatchEvent(new CustomEvent('availabilitychanged', { bubbles: true }));
        });
    }

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

    private _onavailabilitychanged: ((ev: Event) => void) | undefined;
    public set onavailabilitychanged(fn: (ev: Event) => void) {
        if (this._onavailabilitychanged) {
            this.removeEventListener('availabilitychanged', this._onavailabilitychanged);
            this._onavailabilitychanged = undefined;
        }
        if (fn) {
            this._onavailabilitychanged = fn;
            this.addEventListener('availabilitychanged', this._onavailabilitychanged);
        }
    }

    private filterDevice(filters: Array<BluetoothLEScanFilter>, deviceInfo: BluetoothDeviceInit, validServices: string[]): BluetoothDeviceInit | undefined {
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

        let searchUUIDs: string[] = [];

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
                let validServices: string[] = [];

                const complete = (bluetoothDevice: BluetoothDevice) => {
                    this.allowedDevices.add(bluetoothDevice.id);
                    this.cancelRequest();
                    resolve(bluetoothDevice);
                };

                // filter devices if filters specified
                if (isFiltered(options)) {
                    const filtered = this.filterDevice(options.filters, deviceInfo, validServices);
                    if (filtered) {
                        deviceInfo = filtered;
                    }
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

                    const bluetoothDevice = new BluetoothDevice(deviceInfo, this, allowedServices, () => this.forgetDevice(deviceInfo.id));

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
                if (this.options.allowAllDevices || this.allowedDevices.has(deviceInfo.id)) {
                    const bluetoothDevice = new BluetoothDevice(deviceInfo, this, [], () => this.forgetDevice(deviceInfo.id));
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

export { BluetoothImpl as Bluetooth };

/**
 * List available bluetooth adapters
 */
export const getAdapters = adapter.getAdapters;
