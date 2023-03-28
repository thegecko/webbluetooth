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

/*

Missing Implementation
- notify/indicate events (start/stop/char changed)
- watching advertisements + advertisementreceived
- request manufacturerData + serviceData

Missing functionality in SimpleBLE
- event on adapter state change
- discoverIncludedServices
- missing char properties

*/
import { EventEmitter } from 'events';
import * as SimpleBle from './simpleble';
import { Adapter } from './adapter';
import { getCanonicalUUID } from '../helpers';
import { BluetoothDeviceImpl } from '../device';
import { BluetoothRemoteGATTCharacteristicImpl } from '../characteristic';
import { BluetoothRemoteGATTServiceImpl } from '../service';
import { BluetoothRemoteGATTDescriptorImpl } from '../descriptor';

const FIND_TIMEOUT = 500;

/**
 * @hidden
 */
export class SimplebleAdapter extends EventEmitter implements Adapter {

    private adapter: bigint;
    private peripherals = new Map<string, bigint>();
    private servicesByPeripheral = new Map<bigint, SimpleBle.Service[]>();
    private peripheralByService = new Map<string, bigint>();
    private serviceByCharacteristic = new Map<string, string>();
    private characteristicsByService = new Map<string, SimpleBle.Characteristic[]>();
    private characteristicByDescriptor = new Map<string, { char: string, desc: string }>();
    private descriptors = new Map<string, string[]>();
    private discoverFn: ((handle: bigint) => void | undefined) | undefined;

    private get state(): boolean {
        const adaptersEnabled = SimpleBle.simpleble_adapter_is_bluetooth_enabled();
        return adaptersEnabled.length && !!adaptersEnabled[0];
    }

    private get scanning(): boolean {
        if (!this.adapter) {
            return false;
        }
        return SimpleBle.simpleble_adapter_scan_is_active(this.adapter);
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

    private buildBluetoothDevice(handle: bigint): Partial<BluetoothDeviceImpl> {
        const name = SimpleBle.simpleble_peripheral_identifier(handle);
        const address = SimpleBle.simpleble_peripheral_address(handle);
        const rssi = SimpleBle.simpleble_peripheral_rssi(handle);
        const txPower = SimpleBle.simpleble_peripheral_tx_power(handle);
        const id = address || `${handle}`;

        const serviceUUIDs: string[] = [];
        const serviceData = new Map();

        const serviceCount = SimpleBle.simpleble_peripheral_services_count(handle);
        for (let i = 0; i < serviceCount; i ++) {
            const service = SimpleBle.simpleble_peripheral_services_get(handle, i);
            serviceUUIDs.push(service.uuid);
            if (service.data) {
                serviceData.set(service.uuid, service.data);
            }
        }

        const manufacturerData = new Map();
        const manufacturerCount = SimpleBle.simpleble_peripheral_manufacturer_data_count(handle);
        for (let i = 0; i < manufacturerCount; i ++) {
            const manufacturer = SimpleBle.simpleble_peripheral_manufacturer_data_get(handle, i);
            manufacturerData.set(manufacturer.id, new DataView(manufacturer.data.buffer));
        }

        /* TODO: check this
        if (deviceInfo.advertisement.manufacturerData) {
            // First 2 bytes are 16-bit company identifier
            const company = deviceInfo.advertisement.manufacturerData.readUInt16LE(0);

            // Remove company ID
            const buffer = deviceInfo.advertisement.manufacturerData.slice(2);
            manufacturerData.set(('0000' + company.toString(16)).slice(-4), this.bufferToDataView(buffer));
        }
        */

        return {
            id,
            name,
            _serviceUUIDs: serviceUUIDs,
            adData: {
                rssi,
                txPower,
                serviceData,
                manufacturerData
            }
        };
    }

    private findDevices() {
        if (this.adapter) {
            const deviceCount = SimpleBle.simpleble_adapter_scan_get_results_count(this.adapter);

            for (let i = 0; i < deviceCount; i++) {
                const handle = SimpleBle.simpleble_adapter_scan_get_results_handle(this.adapter, i);
                if (this.discoverFn) {
                    this.discoverFn(handle);
                }
            }
        }

        if (this.scanning) {
            setTimeout(() => this.findDevices(), FIND_TIMEOUT);
        }
    }

    private enumerate(handle: bigint): void {
        this.servicesByPeripheral.clear();
        this.peripheralByService.clear();
        this.serviceByCharacteristic.clear();
        this.characteristicsByService.clear();
        this.characteristicByDescriptor.clear();
        this.descriptors.clear();

        const services: SimpleBle.Service[] = [];
        const serviceCount = SimpleBle.simpleble_peripheral_services_count(handle);
        for (let i = 0; i < serviceCount; i ++) {
            const service = SimpleBle.simpleble_peripheral_services_get(handle, i);
            const serviceUUID = getCanonicalUUID(service.uuid);

            this.characteristicsByService.set(serviceUUID, service.characteristics);

            for (const char of service.characteristics) {
                this.serviceByCharacteristic.set(char.uuid, serviceUUID);
                this.descriptors.set(char.uuid, char.descriptors);

                for (const desc of char.descriptors) {
                    this.characteristicByDescriptor.set(`${char.uuid}-${desc}`, { char: char.uuid, desc });
                }
            }

            this.peripheralByService.set(service.uuid, handle);
            services.push(service);
        }

        this.servicesByPeripheral.set(handle, services);
    }

    public async getEnabled(): Promise<boolean> {
        return this.state;
    }

    public async startScan(serviceUUIDs: Array<string>, foundFn: (device: Partial<BluetoothDevice>) => void): Promise<void> {
        if (this.state === false) {
            throw new Error('adapter not enabled');
        }

        this.discoverFn = handle => {
            const device = this.buildBluetoothDevice(handle);
            if (this.validDevice(device, serviceUUIDs)) {
                if (!this.peripherals.has(device.id)) {
                    this.peripherals.set(device.id, handle);
                    // Only call the found function the first time we find a valid device
                    foundFn(device);
                }
            }
        };

        if (!this.adapter) {
            this.adapter = SimpleBle.simpleble_adapter_get_handle(0);
        }

        SimpleBle.simpleble_adapter_scan_start(this.adapter);

        this.peripherals.clear();
        this.findDevices();
    }

    public stopScan(_errorFn?: (errorMsg: string) => void): void {
        this.discoverFn = undefined;
        if (this.adapter) {
            SimpleBle.simpleble_adapter_scan_stop(this.adapter);
        }
    }

    public async connect(id: string, disconnectFn?: () => void): Promise<void> {
        const handle = this.peripherals.get(id);
        if (!handle) {
            throw new Error('Peripheral not found');
        }

        const connectable = SimpleBle.simpleble_peripheral_is_connectable(handle);
        if (!connectable) {
            throw new Error('Connection not possible');
        }

        const success = SimpleBle.simpleble_peripheral_connect(handle);
        if (!success) {
            throw new Error('Connect failed');
        }

        this.enumerate(handle);

        if (disconnectFn) {
            SimpleBle.simpleble_peripheral_set_callback_on_disconnected(handle, () => disconnectFn(), undefined);
        }
    }

    public async disconnect(id: string): Promise<void> {
        const handle = this.peripherals.get(id);
        if (!handle) {
            throw new Error('Peripheral not found');
        }

        const success = SimpleBle.simpleble_peripheral_disconnect(handle);
        if (!success) {
            throw new Error('Disconnect failed');
        }
    }

    public async discoverServices(id: string, serviceUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTServiceImpl>>> {
        const handle = this.peripherals.get(id);
        if (!handle) {
            throw new Error('Peripheral not found');
        }

        const discovered = [];

        const services = this.servicesByPeripheral.get(handle);

        for (const service of services) {
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
        const characteristics = this.characteristicsByService.get(serviceUuid);
        const discovered = [];

        for (const characteristic of characteristics) {
            const charUUID = getCanonicalUUID(characteristic.uuid);

            if (!characteristicUUIDs || characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(charUUID) >= 0) {

                discovered.push({
                    uuid: charUUID,
                    properties: {
                        // Not all of these are suppoertred in SimpleBle
                        // broadcast: characteristic.capabilities.includes('???'),
                        read: characteristic.capabilities.includes('read'),
                        writeWithoutResponse: characteristic.capabilities.includes('write_request'),
                        write: characteristic.capabilities.includes('write_command'),
                        notify: characteristic.capabilities.includes('notify'),
                        indicate: characteristic.capabilities.includes('indicate'),
                        // authenticatedSignedWrites: characteristic.capabilities.includes('???'),
                        // reliableWrite: characteristic.capabilities.includes('???'),
                        // writableAuxiliaries: characteristic.capabilities.includes('???'),
                    }
                });

                // TODO: notify/indicate events
                /*
                characteristicInfo.on('data', (data: Buffer, isNotification: boolean) => {
                    if (isNotification === true && this.charNotifies.has(charUUID)) {
                        const dataView = this.bufferToDataView(data);
                        this.charNotifies.get(charUUID)!(dataView);
                    }
                });
                */
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
        const handle = this.peripheralByService.get(serviceUuid);
        const data = SimpleBle.simpleble_peripheral_read(handle, serviceUuid, charUuid);
        return new DataView(data.buffer);
    }

    public async writeCharacteristic(charUuid: string, value: DataView, withoutResponse = false): Promise<void> {
        const serviceUuid = this.serviceByCharacteristic.get(charUuid);
        const handle = this.peripheralByService.get(serviceUuid);
        let success = false;

        if (withoutResponse) {
            success = SimpleBle.simpleble_peripheral_write_command(handle, serviceUuid, charUuid, new Uint8Array(value.buffer));
        } else {
            success = SimpleBle.simpleble_peripheral_write_request(handle, serviceUuid, charUuid, new Uint8Array(value.buffer));
        }

        if (!success) {
            throw new Error('Write failed');
        }
    }

    public async enableNotify(_handle: string, _notifyFn: (value: DataView) => void): Promise<void> {
        throw new Error('not implemented');

        // TODO: - emit notitifications
        /*
        if (this.charNotifies.has(handle)) {
            this.charNotifies.set(handle, notifyFn);
            return Promise.resolve();
        }

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            const characteristic = this.characteristicHandles.get(handle);

            // TODO: check type emitted
            characteristic.once('notify', (state: string) => {
                if (state !== 'true') {
                    reject('notify failed to enable');
                }
                this.charNotifies.set(handle, notifyFn);
                resolve(undefined);
            });

            await characteristic.notifyAsync(true);
        });
        */
    }

    public async disableNotify(_handle: string): Promise<void> {
        throw new Error('not implemented');

        // TODO: - stop emit notitifications
        /*
        if (!this.charNotifies.has(handle)) {
            return Promise.resolve();
        }

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            const characteristic = this.characteristicHandles.get(handle);

            // TODO: check type emitted
            characteristic.once('notify', (state: string) => {
                if (state !== 'false') {
                    reject('notify failed to disable');
                }

                if (this.charNotifies.has(handle)) {
                    this.charNotifies.delete(handle);
                }
                resolve(undefined);
            });

            await characteristic.notifyAsync(false);
        });
        */
    }

    public async readDescriptor(handle: string): Promise<DataView> {
        const { char, desc } = this.characteristicByDescriptor.get(handle);
        const serviceUuid = this.serviceByCharacteristic.get(char);
        const peripheral = this.peripheralByService.get(serviceUuid);

        const data = SimpleBle.simpleble_peripheral_read_descriptor(peripheral, serviceUuid, char, desc);
        return new DataView(data.buffer);
    }

    public async writeDescriptor(handle: string, value: DataView): Promise<void> {
        const { char, desc } = this.characteristicByDescriptor.get(handle);
        const serviceUuid = this.serviceByCharacteristic.get(char);
        const peripheral = this.peripheralByService.get(serviceUuid);

        const success = SimpleBle.simpleble_peripheral_write_descriptor(peripheral, serviceUuid, char, desc, new Uint8Array(value.buffer));

        if (!success) {
            throw new Error('Write failed');
        }
    }
}
