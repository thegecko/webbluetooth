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

import { EventDispatcher } from "./dispatcher";
import { BluetoothDevice } from "./device";
import { getServiceUUID } from "./helpers";
import { adapter, NobleAdapter } from "./adapter";

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
 * BluetoothLE Scan Filter Init interface
 */
export interface BluetoothLEScanFilterInit {
    /**
     * An array of service UUIDs to filter on
     */
    services?: Array<string | number>;

    /**
     * The device name to filter on
     */
    name?: string;

    /**
     * The device name prefix to filter on
     */
    namePrefix?: string;

    // Maps unsigned shorts to BluetoothDataFilters.
    // object manufacturerData;
    // Maps BluetoothServiceUUIDs to BluetoothDataFilters.
    // object serviceData;
}

/**
 * Request Device Options interface
 */
export interface RequestDeviceOptions {
    /**
     * An array of device filters to match
     */
    filters?: Array<BluetoothLEScanFilterInit>;

    /**
     * An array of optional services to have access to
     */
    optionalServices?: Array<string | number>;

    /**
     * Whether to accept all devices
     */
    acceptAllDevices?: boolean;
}

/**
 * Bluetooth class
 */
export class Bluetooth extends EventDispatcher {

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

        adapter.on(NobleAdapter.EVENT_ENABLED, value => {
            this.dispatchEvent(Bluetooth.EVENT_AVAILABILITY, value);
        });
    }

    private filterDevice(options: RequestDeviceOptions, deviceInfo, validServices) {
        let valid = false;

        options.filters.forEach(filter => {
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
    public requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice> {
        return new Promise((resolve, reject) => {
            options = options || {};

            if (this.scanner !== null) return reject("requestDevice error: request in progress");

            if (!options.acceptAllDevices && !this.deviceFound) {
                // Must have a filter
                if (!options.filters || options.filters.length === 0) {
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
            }

            let searchUUIDs = [];

            if (options.filters) {
                options.filters.forEach(filter => {
                    if (filter.services) searchUUIDs = searchUUIDs.concat(filter.services.map(getServiceUUID));
                });
            }

            // Unique-ify
            searchUUIDs = searchUUIDs.filter((item, index, array) => {
                return array.indexOf(item) === index;
            });

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
                if (options.filters) {
                    deviceInfo = this.filterDevice(options, deviceInfo, validServices);
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
