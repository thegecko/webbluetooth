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

import { platform } from "os";
import { EventEmitter } from "events";
import { getCanonicalUUID } from "./helpers";
import { BluetoothDevice } from "./device";
import { BluetoothRemoteGATTService } from "./service";
import { BluetoothRemoteGATTCharacteristic } from "./characteristic";
import * as noble from "@abandonware/noble";

/**
 * @hidden
 */
export interface Adapter extends EventEmitter {
    getEnabled: (completeFn: (enabled: boolean) => void) => void;
    startScan: (serviceUUIDs: Array<string>, foundFn: (device: Partial<BluetoothDevice>) => void, completeFn?: () => void, errorFn?: (errorMsg: string) => void) => void;
    stopScan: (errorFn?: (errorMsg: string) => void) => void;
    connect: (handle: string, connectFn: () => void, disconnectFn: () => void,	errorFn?: (errorMsg: string) => void) => void;
    disconnect: (handle: string, errorFn?: (errorMsg: string) => void) => void;
    discoverServices: (handle: string, serviceUUIDs: Array<string>, completeFn: (services: Array<Partial<BluetoothRemoteGATTService>>) => void, errorFn?: (errorMsg: string) => void) => void;
    discoverIncludedServices: (handle: string, serviceUUIDs: Array<string>, completeFn: (services: Array<Partial<BluetoothRemoteGATTService>>) => void, errorFn?: (errorMsg: string) => void) => void;
    discoverCharacteristics: (handle: string, characteristicUUIDs: Array<string>, completeFn: (characteristics: Array<Partial<BluetoothRemoteGATTCharacteristic>>) => void, errorFn?: (errorMsg: string) => void) => void;
    discoverDescriptors: (handle: string, descriptorUUIDs: Array<string>, completeFn: (descriptors: Array<Partial<BluetoothRemoteGATTDescriptor>>) => void, errorFn?: (errorMsg: string) => void) => void;
    readCharacteristic: (handle: string, completeFn: (value: DataView) => void, errorFn?: (errorMsg: string) => void) => void;
    writeCharacteristic: (handle: string, value: DataView, completeFn?: () => void, errorFn?: (errorMsg: string) => void, withoutResponse?: boolean) => void;
    enableNotify: (handle: string, notifyFn: () => void, completeFn?: () => void, errorFn?: (errorMsg: string) => void) => void;
    disableNotify: (handle: string, completeFn?: () => void, errorFn?: (errorMsg: string) => void) => void;
    readDescriptor: (handle: string, completeFn: (value: DataView) => void, errorFn?: (errorMsg: string) => void) => void;
    writeDescriptor: (handle: string, value: DataView, completeFn?: () => void, errorFn?: (errorMsg: string) => void) => void;
}

/**
 * @hidden
 */
export class NobleAdapter extends EventEmitter implements Adapter {

    public static EVENT_ENABLED: string = "enabledchanged";

    private deviceHandles: {} = {};
    private serviceHandles: {} = {};
    private characteristicHandles: {} = {};
    private descriptorHandles: {} = {};
    private charNotifies: {} = {};
    private discoverFn: (device: noble.Peripheral) => void = null;
    private initialised: boolean = false;
    private enabled: boolean = false;
    private os: string = platform();

    constructor() {
        super();
        this.enabled = this.state;
        noble.on("stateChange", () => {
            if (this.enabled !== this.state) {
                this.enabled = this.state;
                this.emit(NobleAdapter.EVENT_ENABLED, this.enabled);
            }
        });
    }

    private get state(): boolean {
        return (noble.state === "poweredOn");
    }

    private init(completeFn: () => any): void {
        if (this.initialised) return completeFn();
        noble.on("discover", deviceInfo => {
            if (this.discoverFn) this.discoverFn(deviceInfo);
        });
        this.initialised = true;
        completeFn();
    }

    private checkForError(errorFn, continueFn?, delay?: number) {
        return function(error) {
            if (error) errorFn(error);
            else if (typeof continueFn === "function") {
                const args = [].slice.call(arguments, 1);
                if (delay === null) continueFn.apply(this, args);
                else setTimeout(() => continueFn.apply(this, args), delay);
            }
        };
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

        const advertisedUUIDs = deviceInfo.advertisement.serviceUuids.map(serviceUUID => {
            return getCanonicalUUID(serviceUUID);
        });

        return serviceUUIDs.some(serviceUUID => {
            // An advertised UUID matches our search UUIDs
            return (advertisedUUIDs.indexOf(serviceUUID) >= 0);
        });
    }

    private deviceToBluetoothDevice(deviceInfo): Partial<BluetoothDevice> {
        const deviceID = (deviceInfo.address && deviceInfo.address !== "unknown") ? deviceInfo.address : deviceInfo.id;

        const serviceUUIDs = [];
        if (deviceInfo.advertisement.serviceUuids) {
            deviceInfo.advertisement.serviceUuids.forEach(serviceUUID => {
                serviceUUIDs.push(getCanonicalUUID(serviceUUID));
            });
        }

        const manufacturerData = new Map();
        if (deviceInfo.advertisement.manufacturerData) {
            // First 2 bytes are 16-bit company identifier
            const company = deviceInfo.advertisement.manufacturerData.readUInt16LE(0);

            // Remove company ID
            const buffer = deviceInfo.advertisement.manufacturerData.slice(2);
            manufacturerData.set(("0000" + company.toString(16)).slice(-4), this.bufferToDataView(buffer));
        }

        const serviceData = new Map();
        if (deviceInfo.advertisement.serviceData) {
            deviceInfo.advertisement.serviceData.forEach(serviceAdvert => {
                serviceData.set(getCanonicalUUID(serviceAdvert.uuid), this.bufferToDataView(serviceAdvert.data));
            });
        }

        return {
            id: deviceID,
            name: deviceInfo.advertisement.localName,
            _serviceUUIDs: serviceUUIDs,
            adData: {
                rssi: deviceInfo.rssi,
                txPower: deviceInfo.advertisement.txPowerLevel,
                serviceData: serviceData,
                manufacturerData: manufacturerData
            }
        };
    }

    public getEnabled(completeFn: (enabled: boolean) => void) {
        function stateCB() {
            completeFn(this.state);
        }

        if (noble.state === "unknown" || noble.state === "poweredOff") {
            // tslint:disable-next-line:no-string-literal
            noble["once"]("stateChange", stateCB.bind(this));
        } else {
            stateCB.call(this);
        }
    }

    public startScan(serviceUUIDs: Array<string>, foundFn: (device: Partial<BluetoothDevice>) => void, completeFn?: () => void, errorFn?: (errorMsg: string) => void): void {

        this.discoverFn = deviceInfo => {
            if (this.validDevice(deviceInfo, serviceUUIDs)) {
                const device = this.deviceToBluetoothDevice(deviceInfo);

                if (!this.deviceHandles[device.id]) {
                    this.deviceHandles[device.id] = deviceInfo;
                    // Only call the found function the first time we find a valid device
                    foundFn(device);
                }
            }
        };

        this.init(() => {
            this.deviceHandles = {};
            function stateCB() {
                if (this.state === true) {
                    // Noble doesn't correctly match short and canonical UUIDs on Linux, so we need to check ourselves
                    // Continually scan to pick up all advertised UUIDs
                    noble.startScanning([], true, this.checkForError(errorFn, completeFn));
                } else {
                    errorFn("adapter not enabled");
                }
            }

            if (noble.state === "unknown" || noble.state === "poweredOff") {
                // tslint:disable-next-line:no-string-literal
                noble["once"]("stateChange", stateCB.bind(this));
            } else {
                stateCB.call(this);
            }
        });
    }

    public stopScan(_errorFn?: (errorMsg: string) => void): void {
        this.discoverFn = null;
        noble.stopScanning();
    }

    public connect(handle: string, connectFn: () => void, disconnectFn: () => void, errorFn?: (errorMsg: string) => void): void {
        const baseDevice = this.deviceHandles[handle];
        baseDevice.removeAllListeners("connect");
        baseDevice.removeAllListeners("disconnect");
        baseDevice.once("connect", connectFn);
        baseDevice.once("disconnect", () => {
            this.serviceHandles = {};
            this.characteristicHandles = {};
            this.descriptorHandles = {};
            this.charNotifies = {};
            disconnectFn();
        });
        baseDevice.connect(this.checkForError(errorFn));
    }

    public disconnect(handle: string, errorFn?: (errorMsg: string) => void): void {
        const baseDevice = this.deviceHandles[handle];
        baseDevice.disconnect(this.checkForError(errorFn));
    }

    public discoverServices(handle: string, serviceUUIDs: Array<string>, completeFn: (services: Array<Partial<BluetoothRemoteGATTService>>) => void, errorFn?: (errorMsg: string) => void): void {
        const baseDevice = this.deviceHandles[handle];
        baseDevice.discoverServices([], this.checkForError(errorFn, services => {
            const discovered = [];
            services.forEach(serviceInfo => {
                const serviceUUID = getCanonicalUUID(serviceInfo.uuid);

                if (serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceUUID) >= 0) {
                    if (!this.serviceHandles[serviceUUID]) this.serviceHandles[serviceUUID] = serviceInfo;

                    discovered.push({
                        uuid: serviceUUID,
                        primary: true
                    });
                }
            });

            completeFn(discovered);
        }));
    }

    public discoverIncludedServices(handle: string, serviceUUIDs: Array<string>, completeFn: (services: Array<Partial<BluetoothRemoteGATTService>>) => void, errorFn?: (errorMsg: string) => void): void {
        const serviceInfo = this.serviceHandles[handle];
        serviceInfo.discoverIncludedServices([], this.checkForError(errorFn, services => {

            const discovered = [];
            services.forEach(service => {
                const serviceUUID = getCanonicalUUID(service.uuid);

                if (serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceUUID) >= 0) {
                    if (!this.serviceHandles[serviceUUID]) this.serviceHandles[serviceUUID] = service;

                    discovered.push({
                        uuid: serviceUUID,
                        primary: false
                    });
                }
            }, this);

            completeFn(discovered);
        }));
    }

    public discoverCharacteristics(handle: string, characteristicUUIDs: Array<string>, completeFn: (characteristics: Array<Partial<BluetoothRemoteGATTCharacteristic>>) => void, errorFn?: (errorMsg: string) => void): void {
        const serviceInfo = this.serviceHandles[handle];
        serviceInfo.discoverCharacteristics([], this.checkForError(errorFn, characteristics => {

            const discovered = [];
            characteristics.forEach(characteristicInfo => {
                const charUUID = getCanonicalUUID(characteristicInfo.uuid);

                if (characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(charUUID) >= 0) {
                    if (!this.characteristicHandles[charUUID]) this.characteristicHandles[charUUID] = characteristicInfo;

                    discovered.push({
                        uuid: charUUID,
                        properties: {
                            broadcast:                  (characteristicInfo.properties.indexOf("broadcast") >= 0),
                            read:                       (characteristicInfo.properties.indexOf("read") >= 0),
                            writeWithoutResponse:       (characteristicInfo.properties.indexOf("writeWithoutResponse") >= 0),
                            write:                      (characteristicInfo.properties.indexOf("write") >= 0),
                            notify:                     (characteristicInfo.properties.indexOf("notify") >= 0),
                            indicate:                   (characteristicInfo.properties.indexOf("indicate") >= 0),
                            authenticatedSignedWrites:  (characteristicInfo.properties.indexOf("authenticatedSignedWrites") >= 0),
                            reliableWrite:              (characteristicInfo.properties.indexOf("reliableWrite") >= 0),
                            writableAuxiliaries:        (characteristicInfo.properties.indexOf("writableAuxiliaries") >= 0)
                        }
                    });

                    characteristicInfo.on("data", (data, isNotification) => {
                        if (isNotification === true && typeof this.charNotifies[charUUID] === "function") {
                            const dataView = this.bufferToDataView(data);
                            this.charNotifies[charUUID](dataView);
                        }
                    });
                }
            }, this);

            completeFn(discovered);
        }));
    }

    public discoverDescriptors(handle: string, descriptorUUIDs: Array<string>, completeFn: (descriptors: Array<Partial<BluetoothRemoteGATTDescriptor>>) => void, errorFn?: (errorMsg: string) => void): void {
        const characteristicInfo = this.characteristicHandles[handle];
        characteristicInfo.discoverDescriptors(this.checkForError(errorFn, descriptors => {

            const discovered = [];
            descriptors.forEach(descriptorInfo => {
                const descUUID = getCanonicalUUID(descriptorInfo.uuid);

                if (descriptorUUIDs.length === 0 || descriptorUUIDs.indexOf(descUUID) >= 0) {
                    const descHandle = characteristicInfo.uuid + "-" + descriptorInfo.uuid;
                    if (!this.descriptorHandles[descHandle]) this.descriptorHandles[descHandle] = descriptorInfo;

                    discovered.push({
                        uuid: descUUID
                    });
                }
            }, this);

            completeFn(discovered);
        }));
    }

    public readCharacteristic(handle: string, completeFn: (value: DataView) => void, errorFn?: (errorMsg: string) => void): void {
        this.characteristicHandles[handle].read(this.checkForError(errorFn, data => {
            const dataView = this.bufferToDataView(data);
            completeFn(dataView);
        }));
    }

    public writeCharacteristic(handle: string, value: DataView, completeFn?: () => void, errorFn?: (errorMsg: string) => void, withoutResponse?: boolean): void {
        const buffer = this.dataViewToBuffer(value);
        const characteristic = this.characteristicHandles[handle];

        if (withoutResponse === undefined) {
            // writeWithoutResponse and authenticatedSignedWrites don't require a response
            withoutResponse = characteristic.properties.indexOf("writeWithoutResponse") >= 0
                           || characteristic.properties.indexOf("authenticatedSignedWrites") >= 0;
        }

        // Add a small delay for writing without response when not on MacOS
        const delay = (this.os !== "darwin" && withoutResponse) ? 25 : null;

        characteristic.write(buffer, withoutResponse, this.checkForError(errorFn, completeFn, delay));
    }

    public enableNotify(handle: string, notifyFn: (value: DataView) => void, completeFn?: () => void, errorFn?: (errorMsg: string) => void): void {
        if (this.charNotifies[handle]) {
            this.charNotifies[handle] = notifyFn;
            return completeFn();
        }
        this.characteristicHandles[handle].once("notify", state => {
            if (state !== true) return errorFn("notify failed to enable");
            this.charNotifies[handle] = notifyFn;
            completeFn();
        });
        this.characteristicHandles[handle].notify(true, this.checkForError(errorFn));
    }

    public disableNotify(handle: string, completeFn?: () => void, errorFn?: (errorMsg: string) => void): void {
        if (!this.charNotifies[handle]) {
            return completeFn();
        }
        this.characteristicHandles[handle].once("notify", state => {
            if (state !== false) return errorFn("notify failed to disable");
            if (this.charNotifies[handle]) delete this.charNotifies[handle];
            completeFn();
        });
        this.characteristicHandles[handle].notify(false, this.checkForError(errorFn));
    }

    public readDescriptor(handle: string, completeFn: (value: DataView) => void, errorFn?: (errorMsg: string) => void): void {
        this.descriptorHandles[handle].readValue(this.checkForError(errorFn, data => {
            const dataView = this.bufferToDataView(data);
            completeFn(dataView);
        }));
    }

    public writeDescriptor(handle: string, value: DataView, completeFn?: () => void, errorFn?: (errorMsg: string) => void): void {
        const buffer = this.dataViewToBuffer(value);
        this.descriptorHandles[handle].writeValue(buffer, this.checkForError(errorFn, completeFn));
    }
}

/**
 * @hidden
 */
export const adapter = new NobleAdapter();
