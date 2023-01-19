/*
 * Node Web Bluetooth
 * Copyright (c) 2019 Rob Moran
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
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { abortable, delay, isView } from "./common.ts";
import { Bindings, Adapter } from "./bindings.ts";
import { BluetoothDevice, BluetoothDeviceEventMap } from "./gatt.ts";
import {
    BluetoothManufacturerData,
    BluetoothManufacturerDataFilter,
    BluetoothServiceData,
    BluetoothServiceUUID,
} from "./interfaces.ts";

import type {
    BluetoothLEScanFilter,
    RequestDeviceInfo,
    RequestDeviceOptions,
} from "./interfaces.ts";

/** @hidden Events for {@link BluetoothDevice} */
export interface BluetoothEventMap extends BluetoothDeviceEventMap {
    /** Bluetooth Availability Changed event. */
    availabilitychanged: Event;
}

function checkManufacturerData(
    map: BluetoothManufacturerData,
    filters: BluetoothManufacturerDataFilter[],
): boolean {
    for (const filter of filters) {
        const { companyIdentifier, dataPrefix } = filter;
        // Company ID not found; not a match.
        if (!map.has(companyIdentifier)) {
            continue;
        }
        // If no dataPrefix, then the match was successful.
        if (!dataPrefix) {
            return true;
        }
        const view = map.get(companyIdentifier);
        if (!view) {
            // Not sure if this is correct.
            continue;
        }
        const buffer = isView(dataPrefix) ? dataPrefix.buffer : dataPrefix;
        const bytes = new Uint8Array(buffer);
        const values: boolean[] = [];
        for (const [i, b] of bytes.entries()) {
            const a = view.getUint8(i);
            values[i] = a === b;
        }
        const valid = values.every((val) => val);
        if (valid) {
            return true;
        }
    }

    return false;
}

/** Interface for creating {@link BluetoothDevice} objects. */
export class Bluetooth extends EventTarget {
    private _bindings: Bindings;
    private _adapter: Adapter;
    private _devices: BluetoothDevice[];
    private _oncharacteristicvaluechanged?: EventListenerOrEventListenerObject;
    private _onserviceadded?: EventListenerOrEventListenerObject;
    private _onservicechanged?: EventListenerOrEventListenerObject;
    private _onserviceremoved?: EventListenerOrEventListenerObject;
    private _ongattserverdisconnected?: EventListenerOrEventListenerObject;
    private _onadvertisementreceived?: EventListenerOrEventListenerObject;
    private _onavailabilitychanged?: EventListenerOrEventListenerObject;

    /** Referring device for the bluetooth instance. */
    readonly referringDevice?: BluetoothDevice;

    /** @hidden */
    constructor(bindings: Bindings) {
        super();
        this._bindings = bindings;
        this._devices = [];

        const enabled = this._bindings.simpleble_adapter_is_bluetooth_enabled();
        if (!enabled) {
            throw new DOMException("No Bluetooth adapters found", "NotFoundError");
        }

        this._adapter = this._bindings.simpleble_adapter_get_handle(0);

        this.dispatchEvent(new Event("availabilitychanged"));
    }

    /** Determines if a working Bluetooth adapter is usable. */
    getAvailability(): Promise<boolean> {
        const count = this._bindings.simpleble_adapter_get_count();
        return Promise.resolve(count > 0);
    }

    /** Returns a list of every device requested thus far. */
    getDevices(): Promise<BluetoothDevice[]> {
        return Promise.resolve(this._devices);
    }

    private _filterDevice(
        filters: BluetoothLEScanFilter[],
        info: RequestDeviceInfo,
        _validServices: BluetoothServiceUUID[]
    ): boolean {
        for (const filter of filters) {
            if (filter.name && filter.name !== info.name) {
                continue;
            }

            if (filter.namePrefix) {
                if (!info.name || filter.namePrefix.length > info.name.length) {
                    continue;
                }
                if (!info.name.startsWith(filter.namePrefix)) {
                    continue;
                }
            }
            if (
                info.manufacturerData &&
                filter.manufacturerData &&
                !checkManufacturerData(info.manufacturerData, filter.manufacturerData)
            ) {
                continue;
            }

            if (filter.services) {
                throw new Error("Filtering by services is not supported yet");
                /*
                const serviceUUIDs = filter.services.map(getServiceUUID);
                const servicesValid = serviceUUIDs.every(serviceUUID => {
                    return (info._serviceUUIDs.indexOf(serviceUUID) > -1);
                });

                if (!servicesValid) return;
                validServices = validServices.concat(serviceUUIDs);
                */
            }
            return true;
        }
        return false;
    }


    /**
     * Scan for Bluetooth devices indefinitely.
     *
     * This function is not a part of the WebBluetooth standard. It was made as
     * a convenience function for long-running programs.
     */
    async *scan(
        options: RequestDeviceOptions,
    ): AsyncIterableIterator<BluetoothDevice> {
        const timeout = options.timeout ?? 200;
        const signal = options.signal;
        const addrs: string[] = [];
        const { filter, filters } = options as any;

        if (!filters && !filter) {
            throw new TypeError("filter or filters must be given");
        } else if (signal?.aborted) {
            throw new DOMException("Operation was canceled", "AbortError");
        }

        const filterCb = this._createFilter(options);

        let done = false;

        options.signal?.addEventListener("abort", () => {
            done = false;
        }, { once: true });

        while (!done) {
            this._bindings.simpleble_adapter_scan_start(this._adapter);
            await abortable(delay(timeout), signal);
            this._bindings.simpleble_adapter_scan_stop(this._adapter);

            const resultsCount = this._bindings.simpleble_adapter_scan_get_results_count(
                this._adapter,
            );

            for (let i = 0; i < resultsCount; i++) {
                const d = this._bindings.simpleble_adapter_scan_get_results_handle(this._adapter, i);
                const id = this._bindings.simpleble_peripheral_identifier(d);
                const address = this._bindings.simpleble_peripheral_address(d);
                if (addrs.includes(address)) {
                    continue;
                }
                const count = this._bindings.simpleble_peripheral_manufacturer_data_count(d);
                const serviceCount = this._bindings.simpleble_peripheral_services_count(d);
                const manufacturerData: BluetoothManufacturerData = new Map();
                const serviceData: BluetoothServiceData = new Map();
                const services: BluetoothServiceUUID[] = [];
                for (let j = 0; j < serviceCount; j++) {
                    const service = this._bindings.simpleble_peripheral_services_get(d, j);
                    services.push(service.uuid);
                }
                for (let j = 0; j < count; j++) {
                    const data = this._bindings.simpleble_peripheral_manufacturer_data_get(d, j);
                    if (data) {
                        manufacturerData.set(data.id, new DataView(data.data.buffer));
                    }
                }
                const found = filterCb({
                    name: id,
                    address,
                    manufacturerData,
                    serviceData,
                    services,
                });
                if (found) {
                    const device = new BluetoothDevice(
                        this._bindings,
                        d,
                        address,
                        id,
                        (this as any),
                        manufacturerData,
                    );
                    addrs.push(id);
                    yield device;
                }
                //this._bindings.simpleble_peripheral_release_handle(d);
            }
        }
    }

    private _createFilter(options: any): (info: RequestDeviceInfo) => boolean {
        if (!options.filters && !options.filter && !options.acceptAllDevices) {
            throw new TypeError("filter, filters, or acceptAllDevices must be given");
        } else if (options.filter) {
            return options.filter;
        } else if (options.acceptAllDevices) {
            // Return true for all devices.
            return () => {
                return true;
            };
        }

        const cb = (info: RequestDeviceInfo): boolean => {
            return this._filterDevice(options.filters, info, []);
        };
        return cb;
    }

    private async _request(
        options: any,
        singleDevice: boolean,
    ): Promise<BluetoothDevice[]> {
        const timeout = options.timeout ?? 10000;

        if (!options.filters && !options.filter && !options.acceptAllDevices) {
            throw new TypeError("filter, filters, or acceptAllDevices must be given");
        }

        const filterCb = this._createFilter(options);

        this._bindings.simpleble_adapter_scan_start(this._adapter);
        await delay(timeout);
        this._bindings.simpleble_adapter_scan_stop(this._adapter);

        const resultsCount = this._bindings.simpleble_adapter_scan_get_results_count(
            this._adapter,
        );

        const devices: BluetoothDevice[] = [];

        for (let i = 0; i < resultsCount; i++) {
            const d = this._bindings.simpleble_adapter_scan_get_results_handle(this._adapter, i);
            const id = this._bindings.simpleble_peripheral_identifier(d);
            const address = this._bindings.simpleble_peripheral_address(d);
            const dataCount = this._bindings.simpleble_peripheral_manufacturer_data_count(d);
            const serviceCount = this._bindings.simpleble_peripheral_services_count(d);
            const manufacturerData: BluetoothManufacturerData = new Map();
            const serviceData: BluetoothServiceData = new Map();
            const services: BluetoothServiceUUID[] = [];
            for (let j = 0; j < serviceCount; j++) {
                const service = this._bindings.simpleble_peripheral_services_get(d, j);
                services.push(service.uuid);
            }
            for (let j = 0; j < dataCount; j++) {
                const data = this._bindings.simpleble_peripheral_manufacturer_data_get(d, j);
                if (data) {
                    manufacturerData.set(data.id, new DataView(data.data.buffer));
                }
            }
            // TODO: serviceData

            const found = filterCb({
                name: id,
                address,
                manufacturerData,
                serviceData,
                services
            });
            if (found) {
                const device = new BluetoothDevice(
                    this._bindings,
                    d,
                    address,
                    id,
                    (this as any),
                    manufacturerData,
                );
                devices.push(device);
                if (singleDevice) {
                    break;
                }
            }
            //this._bindings.simpleble_peripheral_release_handle(d);
        }

        return devices;
    }

    /**
     * Scans for a Bluetooth device.
     *
     * Because of limitations in the WebBluetooth standard, this does not comply
     * with the standard `requestDevice` specification. In the W3C standard,
     * users manually select a device via a popup, which is obviously not
     * possible with Node/Deno/Bun.
     */
    async requestDevice(
        options: RequestDeviceOptions,
    ): Promise<BluetoothDevice> {
        let devices: BluetoothDevice[];
        const p = this._request(options, true);
        if (options.signal) {
            devices = await abortable(p, options.signal);
        } else {
            devices = await p;
        }

        if (!devices.length) {
            throw new DOMException("requestDevice error: no devices found", "NotFoundError");
        }

        this._devices.push(devices[0]);
        return devices[0];
    }

    /**
     * Scans for Bluetooth devices.
     *
     * This function is not a part of the WebBluetooth standard. It is made
     * to allow programs to interact with multiple devices.
     */
    async requestDevices(
        options: RequestDeviceOptions,
    ): Promise<BluetoothDevice[]> {
        let devices: BluetoothDevice[];
        const p = this._request(options, true);
        if (options.signal) {
            devices = await abortable(p, options.signal);
        } else {
            devices = await p;
        }

        if (!devices.length) {
            throw new DOMException("requestDevices error: no devices found", "NotFoundError");
        }

        this._devices.push(...devices);
        return devices;
    }

    /** A listener for the `characteristicvaluechanged` event. */
    set oncharacteristicvaluechanged(fn: EventListenerOrEventListenerObject) {
        if (this._oncharacteristicvaluechanged) {
            this.removeEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
        }
        this._oncharacteristicvaluechanged = fn;
        this.addEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
    }

    /** A listener for the `serviceadded` event. */
    set onserviceadded(fn: EventListenerOrEventListenerObject) {
        if (this._onserviceadded) {
            this.removeEventListener('serviceadded', this._onserviceadded);
        }
        this._onserviceadded = fn;
        this.addEventListener('serviceadded', this._onserviceadded);
    }

    /** A listener for the `servicechanged` event. */
    set onservicechanged(fn: EventListenerOrEventListenerObject) {
        if (this._onservicechanged) {
            this.removeEventListener('servicechanged', this._onservicechanged);
        }
        this._onservicechanged = fn;
        this.addEventListener('servicechanged', this._onservicechanged);
    }

    /** A listener for the `serviceremoved` event. */
    set onserviceremoved(fn: EventListenerOrEventListenerObject) {
        if (this._onserviceremoved) {
            this.removeEventListener('serviceremoved', this._onserviceremoved);
        }
        this._onserviceremoved = fn;
        this.addEventListener('serviceremoved', this._onserviceremoved);
    }

    /** A listener for the `gattserverdisconnected` event. */
    set ongattserverdisconnected(fn: EventListenerOrEventListenerObject) {
        if (this._ongattserverdisconnected) {
            this.removeEventListener('gattserverdisconnected', this._ongattserverdisconnected);
        }
        this._ongattserverdisconnected = fn;
        this.addEventListener('gattserverdisconnected', this._ongattserverdisconnected);
    }

    /** A listener for the `advertisementreceived` event. */
    set onadvertisementreceived(fn: EventListenerOrEventListenerObject) {
        if (this._onadvertisementreceived) {
            this.removeEventListener('advertisementreceived', this._onadvertisementreceived);
        }
        this._onadvertisementreceived = fn;
        this.addEventListener('advertisementreceived', this._onadvertisementreceived);
    }

    /** A listener for the `availabilitychanged` event. */
    set onavailabilitychanged(fn: EventListenerOrEventListenerObject) {
        if (this._onavailabilitychanged) {
            this.removeEventListener('availabilitychanged', this._onavailabilitychanged);
        }
        this._onavailabilitychanged = fn;
        this.addEventListener('availabilitychanged', this._onavailabilitychanged);
    }

    /*
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
                if (filter.services) searchUUIDs = searchUUIDs.concat(filter.services.map(getServiceUUID));

                // Unique-ify
                searchUUIDs = searchUUIDs.filter((item, index, array) => {
                    return array.indexOf(item) === index;
                });
            });
        } else if (!isAcceptAll(options)) {
            throw new TypeError('requestDevice error: specify filters or acceptAllDevices');
        }

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            let found = false;
            await adapter.startScan(searchUUIDs, deviceInfo => {
                let validServices = [];

                const complete = async bluetoothDevice => {
                    await this.cancelRequest();
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
                        validServices = validServices.concat(options.optionalServices.map(getServiceUUID));
                    }

                    // Set unique list of allowed services
                    const allowedServices = validServices.filter((item, index, array) => {
                        return array.indexOf(item) === index;
                    });
                    Object.assign(deviceInfo, {
                        _bluetooth: this,
                        _allowedServices: allowedServices
                    });

                    const bluetoothDevice = new BluetoothDevice(deviceInfo);

                    const selectFn = () => {
                        complete.call(this, bluetoothDevice);
                    };

                    if (!this.deviceFound || this.deviceFound(bluetoothDevice, selectFn.bind(this)) === true) {
                        // If no deviceFound function, or deviceFound returns true, resolve with this device immediately
                        complete.call(this, bluetoothDevice);
                    }
                }
            });

            this.scanner = setTimeout(async () => {
                await this.cancelRequest();
                if (!found) {
                    reject('requestDevice error: no devices found');
                }
            }, this.scanTime);
        });
    }
    */
}
