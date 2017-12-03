"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const noble = require("noble");
class NobleAdapter {
    constructor() {
        this.foundFn = null;
        this.initialised = false;
    }
    init(completeFn) {
        if (this.initialised)
            return completeFn();
        noble.on("discover", this.discover);
        this.initialised = true;
        completeFn();
    }
    checkForError(errorFn, continueFn) {
        return function (error) {
            if (error)
                errorFn(error);
            else if (typeof continueFn === "function") {
                const args = [].slice.call(arguments, 1);
                continueFn.apply(this, args);
            }
        };
    }
    bufferToDataView(buffer) {
        // Buffer to ArrayBuffer
        const arrayBuffer = new Uint8Array(buffer).buffer;
        return new DataView(arrayBuffer);
    }
    dataViewToBuffer(dataView) {
        // DataView to TypedArray
        const typedArray = new Uint8Array(dataView.buffer);
        return new Buffer(typedArray);
    }
    discover(deviceInfo) {
        if (this.foundFn) {
            const deviceID = (deviceInfo.address && deviceInfo.address !== "unknown") ? deviceInfo.address : deviceInfo.id;
            if (!this.deviceHandles[deviceID])
                this.deviceHandles[deviceID] = deviceInfo;
            const serviceUUIDs = [];
            if (deviceInfo.advertisement.serviceUuids) {
                deviceInfo.advertisement.serviceUuids.forEach(serviceUUID => {
                    serviceUUIDs.push(helpers_1.getCanonicalUUID(serviceUUID));
                });
            }
            const manufacturerData = new Map();
            if (deviceInfo.advertisement.manufacturerData) {
                // First 2 bytes are 16-bit company identifier
                let company = deviceInfo.advertisement.manufacturerData.readUInt16LE(0);
                company = ("0000" + company.toString(16)).slice(-4);
                // Remove company ID
                const buffer = deviceInfo.advertisement.manufacturerData.slice(2);
                manufacturerData[company] = this.bufferToDataView(buffer);
            }
            const serviceData = new Map();
            if (deviceInfo.advertisement.serviceData) {
                deviceInfo.advertisement.serviceData.forEach(serviceAdvert => {
                    serviceData[helpers_1.getCanonicalUUID(serviceAdvert.uuid)] = this.bufferToDataView(serviceAdvert.data);
                });
            }
            this.foundFn({
                _handle: deviceID,
                id: deviceID,
                name: deviceInfo.advertisement.localName,
                uuids: serviceUUIDs
                // adData: {
                //    manufacturerData: manufacturerData,
                //    serviceData: serviceData,
                //    txPower: deviceInfo.advertisement.txPowerLevel,
                //    rssi: deviceInfo.rssi
                // }
            });
        }
    }
    startScan(serviceUUIDs, foundFn, completeFn, errorFn) {
        if (serviceUUIDs.length === 0) {
            this.foundFn = foundFn;
        }
        else {
            this.foundFn = device => {
                serviceUUIDs.forEach(serviceUUID => {
                    if (device.uuids.indexOf(serviceUUID) >= 0) {
                        foundFn(device);
                        return;
                    }
                });
            };
        }
        this.init(() => {
            this.deviceHandles = {};
            function stateCB(state) {
                if (state === "poweredOn") {
                    noble.startScanning([], false, this.checkForError(errorFn, completeFn));
                }
                else {
                    errorFn("adapter not enabled");
                }
            }
            // tslint:disable-next-line:no-string-literal
            if (noble.state === "unknown")
                noble["once"]("stateChange", stateCB.bind(this));
            else
                stateCB(noble.state);
        });
    }
    stopScan(_errorFn) {
        this.foundFn = null;
        noble.stopScanning();
    }
    connect(handle, connectFn, disconnectFn, errorFn) {
        const baseDevice = this.deviceHandles[handle];
        baseDevice.once("connect", connectFn);
        baseDevice.once("disconnect", function () {
            this.serviceHandles = {};
            this.characteristicHandles = {};
            this.descriptorHandles = {};
            this.charNotifies = {};
            disconnectFn();
        }.bind(this));
        baseDevice.connect(this.checkForError(errorFn));
    }
    disconnect(handle, errorFn) {
        this.deviceHandles[handle].disconnect(this.checkForError(errorFn));
    }
    discoverServices(handle, serviceUUIDs, completeFn, errorFn) {
        const baseDevice = this.deviceHandles[handle];
        baseDevice.discoverServices([], this.checkForError(errorFn, function (services) {
            const discovered = [];
            services.forEach(function (serviceInfo) {
                const serviceUUID = helpers_1.getCanonicalUUID(serviceInfo.uuid);
                if (serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceUUID) >= 0) {
                    if (!this.serviceHandles[serviceUUID])
                        this.serviceHandles[serviceUUID] = serviceInfo;
                    discovered.push({
                        _handle: serviceUUID,
                        uuid: serviceUUID,
                        primary: true
                    });
                }
            }, this);
            completeFn(discovered);
        }.bind(this)));
    }
    discoverIncludedServices(handle, serviceUUIDs, completeFn, errorFn) {
        const serviceInfo = this.serviceHandles[handle];
        serviceInfo.discoverIncludedServices([], this.checkForError(errorFn, function (services) {
            const discovered = [];
            services.forEach(service => {
                const serviceUUID = helpers_1.getCanonicalUUID(service.uuid);
                if (serviceUUIDs.length === 0 || serviceUUIDs.indexOf(serviceUUID) >= 0) {
                    if (!this.serviceHandles[serviceUUID])
                        this.serviceHandles[serviceUUID] = service;
                    discovered.push({
                        _handle: serviceUUID,
                        uuid: serviceUUID,
                        primary: false
                    });
                }
            }, this);
            completeFn(discovered);
        }.bind(this)));
    }
    discoverCharacteristics(handle, characteristicUUIDs, completeFn, errorFn) {
        const serviceInfo = this.serviceHandles[handle];
        serviceInfo.discoverCharacteristics([], this.checkForError(errorFn, function (characteristics) {
            const discovered = [];
            characteristics.forEach(function (characteristicInfo) {
                const charUUID = helpers_1.getCanonicalUUID(characteristicInfo.uuid);
                if (characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(charUUID) >= 0) {
                    if (!this.characteristicHandles[charUUID])
                        this.characteristicHandles[charUUID] = characteristicInfo;
                    discovered.push({
                        _handle: charUUID,
                        uuid: charUUID,
                        properties: {
                            broadcast: (characteristicInfo.properties.indexOf("broadcast") >= 0),
                            read: (characteristicInfo.properties.indexOf("read") >= 0),
                            writeWithoutResponse: (characteristicInfo.properties.indexOf("writeWithoutResponse") >= 0),
                            write: (characteristicInfo.properties.indexOf("write") >= 0),
                            notify: (characteristicInfo.properties.indexOf("notify") >= 0),
                            indicate: (characteristicInfo.properties.indexOf("indicate") >= 0),
                            authenticatedSignedWrites: (characteristicInfo.properties.indexOf("authenticatedSignedWrites") >= 0),
                            reliableWrite: (characteristicInfo.properties.indexOf("reliableWrite") >= 0),
                            writableAuxiliaries: (characteristicInfo.properties.indexOf("writableAuxiliaries") >= 0)
                        }
                    });
                    characteristicInfo.on("data", function (data, isNotification) {
                        if (isNotification === true && typeof this.charNotifies[charUUID] === "function") {
                            const dataView = this.bufferToDataView(data);
                            this.charNotifies[charUUID](dataView);
                        }
                    }.bind(this));
                }
            }, this);
            completeFn(discovered);
        }.bind(this)));
    }
    discoverDescriptors(handle, descriptorUUIDs, completeFn, errorFn) {
        const characteristicInfo = this.characteristicHandles[handle];
        characteristicInfo.discoverDescriptors(this.checkForError(errorFn, function (descriptors) {
            const discovered = [];
            descriptors.forEach(function (descriptorInfo) {
                const descUUID = helpers_1.getCanonicalUUID(descriptorInfo.uuid);
                if (descriptorUUIDs.length === 0 || descriptorUUIDs.indexOf(descUUID) >= 0) {
                    const descHandle = characteristicInfo.uuid + "-" + descriptorInfo.uuid;
                    if (!this.descriptorHandles[descHandle])
                        this.descriptorHandles[descHandle] = descriptorInfo;
                    discovered.push({
                        _handle: descHandle,
                        uuid: descUUID
                    });
                }
            }, this);
            completeFn(discovered);
        }.bind(this)));
    }
    readCharacteristic(handle, completeFn, errorFn) {
        this.characteristicHandles[handle].read(this.checkForError(errorFn, data => {
            const dataView = this.bufferToDataView(data);
            completeFn(dataView);
        }));
    }
    writeCharacteristic(handle, value, completeFn, errorFn) {
        const buffer = this.dataViewToBuffer(value);
        this.characteristicHandles[handle].write(buffer, true, this.checkForError(errorFn, completeFn));
    }
    enableNotify(handle, notifyFn, completeFn, errorFn) {
        if (this.charNotifies[handle]) {
            this.charNotifies[handle] = notifyFn;
            return completeFn();
        }
        this.characteristicHandles[handle].once("notify", state => {
            if (state !== true)
                return errorFn("notify failed to enable");
            this.charNotifies[handle] = notifyFn;
            completeFn();
        });
        this.characteristicHandles[handle].notify(true, this.checkForError(errorFn));
    }
    disableNotify(handle, completeFn, errorFn) {
        if (!this.charNotifies[handle]) {
            return completeFn();
        }
        this.characteristicHandles[handle].once("notify", state => {
            if (state !== false)
                return errorFn("notify failed to disable");
            if (this.charNotifies[handle])
                delete this.charNotifies[handle];
            completeFn();
        });
        this.characteristicHandles[handle].notify(false, this.checkForError(errorFn));
    }
    readDescriptor(handle, completeFn, errorFn) {
        this.descriptorHandles[handle].readValue(this.checkForError(errorFn, data => {
            const dataView = this.bufferToDataView(data);
            completeFn(dataView);
        }));
    }
    writeDescriptor(handle, value, completeFn, errorFn) {
        const buffer = this.dataViewToBuffer(value);
        this.descriptorHandles[handle].writeValue(buffer, this.checkForError(errorFn, completeFn));
    }
}
exports.NobleAdapter = NobleAdapter;

//# sourceMappingURL=adapter.js.map
