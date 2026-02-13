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

export interface BluetoothDeviceInit {
    id: string;
    name: string;
    _serviceUUIDs: Array<string>;
    _adData: Partial<BluetoothAdvertisingEvent>;
}

export interface BluetoothRemoteGATTServiceInit {
    _handle: string;
    uuid: string;
    isPrimary: boolean;
}

export interface BluetoothRemoteGATTCharacteristicInit {
    _handle: string;
    uuid: string;
    properties: BluetoothCharacteristicProperties;
}

export interface BluetoothRemoteGATTDescriptorInit {
    _handle: string;
    uuid: string;
}

/**
 * @hidden
 */
export interface Adapter extends EventTarget {
    getEnabled: () => Promise<boolean>;
    getAdapters: () => Array<{ index: number, address: string, active: boolean }>;
    useAdapter: (index: number) => void;
    startScan: (serviceUUIDs: Array<string>, foundFn: (device: BluetoothDeviceInit) => void) => Promise<void>;
    stopScan: () => void;
    connect: (handle: string, disconnectFn?: () => void) => Promise<void>;
    disconnect: (handle: string) => Promise<void>;
    discoverServices: (handle: string, serviceUUIDs?: Array<string>) => Promise<Array<BluetoothRemoteGATTServiceInit>>;
    discoverIncludedServices: (handle: string, serviceUUIDs?: Array<string>) => Promise<Array<BluetoothRemoteGATTServiceInit>>;
    discoverCharacteristics: (handle: string, characteristicUUIDs?: Array<string>) => Promise<Array<BluetoothRemoteGATTCharacteristicInit>>;
    discoverDescriptors: (handle: string, descriptorUUIDs?: Array<string>) => Promise<Array<BluetoothRemoteGATTDescriptorInit>>;
    readCharacteristic: (handle: string) => Promise<DataView>;
    writeCharacteristic: (handle: string, value: DataView, withoutResponse?: boolean) => Promise<void>;
    enableNotify: (handle: string, notifyFn: (value: DataView) => void) => Promise<void>;
    disableNotify: (handle: string) => Promise<void>;
    readDescriptor: (handle: string) => Promise<DataView>;
    writeDescriptor: (handle: string, value: DataView) => Promise<void>;
}
