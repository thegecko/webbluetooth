/*
* Node Web Bluetooth
* Copyright (c) 2025 Rob Moran
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

import type { EventEmitter } from 'events';
import type { BluetoothDeviceImpl } from '../device';
import type { BluetoothRemoteGATTServiceImpl } from '../service';
import type { BluetoothRemoteGATTCharacteristicImpl } from '../characteristic';
import type { BluetoothRemoteGATTDescriptorImpl } from '../descriptor';

/**
 * @hidden
 */
export interface Adapter extends EventEmitter {
    getEnabled: () => Promise<boolean>;
    startScan: (serviceUUIDs: Array<string>, foundFn: (device: Partial<BluetoothDeviceImpl>) => void) => Promise<void>;
    stopScan: () => void;
    connect: (handle: string, disconnectFn?: () => void) => Promise<void>;
    disconnect: (handle: string) => Promise<void>;
    discoverServices: (handle: string, serviceUUIDs?: Array<string>) => Promise<Array<Partial<BluetoothRemoteGATTServiceImpl>>>;
    discoverIncludedServices: (handle: string, serviceUUIDs?: Array<string>) => Promise<Array<Partial<BluetoothRemoteGATTServiceImpl>>>;
    discoverCharacteristics: (handle: string, characteristicUUIDs?: Array<string>) => Promise<Array<Partial<BluetoothRemoteGATTCharacteristicImpl>>>;
    discoverDescriptors: (handle: string, descriptorUUIDs?: Array<string>) => Promise<Array<Partial<BluetoothRemoteGATTDescriptorImpl>>>;
    readCharacteristic: (handle: string) => Promise<DataView>;
    writeCharacteristic: (handle: string, value: DataView, withoutResponse?: boolean) => Promise<void>;
    enableNotify: (handle: string, notifyFn: (value: DataView) => void) => Promise<void>;
    disableNotify: (handle: string) => Promise<void>;
    readDescriptor: (handle: string) => Promise<DataView>;
    writeDescriptor: (handle: string, value: DataView) => Promise<void>;
    useHardwareAdapter: (adapterIndex: number) => void;
    getHardwareAdapters: () => Array<HardwareAdapterDetails>;
}

/** Basic Hardware Details for an Hardware adapter. */
export interface HardwareAdapterDetails {
    identifier: string;
    address: string;
    active: boolean;
}
