/*
* Node Web Bluetooth
* Copyright (c) 2023 Rob Moran
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

import { EventEmitter } from 'events';
import { Adapter as BluetoothAdapter } from './adapter';
import { getCanonicalUUID } from '../helpers';
import { BluetoothDeviceImpl } from '../device';
import { BluetoothRemoteGATTCharacteristicImpl } from '../characteristic';
import { BluetoothRemoteGATTServiceImpl } from '../service';
import { BluetoothRemoteGATTDescriptorImpl } from '../descriptor';
import {
    isEnabled,
    getAdapters,
    Adapter,
    Peripheral,
    Service,
    Characteristic
} from './simpleble';

const FIND_TIMEOUT = 500;

/**
 * @hidden
 */
export class SimplebleAdapter extends EventEmitter implements BluetoothAdapter {
    private adapter: Adapter;
    private peripherals = new Map<string, Peripheral>();
    private servicesByPeripheral = new Map<Peripheral, Service[]>();
    private peripheralByService = new Map<string, Peripheral>();
    private serviceByCharacteristic = new Map<string, string>();
    private characteristicsByService = new Map<string, Characteristic[]>();
    private characteristicByDescriptor = new Map<string, { char: string, desc: string }>();
    private descriptors = new Map<string, string[]>();
    private charEvents = new Map<string, (value: DataView) => void>();

    private discoverFn: ((peripheral: Peripheral) => void | undefined) | undefined;

    private get scanning(): boolean {
        if (!this.adapter) {
            return false;
        }
        return this.adapter.active;
    }

    private findDevices() {
        if (this.adapter && this.discoverFn) {
            for (const peripheral of this.adapter.peripherals) {
                this.discoverFn(peripheral);
            }
        }

        if (this.scanning) {
            setTimeout(() => this.findDevices(), FIND_TIMEOUT);
        }
    }

    private validDevice(device: Partial<BluetoothDeviceImpl>, serviceUUIDs: Array<string>): boolean {
        if (serviceUUIDs.length === 0) {
            // Match any device
            return true;
        }

        if (!device._serviceUUIDs) {
            // No advertised services, no match
            return false;
        }

        const advertisedUUIDs = device._serviceUUIDs.map((serviceUUID: string) => getCanonicalUUID(serviceUUID));

        // An advertised UUID matches our search UUIDs
        return serviceUUIDs.some(serviceUUID => advertisedUUIDs.indexOf(serviceUUID) >= 0);
    }

    private buildBluetoothDevice(device: Peripheral): Partial<BluetoothDeviceImpl> {
        const name = device.identifier;
        const address = device.address;
        const rssi = device.rssi;
        const txPower = device.txPower;
        const id = address || `${name}`;

        const serviceUUIDs: string[] = [];
        const serviceData = new Map();

        for (const service of device.services) {
            serviceUUIDs.push(service.uuid);
            if (service.data) {
                serviceData.set(service.uuid, service.data);
            }
        }

        const manufacturerData = new Map();
        for (const id in device.manufacturerData) {
            manufacturerData.set(id, new DataView(device.manufacturerData[id].buffer));
        }

        return {
            id,
            name,
            _serviceUUIDs: serviceUUIDs,
            _adData: {
                rssi,
                txPower,
                serviceData,
                manufacturerData
            }
        };
    }

    private enumerate(peripheral: Peripheral): void {
        this.servicesByPeripheral.clear();
        this.peripheralByService.clear();
        this.serviceByCharacteristic.clear();
        this.characteristicsByService.clear();
        this.characteristicByDescriptor.clear();
        this.descriptors.clear();
        this.charEvents.clear();

        const services: Service[] = [];
        for (const service of peripheral.services) {
            const serviceUUID = getCanonicalUUID(service.uuid);

            this.characteristicsByService.set(serviceUUID, service.characteristics);

            for (const char of service.characteristics) {
                this.serviceByCharacteristic.set(char.uuid, serviceUUID);
                this.descriptors.set(char.uuid, char.descriptors);

                for (const desc of char.descriptors) {
                    this.characteristicByDescriptor.set(`${char.uuid}-${desc}`, { char: char.uuid, desc });
                }
            }

            this.peripheralByService.set(service.uuid, peripheral);
            services.push(service);
        }

        this.servicesByPeripheral.set(peripheral, services);
    }

    private get state(): boolean {
        const adapterEnabled = isEnabled();
        return !!adapterEnabled;
    }

    public async getEnabled(): Promise<boolean> {
        return this.state;
    }

    public async startScan(serviceUUIDs: Array<string>, foundFn: (device: Partial<BluetoothDevice>) => void): Promise<void> {
        if (this.state === false) {
            throw new Error('adapter not enabled');
        }

        if (!this.adapter) {
            this.adapter = getAdapters()[0];
        }

        this.discoverFn = peripheral => {
            const device = this.buildBluetoothDevice(peripheral);
            if (this.validDevice(device, serviceUUIDs)) {
                if (!this.peripherals.has(device.id)) {
                    this.peripherals.set(device.id, peripheral);
                    // Only call the found function the first time we find a valid device
                    foundFn(device);
                }
            }
        };

        this.peripherals.clear();
        const success = this.adapter.scanStart();
        if (!success) {
            throw new Error('scan start failed');
        }
        this.findDevices();
    }

    public stopScan(_errorFn?: (errorMsg: string) => void): void {
        this.discoverFn = undefined;
        if (this.adapter) {
            const success = this.adapter.scanStop();
            if (!success) {
                throw new Error('scan stop failed');
            }
        }
    }

    public async connect(id: string, disconnectFn?: () => void): Promise<void> {
        const peripheral = this.peripherals.get(id);
        if (!peripheral) {
            throw new Error('Peripheral not found');
        }

        if (!peripheral.connectable) {
            throw new Error('Connection not possible');
        }

        const success = peripheral.connect();
        if (!success) {
            throw new Error('Connect failed');
        }

        this.enumerate(peripheral);

        if (disconnectFn) {
            peripheral.setCallbackOnDisconnected(() => disconnectFn());
        }
    }

    public async disconnect(id: string): Promise<void> {
        const peripheral = this.peripherals.get(id);
        if (!peripheral) {
            throw new Error('Peripheral not found');
        }

        const success = peripheral.disconnect();
        if (!success) {
            throw new Error('Disconnect failed');
        }
    }

    public async discoverServices(id: string, serviceUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTServiceImpl>>> {
        const peripheral = this.peripherals.get(id);
        if (!peripheral) {
            throw new Error('Peripheral not found');
        }

        const discovered = [];
        for (const service of peripheral.services) {
            if (!serviceUUIDs || serviceUUIDs.length === 0 || serviceUUIDs.indexOf(service.uuid) >= 0) {
                discovered.push({
                    uuid: service.uuid,
                    isPrimary: true
                });
            }
        }

        return discovered;
    }

    public async discoverIncludedServices(_handle: string, _serviceUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTServiceImpl>>> {
        // Currently not implemented
        return [];
    }

    public async discoverCharacteristics(serviceUuid: string, characteristicUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTCharacteristicImpl>>> {
        const peripheral = this.peripheralByService.get(serviceUuid);
        const characteristics = this.characteristicsByService.get(serviceUuid);
        const discovered = [];

        for (const characteristic of characteristics) {
            const charUUID = getCanonicalUUID(characteristic.uuid);

            if (!characteristicUUIDs || characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(charUUID) >= 0) {

                discovered.push({
                    uuid: charUUID,
                    properties: {
                        // Not all of these are supported in SimpleBle
                        // broadcast: characteristic.capabilities.includes('???'),
                        read: characteristic.canRead,
                        writeWithoutResponse: characteristic.canWriteRequest,
                        write: characteristic.canWriteCommand,
                        notify: characteristic.canNotify,
                        indicate: characteristic.canIndicate,
                        // authenticatedSignedWrites: characteristic.capabilities.includes('???'),
                        // reliableWrite: characteristic.capabilities.includes('???'),
                        // writableAuxiliaries: characteristic.capabilities.includes('???'),
                    }
                });

                if (characteristic.canIndicate) {
                    peripheral.indicate(serviceUuid, charUUID, data => {
                        if (this.charEvents.has(charUUID)) {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            this.charEvents.get(charUUID)!(new DataView(data.buffer));
                        }
                    });
                }

                if (characteristic.canNotify) {
                    peripheral.notify(serviceUuid, charUUID, data => {
                        if (this.charEvents.has(charUUID)) {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            this.charEvents.get(charUUID)!(new DataView(data.buffer));
                        }
                    });
                }
            }
        }

        return discovered;
    }

    public async discoverDescriptors(charUuid: string, descriptorUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTDescriptorImpl>>> {
        const descriptors = this.descriptors.get(charUuid);
        const discovered = [];

        for (const descriptor of descriptors) {
            const descUUID = getCanonicalUUID(descriptor);

            if (!descriptorUUIDs || descriptorUUIDs.length === 0 || descriptorUUIDs.indexOf(descUUID) >= 0) {
                discovered.push({
                    uuid: descUUID
                });
            }
        }

        return discovered;
    }

    public async readCharacteristic(charUuid: string): Promise<DataView> {
        const serviceUuid = this.serviceByCharacteristic.get(charUuid);
        const peripheral = this.peripheralByService.get(serviceUuid);
        const data = peripheral.read(serviceUuid, charUuid);
        return new DataView(data.buffer);
    }

    public async writeCharacteristic(charUuid: string, value: DataView, withoutResponse = false): Promise<void> {
        const serviceUuid = this.serviceByCharacteristic.get(charUuid);
        const peripheral = this.peripheralByService.get(serviceUuid);
        let success = false;

        if (withoutResponse) {
            success = peripheral.writeCommand(serviceUuid, charUuid, new Uint8Array(value.buffer));
        } else {
            success = peripheral.writeRequest(serviceUuid, charUuid, new Uint8Array(value.buffer));
        }

        if (!success) {
            throw new Error('Write failed');
        }
    }

    public async enableNotify(handle: string, notifyFn: (value: DataView) => void): Promise<void> {
        this.charEvents.set(handle, notifyFn);
    }

    public async disableNotify(handle: string): Promise<void> {
        this.charEvents.delete(handle);
    }

    public async readDescriptor(handle: string): Promise<DataView> {
        const { char, desc } = this.characteristicByDescriptor.get(handle);
        const serviceUuid = this.serviceByCharacteristic.get(char);
        const peripheral = this.peripheralByService.get(serviceUuid);

        const data = peripheral.readDescriptor(serviceUuid, char, desc);
        if (!data) {
            throw new Error('Read failed');
        }
        return new DataView(data.buffer);
    }

    public async writeDescriptor(handle: string, value: DataView): Promise<void> {
        const { char, desc } = this.characteristicByDescriptor.get(handle);
        const serviceUuid = this.serviceByCharacteristic.get(char);
        const peripheral = this.peripheralByService.get(serviceUuid);

        const success = peripheral.writeDescriptor(serviceUuid, char, desc, new Uint8Array(value.buffer));

        if (!success) {
            throw new Error('Write failed');
        }
    }
}
