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
import { BluetoothDevice, BluetoothDeviceEvents } from "./device";
import { getServiceUUID } from "./helpers";
import { adapter, NobleAdapter } from "./adapter";
import { W3CBluetooth } from "./interfaces";
import { DOMEvent } from "./events";

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
     * An optional referring device
     */
    referringDevice?: BluetoothDevice;
}

/**
 * @hidden
 */
export interface BluetoothEvents extends BluetoothDeviceEvents {
    /**
     * Bluetooth Availability Changed event
     */
    availabilitychanged: Event;
}

/**
 * Bluetooth class
 */
export class Bluetooth extends (EventDispatcher as new() => TypedDispatcher<BluetoothEvents>) implements W3CBluetooth {

    /**
     * Bluetooth Availability Changed event
     * @event
     */
    public static EVENT_AVAILABILITY: string = "availabilitychanged";

    /**
     * Referring device for the bluetooth instance
     */
    public readonly referringDevice?: BluetoothDevice;

    private deviceFound: (device: BluetoothDevice, selectFn: () => void) => boolean = null;
    private scanTime: number = 10.24 * 1000;
    private scanner = null;

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

    private _ongattserverdisconnected: (ev: Event) => void;
    public set ongattserverdisconnected(fn: (ev: Event) => void) {
        if (this._ongattserverdisconnected) {
            this.removeEventListener("gattserverdisconnected", this._ongattserverdisconnected);
        }
        this._ongattserverdisconnected = fn;
        this.addEventListener("gattserverdisconnected", this._ongattserverdisconnected);
    }

    private _onadvertisementreceived: (ev: Event) => void;
    public set onadvertisementreceived(fn: (ev: Event) => void) {
        if (this._onadvertisementreceived) {
            this.removeEventListener("advertisementreceived", this._onadvertisementreceived);
        }
        this._onadvertisementreceived = fn;
        this.addEventListener("advertisementreceived", this._onadvertisementreceived);
    }

    private _onavailabilitychanged: (ev: Event) => void;
    public set onavailabilitychanged(fn: (ev: Event) => void) {
        if (this._onavailabilitychanged) {
            this.removeEventListener("availabilitychanged", this._onavailabilitychanged);
        }
        this._onavailabilitychanged = fn;
        this.addEventListener("availabilitychanged", this._onavailabilitychanged);
    }

    /**
     * Bluetooth constructor
     * @param options Bluetooth initialisation options
     */
    constructor(options?: BluetoothOptions) {
        super();

        options = options || {};
        this.referringDevice = options.referringDevice;
        this.deviceFound = options.deviceFound;
        if (options.scanTime) this.scanTime = options.scanTime * 1000;

        adapter.on(NobleAdapter.EVENT_ENABLED, _value => {
            this.dispatchEvent(new DOMEvent(this, "availabilitychanged"));
        });
    }

    private filterDevice(filters: Array<BluetoothRequestDeviceFilter>, deviceInfo, validServices) {
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
                const serviceUUIDs = filter.services.map(getServiceUUID);
                const servicesValid = serviceUUIDs.every(serviceUUID => {
                    return (deviceInfo._serviceUUIDs.indexOf(serviceUUID) > -1);
                });

                if (!servicesValid) return;
                validServices = validServices.concat(serviceUUIDs);
            }

            valid = true;
        });

        if (!valid) return false;
        return deviceInfo;
    }

    /**
     * Gets the availability of a bluetooth adapter
     * @returns Promise containing a flag indicating bluetooth availability
     */
    public getAvailability(): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            adapter.getEnabled(enabled => {
                resolve(enabled);
            });
        });
    }

    /**
     * Scans for a device matching optional filters
     * @param options The options to use when scanning
     * @returns Promise containing a device which matches the options
     */
    public requestDevice(options: RequestDeviceOptions = { filters: [] }): Promise<BluetoothDevice> {
        return new Promise((resolve, reject) => {

            if (this.scanner !== null) return reject("requestDevice error: request in progress");

            interface Filtered {
                filters: Array<BluetoothRequestDeviceFilter>;
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
                    return reject(new TypeError("requestDevice error: no filters specified"));
                }

                // Don't allow empty filters
                const emptyFilter = options.filters.some(filter => {
                    return (Object.keys(filter).length === 0);
                });
                if (emptyFilter) {
                    return reject(new TypeError("requestDevice error: empty filter specified"));
                }

                // Don't allow empty namePrefix
                const emptyPrefix = options.filters.some(filter => {
                    return (typeof filter.namePrefix !== "undefined" && filter.namePrefix === "");
                });
                if (emptyPrefix) {
                    return reject(new TypeError("requestDevice error: empty namePrefix specified"));
                }

                options.filters.forEach(filter => {
                    if (filter.services) searchUUIDs = searchUUIDs.concat(filter.services.map(getServiceUUID));

                    // Unique-ify
                    searchUUIDs = searchUUIDs.filter((item, index, array) => {
                        return array.indexOf(item) === index;
                    });
                });
            } else if (!isAcceptAll(options)) {
                return reject(new TypeError("requestDevice error: specify filters or acceptAllDevices"));
            }

            let found = false;
            adapter.startScan(searchUUIDs, deviceInfo => {
                let validServices = [];

                function complete(bluetoothDevice) {
                    this.cancelRequest()
                    .then(() => {
                        resolve(bluetoothDevice);
                    });
                }

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

                    function selectFn() {
                        complete.call(this, bluetoothDevice);
                    }

                    if (!this.deviceFound || this.deviceFound(bluetoothDevice, selectFn.bind(this)) === true) {
                        // If no deviceFound function, or deviceFound returns true, resolve with this device immediately
                        complete.call(this, bluetoothDevice);
                    }
                }
            }, () => {
                this.scanner = setTimeout(() => {
                    this.cancelRequest()
                    .then(() => {
                        if (!found) reject("requestDevice error: no devices found");
                    });
                }, this.scanTime);
            }, error => reject(`requestDevice error: ${error}`));
        });
    }

    /**
     * Cancels the scan for devices
     */
    public cancelRequest(): Promise<void> {
        return new Promise((resolve, _reject) => {
            if (this.scanner) {
                clearTimeout(this.scanner);
                this.scanner = null;
                adapter.stopScan();
            }
            resolve();
        });
    }
}
