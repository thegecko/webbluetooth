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

/*
import { platform } from 'os';
import { EventEmitter } from 'events';
import { EVENT_ENABLED } from './';
import { Adapter } from './adapter';
import { BluetoothUUID } from '../helpers';
import { BluetoothDevice } from '../device';
import { BluetoothRemoteGATTService } from '../service';
import { BluetoothRemoteGATTCharacteristic } from '../characteristic';
import * as noble from '@abandonware/noble';

export class NobleAdapter extends EventEmitter implements Adapter {

    private deviceHandles = new Map<string, noble.Peripheral>();
    private serviceHandles = new Map<string, noble.Service>();
    private characteristicHandles = new Map<string, noble.Characteristic>();
    private descriptorHandles = new Map<string, noble.Descriptor>();
    private charNotifies = new Map<string, (value: DataView) => void>();
    private discoverFn: ((device: noble.Peripheral) => void | undefined) | undefined;
    private initialised = false;
    private enabled = false;
    private os: string = platform();

    constructor() {
        super();
        this.enabled = this.state;
        noble.on('stateChange', () => {
            if (this.enabled !== this.state) {
                this.enabled = this.state;
                this.emit(EVENT_ENABLED, this.enabled);
            }
        });
    }

    private get state(): boolean {
        return (noble.state === 'poweredOn');
    }

    private init(): void {
        if (this.initialised) {
            return;
        }
        noble.on('discover', (deviceInfo: noble.Peripheral) => {
            if (this.discoverFn) this.discoverFn(deviceInfo);
        });
        this.initialised = true;
    }

    private bufferToDataView(buffer: Buffer): DataView {
        // Buffer to ArrayBuffer
        const arrayBuffer = new Uint8Array(buffer).buffer;
        return new DataView(arrayBuffer);
    }

    private dataViewToBuffer(dataView: DataView): Buffer {
        // DataView to TypedArray
        const typedArray = new Uint8Array(dataView.buffer);
        return new Buffer(typedArray);
    }

    private validDevice(deviceInfo: noble.Peripheral, serviceUUIDs: Array<string>): boolean {
        if (serviceUUIDs.length === 0) {
            // Match any device
            return true;
        }

        if (!deviceInfo.advertisement.serviceUuids) {
            // No advertised services, no match
            return false;
        }

        const advertisedUUIDs = deviceInfo.advertisement.serviceUuids.map((serviceUUID: string) => {
            return BluetoothUUID.canonicalUUID(serviceUUID);
        });

        return serviceUUIDs.some(serviceUUID => {
            // An advertised UUID matches our search UUIDs
            return (advertisedUUIDs.indexOf(serviceUUID) >= 0);
        });
    }

    private deviceToBluetoothDevice(deviceInfo: noble.Peripheral): Partial<BluetoothDevice> {
        const deviceID = (deviceInfo.address && deviceInfo.address !== 'unknown') ? deviceInfo.address : deviceInfo.id;
        const serviceUUIDs = deviceInfo.advertisement.serviceUuids ? deviceInfo.advertisement.serviceUuids.map((serviceUUID: string) => BluetoothUUID.canonicalUUID(serviceUUID)) : [];

        const manufacturerData = new Map();
        if (deviceInfo.advertisement.manufacturerData) {
            // First 2 bytes are 16-bit company identifier
            const company = deviceInfo.advertisement.manufacturerData.readUInt16LE(0);

            // Remove company ID
            const buffer = deviceInfo.advertisement.manufacturerData.slice(2);
            manufacturerData.set(('0000' + company.toString(16)).slice(-4), this.bufferToDataView(buffer));
        }

        const serviceData = new Map();
        if (deviceInfo.advertisement.serviceData) {
            for (const serviceAdvert of deviceInfo.advertisement.serviceData) {
                serviceData.set(BluetoothUUID.canonicalUUID(serviceAdvert.uuid), this.bufferToDataView(serviceAdvert.data));
            }
        }

        return {
            id: deviceID,
            name: deviceInfo.advertisement.localName,
            _serviceUUIDs: serviceUUIDs,
            _adData: {
                rssi: deviceInfo.rssi,
                txPower: deviceInfo.advertisement.txPowerLevel,
                serviceData: serviceData,
                manufacturerData: manufacturerData
            }
        };
    }

    public async getEnabled(): Promise<boolean> {
        if (noble.state === 'unknown' || noble.state === 'poweredOff') {
            return new Promise(resolve => noble.once('stateChange', () => resolve(this.state)));
        }

        return this.state;
    }

    public async startScan(serviceUUIDs: Array<string>, foundFn: (device: Partial<BluetoothDevice>) => void): Promise<void> {

        this.discoverFn = deviceInfo => {
            if (this.validDevice(deviceInfo, serviceUUIDs)) {
                const device = this.deviceToBluetoothDevice(deviceInfo);

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                if (!this.deviceHandles.has(device.id!)) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.deviceHandles.set(device.id!, deviceInfo);
                    // Only call the found function the first time we find a valid device
                    foundFn(device);
                }
            }
        };

        this.init();
        this.deviceHandles.clear();
        if (noble.state === 'unknown' || noble.state === 'poweredOff') {
            await new Promise(resolve => noble.once('stateChange', () => resolve(undefined)));
        }

        if (this.state === false) {
            throw new Error('adapter not enabled');
        }
        // Noble doesn't correctly match short and canonical UUIDs on Linux, so we need to check ourselves
        // Continually scan to pick up all advertised UUIDs
        await noble.startScanningAsync([], true);
    }

    public stopScan(_errorFn?: (errorMsg: string) => void): void {
        this.discoverFn = undefined;
        noble.stopScanning();
    }

    public connect(handle: string, disconnectFn?: () => void): Promise<void> {
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
    }

    public disconnect(handle: string): Promise<void> {
        const baseDevice = this.deviceHandles.get(handle);
        return baseDevice.disconnectAsync();
    }

    public async discoverServices(handle: string, serviceUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTService>>> {
        const baseDevice = this.deviceHandles.get(handle);
        const services = await baseDevice.discoverServicesAsync();
        const discovered = [];

        for (const serviceInfo of services) {
            const serviceUUID = BluetoothUUID.canonicalUUID(serviceInfo.uuid);

            if (!serviceUUIDs || serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceUUID) >= 0) {
                if (!this.serviceHandles.has(serviceUUID)) {
                    this.serviceHandles.set(serviceUUID, serviceInfo);
                }

                discovered.push({
                    uuid: serviceUUID,
                    primary: true
                });
            }
        }

        return discovered;
    }

    public async discoverIncludedServices(handle: string, serviceUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTService>>> {
        const serviceInfo = this.serviceHandles.get(handle);
        const services = await serviceInfo.discoverIncludedServicesAsync();
        const discovered = [];

        // TODO: check retiurn here!
        for (const service of services) {
            const serviceUUID = BluetoothUUID.canonicalUUID(service);

            if (!serviceUUIDs || serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceUUID) >= 0) {
                discovered.push({
                    uuid: serviceUUID,
                    primary: false
                });
            }
        }

        return discovered;
    }

    public async discoverCharacteristics(handle: string, characteristicUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTCharacteristic>>> {
        const serviceInfo = this.serviceHandles.get(handle);
        const characteristics = await serviceInfo.discoverCharacteristicsAsync();
        const discovered = [];

        for (const characteristicInfo of characteristics) {
            const charUUID = BluetoothUUID.canonicalUUID(characteristicInfo.uuid);

            if (!characteristicUUIDs || characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(charUUID) >= 0) {
                if (!this.characteristicHandles.has(charUUID)) {
                    this.characteristicHandles.set(charUUID, characteristicInfo);
                }

                discovered.push({
                    uuid: charUUID,
                    properties: {
                        broadcast:                  (characteristicInfo.properties.indexOf('broadcast') >= 0),
                        read:                       (characteristicInfo.properties.indexOf('read') >= 0),
                        writeWithoutResponse:       (characteristicInfo.properties.indexOf('writeWithoutResponse') >= 0),
                        write:                      (characteristicInfo.properties.indexOf('write') >= 0),
                        notify:                     (characteristicInfo.properties.indexOf('notify') >= 0),
                        indicate:                   (characteristicInfo.properties.indexOf('indicate') >= 0),
                        authenticatedSignedWrites:  (characteristicInfo.properties.indexOf('authenticatedSignedWrites') >= 0),
                        reliableWrite:              (characteristicInfo.properties.indexOf('reliableWrite') >= 0),
                        writableAuxiliaries:        (characteristicInfo.properties.indexOf('writableAuxiliaries') >= 0)
                    }
                });

                characteristicInfo.on('data', (data: Buffer, isNotification: boolean) => {
                    if (isNotification === true && this.charNotifies.has(charUUID)) {
                        const dataView = this.bufferToDataView(data);
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        this.charNotifies.get(charUUID)!(dataView);
                    }
                });
            }
        }

        return discovered;
    }

    public async discoverDescriptors(handle: string, descriptorUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTDescriptor>>> {
        const characteristicInfo = this.characteristicHandles.get(handle);
        const descriptors = await characteristicInfo.discoverDescriptorsAsync();
        const discovered = [];

        for (const descriptorInfo of descriptors) {
            const descUUID = BluetoothUUID.canonicalUUID(descriptorInfo.uuid);

            if (!descriptorUUIDs || descriptorUUIDs.length === 0 || descriptorUUIDs.indexOf(descUUID) >= 0) {
                const descHandle = characteristicInfo.uuid + '-' + descriptorInfo.uuid;
                if (!this.descriptorHandles.has(descHandle)) {
                    this.descriptorHandles.set(descHandle, descriptorInfo);
                }

                discovered.push({
                    uuid: descUUID
                });
            }
        }

        return discovered;
    }

    public async readCharacteristic(handle: string): Promise<DataView> {
        const characteristic = this.characteristicHandles.get(handle);
        const data = await characteristic.readAsync();
        const dataView = this.bufferToDataView(data);
        return dataView;
    }

    public async writeCharacteristic(handle: string, value: DataView, withoutResponse = false): Promise<void> {
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
    }

    public enableNotify(handle: string, notifyFn: (value: DataView) => void): Promise<void> {
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
    }

    public disableNotify(handle: string): Promise<void> {
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
    }

    public async readDescriptor(handle: string): Promise<DataView> {
        const data = await this.descriptorHandles.get(handle).readValueAsync();
        const dataView = this.bufferToDataView(data);
        return dataView;
    }

    public writeDescriptor(handle: string, value: DataView): Promise<void> {
        const buffer = this.dataViewToBuffer(value);
        return this.descriptorHandles.get(handle).writeValueAsync(buffer);
    }
}
*/
