/*
* Node Web Bluetooth
* Copyright (c) 2022 Rob Moran
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const simpleble = require('bindings')('simpleble.node');
module.exports = simpleble;

/** SimpleBLE address type. */
export enum AddressType {
    PUBLIC = 0,
    RANDOM = 1,
    UNSPECIFIED = 2,
}

/** SimpleBLE descriptor. */
export type Descriptor = string;

/** SimpleBLE characteristic. */
export interface Characteristic {
    canRead: boolean;
    canWriteRequest: boolean;
    canWriteCommand: boolean;
    canNotify: boolean;
    canIndicate: boolean;
    descriptors: Descriptor[];
    uuid: string;
}

/** SimpleBLE Service. */
export interface Service {
    uuid: string;
    data: Uint8Array;
    characteristics: Characteristic[];
}

/** SimpleBLE Peripheral. */
export interface Peripheral {
    identifier: string;
    address: string;
    addressType: AddressType;
    rssi: number;
    txPower: number;
    mtu: number;
    connected: boolean;
    connectable: boolean;
    paired: boolean;
    manufacturerData: Record<string, Uint8Array>;
    services: Service[];

    connect(): boolean;
    disconnect(): boolean;
    unpair(): boolean;
    read(service: string, characteristic: string): Uint8Array;
    writeRequest(service: string, characteristic: string, data: Uint8Array): boolean;
    writeCommand(service: string, characteristic: string, data: Uint8Array): boolean;
    notify(service: string, characteristic: string, cb: (data: Uint8Array) => void): boolean;
    indicate(service: string, characteristic: string, cb: (data: Uint8Array) => void): boolean;
    unsubscribe(service: string, characteristic: string): boolean;
    readDescriptor(service: string, characteristic: string, descriptor: string): Uint8Array;
    writeDescriptor(service: string, characteristic: string, descriptor: string, data: Uint8Array): boolean;
    setCallbackOnConnected(cb: () => void): boolean;
    setCallbackOnDisconnected(cb: () => void): boolean;
}

/** SimpleBLE Adapter. */
export interface Adapter extends HardwareAdapterDetails {
    peripherals: Peripheral[];
    pairedPeripherals: Peripheral[];
    scanFor(ms: number): boolean;
    scanStart(): boolean;
    scanStop(): boolean;
    setCallbackOnScanStart(cb: () => void): boolean;
    setCallbackOnScanStop(cb: () => void): boolean;
    setCallbackOnScanUpdated(cb: (peripheral: Peripheral) => void): boolean;
    setCallbackOnScanFound(cb: (peripheral: Peripheral) => void): boolean;
    release(): void;
}

export declare function getAdapters(): Adapter[];
export declare function isEnabled(): boolean;
