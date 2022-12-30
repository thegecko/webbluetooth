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

//import { platform } from 'os';
import { EventEmitter } from 'events';
import { Adapter } from './adapter';
import { getCanonicalUUID } from '../helpers';
import { BluetoothDevice } from '../device';
import { BluetoothRemoteGATTService } from '../service';
import { BluetoothRemoteGATTCharacteristic } from '../characteristic';
import * as SimpleBle from './simpleble';
import { Service } from './simpleble';

const FIND_TIMEOUT = 500;

/**
 * @hidden
 */
export class SimplebleAdapter extends EventEmitter implements Adapter {

    private adapter: bigint | undefined;
    private peripherals = new Map<string, bigint>();
    private services = new Map<bigint, Service[]>();
    private characteristics = new Map<string, string[]>();
    private descriptors = new Map<string, string[]>();

    /*
    private deviceHandles = new Map<string, noble.Peripheral>();
    private serviceHandles = new Map<string, noble.Service>();
    private characteristicHandles = new Map<string, noble.Characteristic>();
    private descriptorHandles = new Map<string, noble.Descriptor>();
    private charNotifies = new Map<string, (value: DataView) => void>();
    */
    private discoverFn: ((handle: bigint) => void | undefined) | undefined;
    // private initialised = false;
    // private os: string = platform();

    /*
    constructor() {
        super();
        this.enabled = this.state;
        SimpleBle.on('stateChange', () => {
            if (this.enabled !== this.state) {
                this.enabled = this.state;
                this.emit(SimplebleAdapter.EVENT_ENABLED, this.enabled);
            }
        });
    }
    */

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

    /*
    private init(): void {
        if (this.initialised) {
            return;
        }
        noble.on('discover', (deviceInfo: noble.Peripheral) => {
            if (this.discoverFn) this.discoverFn(deviceInfo);
        });
        this.initialised = true;
    }
    */

    /*
    private bufferToDataView(buffer: Buffer): DataView {
        // Buffer to ArrayBuffer
        const arrayBuffer = new Uint8Array(buffer).buffer;
        return new DataView(arrayBuffer);
    }

    private dataViewToBuffer(dataView: DataView): Buffer {
        // DataView to TypedArray
        const typedArray = new Uint8Array(dataView.buffer);
        return Buffer.from(typedArray);
    }
    */

    private validDevice(_handle: bigint, serviceUUIDs: Array<string>): boolean {
        if (serviceUUIDs.length === 0) {
            // Match any device
            return true;
        }

        return true;
        /*

        if (!deviceInfo.advertisement.serviceUuids) {
            // No advertised services, no match
            return false;
        }

        const advertisedUUIDs = deviceInfo.advertisement.serviceUuids.map((serviceUUID: string) => {
            return getCanonicalUUID(serviceUUID);
        });

        return serviceUUIDs.some(serviceUUID => {
            // An advertised UUID matches our search UUIDs
            return (advertisedUUIDs.indexOf(serviceUUID) >= 0);
        });
        */
    }

    private buildBluetoothDevice(handle: bigint): Partial<BluetoothDevice> {
        const name = SimpleBle.simpleble_peripheral_identifier(handle);
        const address = SimpleBle.simpleble_peripheral_address(handle);
        const rssi = SimpleBle.simpleble_peripheral_rssi(handle);
        const mtu = SimpleBle.simpleble_peripheral_mtu(handle);
        const id = address || `${handle}`;

        const serviceUUIDs: string[] = [];
        const serviceCount = SimpleBle.simpleble_peripheral_services_count(handle);
        for (let i = 0; i < serviceCount; i ++) {
            const service = SimpleBle.simpleble_peripheral_services_get(handle, i);
            serviceUUIDs.push(service.uuid);
        }

        const manufacturerData = new Map();
        const manufacturerCount = SimpleBle.simpleble_peripheral_manufacturer_data_count(handle);
        for (let i = 0; i < manufacturerCount; i ++) {
            const manufacturer = SimpleBle.simpleble_peripheral_manufacturer_data_get(handle, i);
            manufacturerData.set(manufacturer.id, new DataView(manufacturer.data.buffer));
        }

        /* TODO
        if (deviceInfo.advertisement.manufacturerData) {
            // First 2 bytes are 16-bit company identifier
            const company = deviceInfo.advertisement.manufacturerData.readUInt16LE(0);

            // Remove company ID
            const buffer = deviceInfo.advertisement.manufacturerData.slice(2);
            manufacturerData.set(('0000' + company.toString(16)).slice(-4), this.bufferToDataView(buffer));
        }
        */

        const serviceData = new Map();
        //Todo
        /*
        if (deviceInfo.advertisement.serviceData) {
            for (const serviceAdvert of deviceInfo.advertisement.serviceData) {
                serviceData.set(getCanonicalUUID(serviceAdvert.uuid), this.bufferToDataView(serviceAdvert.data));
            }
        }
        */

        return {
            id,
            name,
            _serviceUUIDs: serviceUUIDs,
            adData: {
                rssi,
                txPower: mtu,
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

    public async getEnabled(): Promise<boolean> {
        return this.state;
    }

    public async startScan(serviceUUIDs: Array<string>, foundFn: (device: Partial<BluetoothDevice>) => void): Promise<void> {
        if (this.state === false) {
            throw new Error('adapter not enabled');
        }

        this.discoverFn = handle => {
            if (this.validDevice(handle, serviceUUIDs)) {
                const device = this.buildBluetoothDevice(handle);

                if (!this.peripherals.has(device.id)) {
                    this.peripherals.set(device.id, handle);
                    // Only call the found function the first time we find a valid device
                    foundFn(device);
                }
            }
        };

        this.adapter = SimpleBle.simpleble_adapter_get_handle(0);
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

    public async connect(id: string, _disconnectFn?: () => void): Promise<void> {
        const handle = this.peripherals.get(id);
        if (!handle) {
            throw new Error('Peripheral not found');
        }

        const success = SimpleBle.simpleble_peripheral_connect(handle);
        if (!success) {
            throw new Error('Connect failed');
        }
        /*
        const baseDevice = this.deviceHandles.get(handle);
        baseDevice.removeAllListeners('connect');
        baseDevice.removeAllListeners('disconnect');

        if (disconnectFn) {
            baseDevice.once('disconnect', () => {
                this.serviceHandles.clear();
                this.characteristicHandles.clear();
                this.descriptorHandles.clear();
                this.charNotifies.clear();
                disconnectFn();
            });
        }

        return baseDevice.connectAsync();
        */
    }

    public async disconnect(id: string): Promise<void> {
        const handle = this.peripherals.get(id);
        if (!handle) {
            throw new Error('Peripheral not found');
        }

        const success = SimpleBle.simpleble_peripheral_disconnect(handle);
        if (!success) {
            throw new Error('Connect failed');
        }
        /*
        const baseDevice = this.deviceHandles.get(handle);
        return baseDevice.disconnectAsync();
        */
    }

    public async discoverServices(id: string, serviceUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTService>>> {
        const handle = this.peripherals.get(id);
        if (!handle) {
            throw new Error('Peripheral not found');
        }

        const discovered = [];

        const services: Service[] = [];
        const serviceCount = SimpleBle.simpleble_peripheral_services_count(handle);
        for (let i = 0; i < serviceCount; i ++) {
            const service = SimpleBle.simpleble_peripheral_services_get(handle, i);
            const serviceUUID = getCanonicalUUID(service.uuid);

            if (!serviceUUIDs || serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceUUID) >= 0) {
                discovered.push({
                    uuid: serviceUUID,
                    primary: true
                });
            }

            const chars = service.characteristics.map(char => char.uuid);
            this.characteristics.set(serviceUUID, chars);

            for (const char of service.characteristics) {
                this.descriptors.set(char.uuid, char.descriptors);
            }

            services.push(service);
        }

        this.services.set(handle, services);
        return discovered;
    }

    public async discoverIncludedServices(_handle: string, _serviceUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTService>>> {
        // Currently not implemented
        return [];
    }

    public async discoverCharacteristics(serviceUuid: string, characteristicUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTCharacteristic>>> {
        const characteristics = this.characteristics.get(serviceUuid);
        const discovered = [];

        for (const characteristic of characteristics) {
            const charUUID = getCanonicalUUID(characteristic);

            if (!characteristicUUIDs || characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(charUUID) >= 0) {

                discovered.push({
                    uuid: charUUID,
                    properties: {
                        /*
                        broadcast: (characteristicInfo.properties.indexOf('broadcast') >= 0),
                        read: (characteristicInfo.properties.indexOf('read') >= 0),
                        writeWithoutResponse: (characteristicInfo.properties.indexOf('writeWithoutResponse') >= 0),
                        write: (characteristicInfo.properties.indexOf('write') >= 0),
                        notify: (characteristicInfo.properties.indexOf('notify') >= 0),
                        indicate: (characteristicInfo.properties.indexOf('indicate') >= 0),
                        authenticatedSignedWrites: (characteristicInfo.properties.indexOf('authenticatedSignedWrites') >= 0),
                        reliableWrite: (characteristicInfo.properties.indexOf('reliableWrite') >= 0),
                        writableAuxiliaries: (characteristicInfo.properties.indexOf('writableAuxiliaries') >= 0)
                        */
                    }
                });

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

    public async discoverDescriptors(charUuid: string, descriptorUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTDescriptor>>> {
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

    public async readCharacteristic(_handle: string): Promise<DataView> {
        throw new Error('not implemented');

        /*
        const characteristic = this.characteristicHandles.get(handle);
        const data = await characteristic.readAsync();
        const dataView = this.bufferToDataView(data);
        return dataView;
        */
    }

    public async writeCharacteristic(_handle: string, _value: DataView, _withoutResponse = false): Promise<void> {
        throw new Error('not implemented');

        /*
        const buffer = this.dataViewToBuffer(value);
        const characteristic = this.characteristicHandles.get(handle);

        if (withoutResponse === undefined) {
            // writeWithoutResponse and authenticatedSignedWrites don't require a response
            withoutResponse = characteristic.properties.indexOf('writeWithoutResponse') >= 0
                || characteristic.properties.indexOf('authenticatedSignedWrites') >= 0;
        }

        await characteristic.writeAsync(buffer, withoutResponse);

        // TODO: check still needed
        // Add a small delay for writing without response when not on MacOS
        if (this.os !== 'darwin' && withoutResponse) {
            await new Promise(resolve => setTimeout(resolve, 25));
        }
        */
    }

    public enableNotify(_handle: string, _notifyFn: (value: DataView) => void): Promise<void> {
        throw new Error('not implemented');

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

    public disableNotify(_handle: string): Promise<void> {
        throw new Error('not implemented');

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

    public async readDescriptor(_handle: string): Promise<DataView> {
        throw new Error('not implemented');

        /*
        const data = await this.descriptorHandles.get(handle).readValueAsync();
        const dataView = this.bufferToDataView(data);
        return dataView;
        */
    }

    public writeDescriptor(_handle: string, _value: DataView): Promise<void> {
        throw new Error('not implemented');

        /*
        const buffer = this.dataViewToBuffer(value);
        return this.descriptorHandles.get(handle).writeValueAsync(buffer);
        */
    }
}
