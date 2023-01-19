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

/** Service UUID. */
export type BluetoothServiceUUID = number | string;
/** Characteristic UUID. */
export type BluetoothCharacteristicUUID = number | string;
/** Descriptor UUID. */
export type BluetoothDescriptorUUID = number | string;

/** Manufacturer-specific data. */
export type BluetoothManufacturerData = Map<number, DataView>;
/** Service-specific data. */
export type BluetoothServiceData = Map<BluetoothServiceUUID, DataView>;

/** Properties of a {@link BluetoothRemoteGATTCharacteristic} */
export interface BluetoothCharacteristicProperties {
    readonly broadcast: boolean;
    readonly read: boolean;
    readonly writeWithoutResponse: boolean;
    readonly write: boolean;
    readonly notify: boolean;
    readonly indicate: boolean;
    readonly authenticatedSignedWrites: boolean;
    readonly reliableWrite: boolean;
    readonly writableAuxiliaries: boolean;
}

/** Filter for Bluetooth scanning. */
export interface BluetoothDataFilter {
    readonly dataPrefix?: ArrayBuffer | undefined;
    readonly mask?: ArrayBuffer | undefined;
}

/** Filter by manufacturer data. */
export interface BluetoothManufacturerDataFilter extends BluetoothDataFilter {
    companyIdentifier: number;
}

/** Filter by service data. */
export interface BluetoothServiceDataFilter extends BluetoothDataFilter {
    service: BluetoothServiceUUID;
}

/** Filter for scanning Bluetooth devices. */
export interface BluetoothLEScanFilter {
    readonly name?: string | undefined;
    readonly namePrefix?: string | undefined;
    readonly services?: BluetoothServiceUUID[] | undefined;
    readonly manufacturerData?: BluetoothManufacturerDataFilter[] | undefined;
    readonly serviceData?: BluetoothServiceDataFilter[] | undefined;
}

/** Information for filtering devices during scanning. */
export interface RequestDeviceInfo {
    address: string;
    name?: string | undefined;
    manufacturerData?: BluetoothManufacturerData | undefined;
    serviceData?: BluetoothServiceData | undefined;
    services?: BluetoothServiceUUID[] | undefined;
}

/**
 * Scanning options.
 *
 * One (and only one) of these parameters must be given:
 *
 * - __`filters`__ - A list of {@link BluetoothLEScanFilter} filters.
 * - __`filter`__ - A callback invoked for each device. The first one to return true is selected.
 * - __`acceptAllDevices`__ - When set to `true`, every detected device is valid.
 *
 * When using `filters` or `acceptAllDevices`, the following extra options are supported:
 *
 * - __`optionalServices`__ - Service UUIDs (@todo Better description).
 * - __`optionalManufacturerData`__ - Manufacturer Data (@todo Better description).
 *
 * All three options support the following:
 *
 * - __`timeout`__ - Time (in milliseconds) to scan for (default 10000).
 * - __`signal`__ - AbortController for ending scanning early.
 */
export type RequestDeviceOptions = {
    filters: BluetoothLEScanFilter[];
    optionalServices?: BluetoothServiceUUID[] | undefined;
    optionalManufacturerData?: number[] | undefined;
    timeout?: number;
    signal?: AbortSignal;
} | {
    filter: (info: RequestDeviceInfo) => boolean;
    timeout?: number;
    signal?: AbortSignal;
} | {
    acceptAllDevices: boolean;
    optionalServices?: BluetoothServiceUUID[] | undefined;
    optionalManufacturerData?: number[] | undefined;
    timeout?: number;
    signal?: AbortSignal;
};
