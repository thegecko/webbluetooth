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

import { abortable, delay, getServiceUUID, isView } from "./common.js";
import { adapters } from "./adapters.js";
import { BluetoothDevice, BluetoothDeviceEventMap } from "./gatt.js";

import type { Adapter } from "./bindings.js";
import type {
    BluetoothManufacturerData,
    BluetoothManufacturerDataFilter,
    BluetoothServiceData,
    BluetoothServiceDataFilter,
    BluetoothServiceUUID,
    BluetoothLEScanFilter,
    RequestDeviceInfo,
    RequestDeviceOptions,
} from "./interfaces";

export type DeviceFoundCallback = (device: BluetoothDevice) => boolean;

/** Bluetooth Options. */
export interface BluetoothOptions {
    /** Callback to allow the user to select a device. */
    deviceFound?: DeviceFoundCallback;
    /** The amount of seconds to scan for devices (default is 10). */
    scanTime?: number;
    /** An optional referring device. */
    referringDevice?: BluetoothDevice;
}

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

function checkServiceData(
    map: BluetoothServiceData,
    filters: BluetoothServiceDataFilter[],
): boolean {
    for (const filter of filters) {
        const { service, dataPrefix } = filter;
        const serviceUUID = getServiceUUID(service);
        // Service not found - not a match.
        if (!map.has(serviceUUID)) {
            continue;
        }
        // If no dataPrefix, then the match was successful.
        if (!dataPrefix) {
            return true;
        }
        const view = map.get(serviceUUID);
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

function checkServices(
    info: RequestDeviceInfo,
    services: BluetoothServiceUUID[],
): boolean {
    const validServices = (info.services || []).map(getServiceUUID);
    if (info.serviceData) {
        for (const uuid of info.serviceData?.keys()) {
            validServices.push(getServiceUUID(uuid));
        }
    }
    const allowedServices = services.map(getServiceUUID);
    for (const service of validServices) {
        if (allowedServices.includes(service)) {
            return true;
        }
    }

    return false;
}

/** Interface for creating {@link BluetoothDevice} objects. */
export class Bluetooth extends EventTarget {
    private _adapter: Adapter;
    private _devices: BluetoothDevice[];
    private _deviceFound?: DeviceFoundCallback;
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
    constructor(options?: BluetoothOptions) {
        super();
        this._devices = [];

        if (!adapters) {
            throw new DOMException("No Bluetooth adapters found", "NotFoundError");
        }

        this._adapter = adapters[0];
        this.referringDevice = options?.referringDevice;
        this._deviceFound = options?.deviceFound;

        this.dispatchEvent(new Event("availabilitychanged"));
    }

    /** Determines if a working Bluetooth adapter is usable. */
    getAvailability(): Promise<boolean> {
        return Promise.resolve(!!this._adapter);
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

            if (
                info.serviceData &&
                filter.serviceData &&
                !checkServiceData(info.serviceData, filter.serviceData)
            ) {
                continue;
            }

            if (
                info.services &&
                filter.services &&
                !checkServices(info, filter.services)
            ) {
                continue;
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
            this._adapter.scanStart();
            await abortable(delay(timeout), signal);
            this._adapter.scanStop();

            for (const peripheral of this._adapter.peripherals) {
                if (addrs.includes(peripheral.address)) {
                    continue;
                }

                const services: BluetoothServiceUUID[] = [];
                const serviceData: BluetoothServiceData = new Map();
                const manufacturerData: BluetoothManufacturerData = new Map();

                for (const service of peripheral.services) {
                    services.push(service.uuid);
                    serviceData.set(service.uuid, new DataView(service.data));
                }

                for (const [id, data] of Object.entries(peripheral.manufacturerData)) {
                    manufacturerData.set(parseInt(id, 10), new DataView(data.buffer));
                }

                const device = new BluetoothDevice(
                    peripheral,
                    (this as any),
                    serviceData,
                    manufacturerData,
                );

                let found = false;

                if (this._deviceFound) {
                    if (this._deviceFound(device)) {
                        found = true;
                    }
                } else {
                    found = filterCb({
                        name: peripheral.identifier,
                        address: peripheral.address,
                        manufacturerData,
                        serviceData,
                        services,
                    });
                }

                if (found) {
                    addrs.push(peripheral.address);
                    yield device;
                }
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

        this._adapter.scanStart();
        await delay(timeout);
        this._adapter.scanStop();

        const devices: BluetoothDevice[] = [];

        for (const peripheral of this._adapter.peripherals) {
            const services: BluetoothServiceUUID[] = [];
            const serviceData: BluetoothServiceData = new Map();
            const manufacturerData: BluetoothManufacturerData = new Map();

            for (const service of peripheral.services) {
                services.push(service.uuid);
                serviceData.set(service.uuid, new DataView(service.data.buffer));
            }

            for (const [id, data] of Object.entries(peripheral.manufacturerData)) {
                manufacturerData.set(parseInt(id, 10), new DataView(data.buffer));
            }

            const device = new BluetoothDevice(
                peripheral,
                (this as any),
                serviceData,
                manufacturerData,
            );

            let found = false;

            if (this._deviceFound) {
                if (this._deviceFound(device)) {
                    found = true;
                }
            } else {
                found = filterCb({
                    name: peripheral.identifier,
                    address: peripheral.address,
                    manufacturerData,
                    serviceData,
                    services,
                });
            }

            if (found) {
                devices.push(device);
                if (singleDevice) {
                    break;
                }
            }
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
}
