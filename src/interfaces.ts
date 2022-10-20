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
export type BluetoothManufacturerDataMap = Map<number, DataView>;

/** Filter for Bluetooth scanning. */
export interface BluetoothDataFilter {
    readonly dataPrefix?: ArrayBuffer | undefined;
    readonly mask?: ArrayBuffer | undefined;
}

/** Filter by manufacturer. */
export interface BluetoothManufacturerDataFilter extends BluetoothDataFilter {
    companyIdentifier: number;
}

/** Filter for scanning Bluetooth devices. */
export interface BluetoothLEScanFilter {
    readonly name?: string | undefined;
    readonly namePrefix?: string | undefined;
    readonly services?: BluetoothServiceUUID[] | undefined;
    readonly manufacturerData?: BluetoothManufacturerDataFilter[] | undefined;
}

/** @hidden */
export type CustomEventListener<T, E extends Event> =
    | ((this: T, event: E) => void | Promise<void>)
    | { handleEvent(event: E): void | Promise<void> };

/** Information from SimpleBLE before connecting. */
export interface RequestDeviceInfo {
    name: string;
    address: string;
    manufacturerData: BluetoothManufacturerDataMap;
}

/** Scanning options. */
export type RequestDeviceOptions = {
    filters: BluetoothLEScanFilter[];
    timeout?: number;
    signal?: AbortSignal;
} | {
    filter: (info: RequestDeviceInfo) => boolean;
    timeout?: number;
    signal?: AbortSignal;
};
