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

import { EventEmitter } from 'events';
import { Adapter as BluetoothAdapter, BluetoothDeviceInit, BluetoothRemoteGATTServiceInit, BluetoothRemoteGATTCharacteristicInit, BluetoothRemoteGATTDescriptorInit } from './adapter';
import { BluetoothUUID } from '../uuid';
import {
    isEnabled,
    getAdapters as simpleBleAdapters,
    Adapter,
    Peripheral,
    Service,
    Characteristic,
    Descriptor
} from './simpleble';

/**
 * @hidden
 */
class PeripheralHandles {
    private handleCounter = 0;
    private peripheralChildren = new Map<Peripheral, string[]>();

    private children = new Map<string, string[]>();
    private parents = new Map<string, string>();

    private services = new Map<string, Service>();
    private characteristics = new Map<string, Characteristic>();
    private descriptors = new Map<string, Descriptor>();

    public constructor(private peripherals: Map<string, Peripheral>) {
    }

    public characteristicEvents = new Map<string, (value: DataView) => void>();

    public createHandles(peripheral: Peripheral): void {
        const services: string[] = [];
        for (const service of peripheral.services) {
            const serviceHandle = `${this.handleCounter++}`;
            this.parents.set(serviceHandle, peripheral.address);
            this.services.set(serviceHandle, service);
            services.push(serviceHandle);

            const characteristics: string[] = [];
            for (const characteristic of service.characteristics) {
                const characteristicHandle = `${this.handleCounter++}`;
                this.parents.set(characteristicHandle, serviceHandle);
                this.characteristics.set(characteristicHandle, characteristic);
                characteristics.push(characteristicHandle);

                const descriptors: string[] = [];
                for (const descriptor of characteristic.descriptors) {
                    const descHandle = `${this.handleCounter++}`;
                    this.parents.set(descHandle, characteristicHandle);
                    this.descriptors.set(descHandle, descriptor);
                    descriptors.push(descHandle);
                }
                this.children.set(characteristicHandle, descriptors);
            }
            this.children.set(serviceHandle, characteristics);
        }

        this.children.set(peripheral.address, services);
    }

    public deleteHandles(peripheral: Peripheral): void {
        const children = this.peripheralChildren.get(peripheral);
        for (const child of children) {
            this.children.delete(child);
            this.parents.delete(child);
            this.services.delete(child);
            this.characteristics.delete(child);
            this.descriptors.delete(child);
            this.characteristicEvents.delete(child);
        }
        this.peripheralChildren.delete(peripheral);
    }

    public getServices(deviceHandle: string): { [key: string]: Service } {
        const children = this.children.get(deviceHandle);
        const services: { [key: string]: Service } = {};

        for (const child of children) {
            services[child] = this.services.get(child);
        }

        return services;
    }

    public getCharacteristics(serviceHandle: string): { peripheral: Peripheral, service: Service, characteristics: { [key: string]: Characteristic } } {
        const children = this.children.get(serviceHandle);
        const characteristics: { [key: string]: Characteristic } = {};

        for (const child of children) {
            characteristics[child] = this.characteristics.get(child);
        }

        const peripheralHandle = this.parents.get(serviceHandle);
        if (!peripheralHandle) {
            throw new Error('Peripheral not found for service');
        }

        const peripheral = this.peripherals.get(peripheralHandle);
        if (!peripheral) {
            throw new Error('Peripheral not found for service');
        }

        const service = this.services.get(serviceHandle);
        if (!service) {
            throw new Error('Service not found');
        }

        return {
            peripheral,
            service,
            characteristics
        };
    }

    public getDescriptors(characteristicHandle: string): { [key: string]: Descriptor } {
        const children = this.children.get(characteristicHandle);
        const descriptors: { [key: string]: Descriptor } = {};

        for (const child of children) {
            descriptors[child] = this.descriptors.get(child);
        }

        return descriptors;
    }

    public getCharacteristicGraph(characteristicHandle: string): { peripheral: Peripheral, service: Service, characteristic: Characteristic } {
        const serviceHandle = this.parents.get(characteristicHandle);
        if (!serviceHandle) {
            throw new Error('Service not found for characteristic');
        }

        const peripheralHandle = this.parents.get(serviceHandle);
        if (!peripheralHandle) {
            throw new Error('Peripheral not found for characteristic');
        }

        const peripheral = this.peripherals.get(peripheralHandle);
        if (!peripheral) {
            throw new Error('Peripheral not found for characteristic');
        }

        const service = this.services.get(serviceHandle);
        if (!service) {
            throw new Error('Service not found for characteristic');
        }

        const characteristic = this.characteristics.get(characteristicHandle);
        if (!characteristic) {
            throw new Error('Characteristic not found');
        }

        return {
            peripheral,
            service,
            characteristic
        };
    }

    public getDescriptorGraph(descriptorHandle: string): { peripheral: Peripheral, service: Service, characteristic: Characteristic, descriptor: Descriptor } {
        const characteristicHandle = this.parents.get(descriptorHandle);
        if (!characteristicHandle) {
            throw new Error('Characteristic not found for descriptor');
        }

        const serviceHandle = this.parents.get(characteristicHandle);
        if (!serviceHandle) {
            throw new Error('Service not found for descriptor');
        }

        const peripheralHandle = this.parents.get(serviceHandle);
        if (!peripheralHandle) {
            throw new Error('Peripheral not found for descriptor');
        }

        const peripheral = this.peripherals.get(peripheralHandle);
        if (!peripheral) {
            throw new Error('Peripheral not found for descriptor');
        }

        const service = this.services.get(serviceHandle);
        if (!service) {
            throw new Error('Service not found for descriptor');
        }

        const characteristic = this.characteristics.get(characteristicHandle);
        if (!characteristic) {
            throw new Error('Characteristic not found for descriptor');
        }

        const descriptor = this.descriptors.get(descriptorHandle);
        if (!descriptor) {
            throw new Error('Descriptor not found');
        }

        return {
            peripheral,
            service,
            characteristic,
            descriptor
        };
    }
}

/**
 * @hidden
 */
export class SimplebleAdapter extends EventEmitter implements BluetoothAdapter {
    private adapter: Adapter;
    private peripherals = new Map<string, Peripheral>();
    private handles = new PeripheralHandles(this.peripherals);

    private validDevice(device: BluetoothDeviceInit, serviceUUIDs: Array<string>): boolean {
        if (serviceUUIDs.length === 0) {
            // Match any device
            return true;
        }

        if (!device._serviceUUIDs) {
            // No advertised services, no match
            return false;
        }

        const advertisedUUIDs = device._serviceUUIDs.map((serviceUUID: string) => BluetoothUUID.canonicalUUID(serviceUUID));

        // An advertised UUID matches our search UUIDs
        return serviceUUIDs.some(serviceUUID => advertisedUUIDs.indexOf(serviceUUID) >= 0);
    }

    private buildBluetoothDevice(device: Peripheral): BluetoothDeviceInit {
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

    private get state(): boolean {
        const adapterEnabled = isEnabled();
        return !!adapterEnabled;
    }

    public async getEnabled(): Promise<boolean> {
        return this.state;
    }

    public getAdapters(): Array<{ index: number; address: string; active: boolean; }> {
        const adapters = simpleBleAdapters();
        return adapters.map(({ address, active }, index) => ({ index, address, active }));
    }

    public useAdapter(index: number): void {
        const adapters = simpleBleAdapters();
        const selected = adapters[index];
        if (!selected) {
            throw new Error(`Adapter ${index} not found.`);
        }
        this.adapter = selected;
    }

    public async startScan(serviceUUIDs: Array<string>, foundFn: (device: BluetoothDeviceInit) => void): Promise<void> {
        if (this.state === false) {
            throw new Error('adapter not enabled');
        }

        if (!this.adapter) {
            this.adapter = simpleBleAdapters()[0];
        }

        const foundPeripherals: string[] = [];
        this.adapter.setCallbackOnScanFound(peripheral => {
            const device = this.buildBluetoothDevice(peripheral);
            if (this.validDevice(device, serviceUUIDs)) {
                if (!foundPeripherals.includes(device.id)) {
                    foundPeripherals.push(device.id);
                    this.peripherals.set(device.id, peripheral);
                    // Only call the found function the first time we find a valid device
                    foundFn(device);
                }
            }
        });

        const success = this.adapter.scanStart();
        if (!success) {
            throw new Error('scan start failed');
        }
    }

    public stopScan(_errorFn?: (errorMsg: string) => void): void {
        if (this.adapter) {
            const success = this.adapter.scanStop();
            if (!success) {
                throw new Error('scan stop failed');
            }
        }
    }

    public async connect(handle: string, disconnectFn?: () => void): Promise<void> {
        const peripheral = this.peripherals.get(handle);
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

        if (disconnectFn) {
            peripheral.setCallbackOnDisconnected(() => disconnectFn());
        }

        this.handles.createHandles(peripheral);
    }

    public async disconnect(handle: string): Promise<void> {
        const peripheral = this.peripherals.get(handle);
        if (!peripheral) {
            throw new Error('Peripheral not found');
        }

        const success = peripheral.disconnect();

        if (!success) {
            throw new Error('Disconnect failed');
        }

        this.handles.deleteHandles(peripheral);
    }

    public async discoverServices(handle: string, serviceUUIDs?: Array<string>): Promise<Array<BluetoothRemoteGATTServiceInit>> {
        const services = this.handles.getServices(handle);

        const discovered: BluetoothRemoteGATTServiceInit[] = [];
        for (const [handle, service] of Object.entries(services)) {
            if (!serviceUUIDs || serviceUUIDs.length === 0 || serviceUUIDs.indexOf(service.uuid) >= 0) {
                discovered.push({
                    _handle: handle,
                    uuid: service.uuid,
                    isPrimary: true
                });
            }
        }

        return discovered;
    }

    public async discoverIncludedServices(_handle: string, _serviceUUIDs?: Array<string>): Promise<Array<BluetoothRemoteGATTServiceInit>> {
        // Currently not implemented
        return [];
    }

    public async discoverCharacteristics(handle: string, characteristicUUIDs?: Array<string>): Promise<Array<BluetoothRemoteGATTCharacteristicInit>> {
        const { peripheral, service, characteristics } = this.handles.getCharacteristics(handle);

        const discovered: BluetoothRemoteGATTCharacteristicInit[] = [];

        for (const [handle, characteristic] of Object.entries(characteristics)) {
            const charUUID = BluetoothUUID.canonicalUUID(characteristic.uuid);

            if (!characteristicUUIDs || characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(charUUID) >= 0) {

                discovered.push({
                    _handle: handle,
                    uuid: charUUID,
                    properties: {
                        // Not all of these are supported in SimpleBle
                        broadcast: false, // characteristic.capabilities.includes('???'),
                        read: characteristic.canRead,
                        writeWithoutResponse: characteristic.canWriteRequest,
                        write: characteristic.canWriteCommand,
                        notify: characteristic.canNotify,
                        indicate: characteristic.canIndicate,
                        authenticatedSignedWrites: false, // characteristic.capabilities.includes('???'),
                        reliableWrite: false, // characteristic.capabilities.includes('???'),
                        writableAuxiliaries: false // characteristic.capabilities.includes('???'),
                    }
                });

                if (characteristic.canIndicate) {
                    peripheral.indicate(service.uuid, charUUID, data => {
                        if (this.handles.characteristicEvents.has(handle)) {
                            const event = this.handles.characteristicEvents.get(handle);
                            if (event) {
                                event(new DataView(data.buffer));
                            }
                        }
                    });
                }

                if (characteristic.canNotify) {
                    peripheral.notify(service.uuid, charUUID, data => {
                        if (this.handles.characteristicEvents.has(handle)) {
                            const event = this.handles.characteristicEvents.get(handle);
                            if (event) {
                                event(new DataView(data.buffer));
                            }
                        }
                    });
                }
            }
        }

        return discovered;
    }

    public async discoverDescriptors(handle: string, descriptorUUIDs?: Array<string>): Promise<Array<BluetoothRemoteGATTDescriptorInit>> {
        const descriptors = this.handles.getDescriptors(handle);
        const discovered = new Array<BluetoothRemoteGATTDescriptorInit>();

        for (const [handle, descriptor] of Object.entries(descriptors)) {
            const descUUID = BluetoothUUID.canonicalUUID(descriptor);

            if (!descriptorUUIDs || descriptorUUIDs.length === 0 || descriptorUUIDs.indexOf(descUUID) >= 0) {
                discovered.push({
                    _handle: handle,
                    uuid: descUUID
                });
            }
        }

        return discovered;
    }

    public async readCharacteristic(handle: string): Promise<DataView> {
        const { peripheral, service, characteristic } = this.handles.getCharacteristicGraph(handle);
        const data = peripheral.read(service.uuid, characteristic.uuid);
        return new DataView(data.buffer);
    }

    public async writeCharacteristic(handle: string, value: DataView, withoutResponse = false): Promise<void> {
        const { peripheral, service, characteristic } = this.handles.getCharacteristicGraph(handle);
        let success = false;

        if (withoutResponse) {
            success = peripheral.writeCommand(service.uuid, characteristic.uuid, new Uint8Array(value.buffer));
        } else {
            success = peripheral.writeRequest(service.uuid, characteristic.uuid, new Uint8Array(value.buffer));
        }

        if (!success) {
            throw new Error('Write failed');
        }
    }

    public async enableNotify(handle: string, notifyFn: (value: DataView) => void): Promise<void> {
        this.handles.characteristicEvents.set(handle, notifyFn);
    }

    public async disableNotify(handle: string): Promise<void> {
        this.handles.characteristicEvents.delete(handle);
    }

    public async readDescriptor(handle: string): Promise<DataView> {
        const { peripheral, service, characteristic, descriptor } = this.handles.getDescriptorGraph(handle);
        const data = peripheral.readDescriptor(service.uuid, characteristic.uuid, descriptor);
        if (!data) {
            throw new Error('Read failed');
        }
        return new DataView(data.buffer);
    }

    public async writeDescriptor(handle: string, value: DataView): Promise<void> {
        const { peripheral, service, characteristic, descriptor } = this.handles.getDescriptorGraph(handle);
        const success = peripheral.writeDescriptor(service.uuid, characteristic.uuid, descriptor, new Uint8Array(value.buffer));

        if (!success) {
            throw new Error('Write failed');
        }
    }
}
