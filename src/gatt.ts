/*
 * Node Web Bluetooth
 * Copyright (c) 2019 Rob Moran
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
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {
    getCharacteristicUUID,
    getServiceUUID,
    isView,
} from "./common.js";
import {
    BluetoothRemoteGATTCharacteristicEventMap,
    BluetoothRemoteGATTCharacteristic,
} from "./characteristic.js";
import type { Bluetooth } from "./bluetooth.js";
import type { Bindings, Peripheral, Service } from "./bindings.js";
import type { CustomEventListener } from "./common.js";
import type {
    BluetoothCharacteristicUUID,
    BluetoothServiceUUID,
    BluetoothManufacturerData,
    BluetoothServiceData,
} from "./interfaces.js";

/** Options for watching advertisements. */
export interface WatchAdvertisementsOptions {
    signal?: AbortSignal;
}

/** BLE advertisement received. */
export interface BluetoothAdvertisingEvent extends Event {
    readonly device: BluetoothDevice;
    readonly uuids: BluetoothServiceUUID[];
    readonly manufacturerData: BluetoothManufacturerData;
    readonly serviceData: BluetoothServiceData;
    readonly name?: string | undefined;
    readonly appearance?: number | undefined;
    readonly rssi?: number | undefined;
    readonly txPower?: number | undefined;
}

/** @hidden Events for {@link BluetoothRemoteGATTService} */
export interface BluetoothRemoteGATTServiceEventMap extends BluetoothRemoteGATTCharacteristicEventMap {
    /** Service added event. */
    serviceadded: Event;
    /** Service changed event. */
    servicechanged: Event;
    /** Service removed event. */
    serviceremoved: Event;
}

/** @hidden Events for {@link BluetoothDevice} */
export interface BluetoothDeviceEventMap extends BluetoothRemoteGATTServiceEventMap {
    advertisementreceived: BluetoothAdvertisingEvent;
    gattserverdisconnected: Event;
}

/** @hidden Type-safe events for {@link BluetoothRemoteGATTService}. */
export interface BluetoothRemoteGATTService extends EventTarget {
    /** @hidden */
    addEventListener<K extends keyof BluetoothRemoteGATTServiceEventMap>(
        type: K,
        listener: CustomEventListener<BluetoothRemoteGATTService, BluetoothRemoteGATTServiceEventMap[K]>,
        options?: boolean | AddEventListenerOptions,
    ): void;
    /** @hidden */
    addEventListener(
        type: string,
        listener: CustomEventListener<BluetoothRemoteGATTService, Event>,
        options?: boolean | AddEventListenerOptions,
    ): void;
    /** @hidden */
    removeEventListener<K extends keyof BluetoothRemoteGATTServiceEventMap>(
        type: K,
        listener: CustomEventListener<BluetoothRemoteGATTService, BluetoothRemoteGATTServiceEventMap[K]>,
        options?: boolean | EventListenerOptions,
    ): void;
    /** @hidden */
    removeEventListener(
        type: string,
        listener: CustomEventListener<BluetoothRemoteGATTService, Event>,
        options?: boolean | EventListenerOptions,
    ): void;
}

/** @hidden Type-safe events for {@link BluetoothDevice}. */
export interface BluetoothDevice extends EventTarget {
    /** @hidden */
    addEventListener<K extends keyof BluetoothDeviceEventMap>(
        type: K,
        listener: CustomEventListener<BluetoothDevice, BluetoothDeviceEventMap[K]>,
        options?: boolean | AddEventListenerOptions,
    ): void;
    /** @hidden */
    addEventListener(
        type: string,
        listener: CustomEventListener<BluetoothDevice, Event>,
        options?: boolean | AddEventListenerOptions,
    ): void;
    /** @hidden */
    removeEventListener<K extends keyof BluetoothDeviceEventMap>(
        type: K,
        listener: CustomEventListener<BluetoothDevice, BluetoothDeviceEventMap[K]>,
        options?: boolean | EventListenerOptions,
    ): void;
    /** @hidden */
    removeEventListener(
        type: string,
        listener: CustomEventListener<BluetoothDevice, Event>,
        options?: boolean | EventListenerOptions,
    ): void;
}

/**
 * A GATT Descriptor containing more information about a characteristic's value.
 *
 * See also: {@link https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTDescriptor}
 */
export class BluetoothRemoteGATTDescriptor extends EventTarget {
    private readonly _service: BluetoothRemoteGATTService;
    private readonly _peripheral: Peripheral;
    private readonly _char: BluetoothRemoteGATTCharacteristic;
    private readonly _uuid: string;
    private readonly _bindings: Bindings;
    private _value?: DataView;

    /** The {@link BluetoothRemoteGATTService} this descriptor belongs to. */
    get service(): BluetoothRemoteGATTService {
        return this._service;
    }

    /** The UUID of this descriptor. */
    get uuid(): string {
        return this._uuid;
    }

    /** The {@link BluetoothRemoteGATTCharacteristic} this descriptor belongs to. */
    get characteristic(): BluetoothRemoteGATTCharacteristic {
        return this._char;
    }

    /** The value of the descriptor. */
    get value(): DataView {
        return this._value!;
    }

    /** @private */
    constructor(
        bindings: Bindings,
        peripheral: Peripheral,
        service: BluetoothRemoteGATTService,
        char: BluetoothRemoteGATTCharacteristic,
        uuid: string,
    ) {
        super();
        this._bindings = bindings;
        this._peripheral = peripheral;
        this._char = char;
        this._service = service;
        this._uuid = uuid;
        this._value = undefined;
    }

    /** Resolves to a DataView containing a copy of the `value` property. */
    readValue(): Promise<DataView> {
        if (!this.characteristic.service.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        }
        const data = this._bindings.simpleble_peripheral_read_descriptor(
            this._peripheral,
            this.service.uuid,
            this._char.uuid,
            this._uuid,
        );
        if (!data) {
            throw new DOMException("Descriptor is no longer valid", "InvalidStateError");
        }
        const view = new DataView(data);
        this._value = view;
        return Promise.resolve(view);
    }

    /** Updates the value of a descriptor. */
    writeValue(value: ArrayBuffer | ArrayBufferView): Promise<void> {
        const buffer = isView(value) ? value.buffer : value;
        const data = new Uint8Array(buffer);
        const ret = this._bindings.simpleble_peripheral_write_descriptor(
            this._peripheral,
            this.service.uuid,
            this._char.uuid,
            this._uuid,
            data,
        );
        if (!ret) {
            throw new DOMException("Descriptor is no longer valid", "InvalidStateError");
        }

        const view = new DataView(buffer);
        this._value = view;
        return Promise.resolve();
    }
}

/**
 * A service provided by a GATT server.
 *
 * See also: {@link https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTService}
 *
 * Events:
 * - __`characteristicvaluechanged`__
 * - __`serviceadded`__
 * - __`servicechanged`__
 * - __`serviceremoved`__
 */
export class BluetoothRemoteGATTService extends EventTarget {
    private readonly _bindings: Bindings;
    private readonly _peripheral: Peripheral;
    private readonly _service: Service;
    private readonly _device: BluetoothDevice;
    private readonly _uuid: string;
    private _chars: BluetoothRemoteGATTCharacteristic[];
    private _services: BluetoothRemoteGATTService[];
    private _oncharacteristicvaluechanged?: EventListenerOrEventListenerObject;
    private _onserviceadded?: EventListenerOrEventListenerObject;
    private _onservicechanged?: EventListenerOrEventListenerObject;
    private _onserviceremoved?: EventListenerOrEventListenerObject;

    /** @hidden */
    constructor(
        bindings: Bindings,
        peripheral: Peripheral,
        device: BluetoothDevice,
        service: Service,
    ) {
        super();
        this._bindings = bindings;
        this._peripheral = peripheral;
        this._service = service;
        this._device = device;
        this._uuid = service.uuid;
        this._chars = [];
        this._services = [];

        this.dispatchEvent(new Event('serviceadded'));
        this.device.dispatchEvent(new Event('serviceadded'));
        this.device.bluetooth.dispatchEvent(new Event('serviceadded'));
    }

    /** The UUID of this service. */
    get uuid(): string {
        return this._uuid;
    }

    /** The {@link BluetoothDevice} this service belongs to. */
    get device(): BluetoothDevice {
        return this._device;
    }

    /** Indicates if this is a primary or secondary service. */
    get isPrimary(): boolean {
        return true;
    }

    /** Returns the characteristic for a given UUID. */
    async getCharacteristic(
        uuid: BluetoothCharacteristicUUID,
    ): Promise<BluetoothRemoteGATTCharacteristic> {
        if (!this.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        } else if (!uuid) {
            throw new TypeError("No characteristic specified");
        }
        const chars = await this.getCharacteristics(uuid);
        if (chars.length === 0) {
            throw new DOMException("Characteristic not found", "NotFoundError");
        }
        return Promise.resolve(chars[0]);
    }

    /** Returns a list of characteristics this service contains. */
    getCharacteristics(
        uuid?: BluetoothCharacteristicUUID,
    ): Promise<BluetoothRemoteGATTCharacteristic[]> {
        if (!this.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        }
        for (const char of this._service.characteristics) {
            const characteristic = new BluetoothRemoteGATTCharacteristic(
                this._bindings,
                this._peripheral,
                this,
                char,
            );
            this._chars.push(characteristic);
        }
        if (!uuid) {
            return Promise.resolve(this._chars);
        }

        const charUuid = getCharacteristicUUID(uuid);

        const filtered = this._chars.filter((char) => char.uuid === charUuid);
        if (filtered.length !== 1) {
            throw new DOMException("Characteristics not found", "NotFoundError");
        }

        return Promise.resolve(filtered);
    }

    /**
     * Gets a single service included in the service
     * @param service service UUID
     * @returns Promise containing the service
     */
    async getIncludedService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService> {
        if (!this.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        } else if (!service) {
            throw new TypeError('No service specified');
        }

        const services = await this.getIncludedServices(service);
        if (services.length !== 1) {
            throw new DOMException("Service not found", "NotFoundError");
        }

        return services[0];
    }

    /**
     * Gets a list of services included in the service
     * @param service service UUID
     * @returns Promise containing an array of services
     */
    public async getIncludedServices(uuid?: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService[]> {
        if (!this.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        }

        if (this._services.length < 1) {
            const count = this._bindings.simpleble_peripheral_services_count(this._peripheral);
            for (let i = 0; i < count; i++) {
                const handle = this._bindings.simpleble_peripheral_services_get(this._peripheral, i);
                const service = new BluetoothRemoteGATTService(
                    this._bindings,
                    this._peripheral,
                    this._device,
                    handle,
                );
                this._services.push(service)
            }
        }

        if (!uuid) {
            return Promise.resolve(this._services);
        }

        const filtered = this._services.filter((service) => service.uuid === getServiceUUID(uuid));
        if (filtered.length !== 1) {
            throw new DOMException("Services not found", "NotFoundError");
        }

        return filtered;
    }

    /** A listener for the `characteristicvaluechanged` event. */
    set oncharacteristicvaluechanged(fn: EventListenerOrEventListenerObject) {
        if (this._oncharacteristicvaluechanged) {
            this.removeEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
        }
        this._oncharacteristicvaluechanged = fn;
        this.addEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
    }

    /** A listener for the `serviceadded` event. */
    set onserviceadded(fn: EventListenerOrEventListenerObject) {
        if (this._onserviceadded) {
            this.removeEventListener('serviceadded', this._onserviceadded);
        }
        this._onserviceadded = fn;
        this.addEventListener('serviceadded', this._onserviceadded);
    }

    /** A listener for the `servicechanged` event. */
    set onservicechanged(fn: EventListenerOrEventListenerObject) {
        if (this._onservicechanged) {
            this.removeEventListener('servicechanged', this._onservicechanged);
        }
        this._onservicechanged = fn;
        this.addEventListener('servicechanged', this._onservicechanged);
    }

    /** A listener for the `serviceremoved` event. */
    set onserviceremoved(fn: EventListenerOrEventListenerObject) {
        if (this._onserviceremoved) {
            this.removeEventListener('serviceremoved', this._onserviceremoved);
        }
        this._onserviceremoved = fn;
        this.addEventListener('serviceremoved', this._onserviceremoved);
    }
}

/**
 * A GATT server running on a remote device.
 *
 * See also: {@link https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTServer}
 */
export class BluetoothRemoteGATTServer extends EventTarget {
    private readonly _bindings: Bindings;
    private readonly _device: BluetoothDevice;
    private _peripheral: Peripheral;
    private _connected: boolean;
    private _services: BluetoothRemoteGATTService[];

    /** @hidden */
    constructor(
        bindings: Bindings,
        peripheral: Peripheral,
        device: BluetoothDevice,
    ) {
        super();
        this._bindings = bindings;
        this._peripheral = peripheral;
        this._device = device;
        this._connected = false;
        this._services = [];
    }

    /** Whether the gatt server is connected. */
    get connected(): boolean {
        return this._connected;
    }

    /** The {@link BluetoothDevice} running this server. */
    get device(): BluetoothDevice {
        return this._device;
    }

    /**
     * Connect the gatt server.
     * @returns Promise containing the gatt server.
     */
    connect(): Promise<BluetoothRemoteGATTServer> {
        if (this.connected) {
            throw new DOMException('Connection already in progress', "NetworkError");
        }
        this._bindings.simpleble_peripheral_set_callback_on_connected(this._peripheral, () => {
            this._connected = true;
        });
        const ret = this._bindings.simpleble_peripheral_connect(this._peripheral);
        if (!ret) {
            throw new DOMException("Connection failed", "NetworkError");
        }
        this._services = [];
        this._connected = true;
        this.device.dispatchEvent(new Event('gattserverdisconnected'));
        this.device.bluetooth.dispatchEvent(new Event('gattserverdisconnected'));
        this._bindings.simpleble_peripheral_set_callback_on_disconnected(this._peripheral, () => {
            this._connected = false;
        });
        return Promise.resolve(this);
    }

    /** Disconnect from this device. */
    disconnect(): void {
        this._bindings.simpleble_peripheral_disconnect(this._peripheral);
        this._connected = false;
    }

    /**
     * Returns a single primary service for a UUID.
     * @param uuid Service UUID.
     * @returns Promise containing the service.
     */
    async getPrimaryService(uuid: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService> {
        if (!this.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        } else if (!uuid) {
            throw new TypeError("No service specified");
        }
        const services = await this.getPrimaryServices(uuid);
        if (services.length === 0) {
            throw new DOMException("Service not found", "NotFoundError");
        }
        return Promise.resolve(services[0]);
    }

    /**
     * Returns a list of primary services.
     * @param uuid Service UUID.
     * @returns Promise containing a list of services.
     */
    getPrimaryServices(uuid?: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService[]> {
        if (!this.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        }

        if (this._services.length < 1) {
            const count = this._bindings.simpleble_peripheral_services_count(this._peripheral);
            for (let i = 0; i < count; i++) {
                const handle = this._bindings.simpleble_peripheral_services_get(this._peripheral, i);
                const service = new BluetoothRemoteGATTService(
                    this._bindings,
                    this._peripheral,
                    this._device,
                    handle,
                );
                this._services.push(service)
            }
        }

        if (!uuid) {
            return Promise.resolve(this._services);
        }

        const filtered = this._services.filter((service) => service.uuid === getServiceUUID(uuid));
        if (filtered.length !== 1) {
            throw new DOMException("Services not found", "NotFoundError");
        }

        return Promise.resolve(filtered);
    }
}

/**
 * Represents a single Bluetooth device.
 *
 * See also: {@link https://developer.mozilla.org/en-US/docs/Web/API/BluetoothDevice}
 *
 * Events:
 * - __`advertisementreceived`__
 * - __`characteristicvaluechanged`__
 * - __`gattserverdisconnected`__
 * - __`serviceadded`__
 * - __`servicechanged`__
 * - __`serviceremoved`__
 */
export class BluetoothDevice extends EventTarget {
    private _id: string;
    private _name: string;
    private _gatt: BluetoothRemoteGATTServer;
    private _manufacturerData?: BluetoothManufacturerData;
    private _serviceData?: BluetoothServiceData;
    private _oncharacteristicvaluechanged?: EventListenerOrEventListenerObject;
    private _onserviceadded?: EventListenerOrEventListenerObject;
    private _onservicechanged?: EventListenerOrEventListenerObject;
    private _onserviceremoved?: EventListenerOrEventListenerObject;
    private _ongattserverdisconnected?: EventListenerOrEventListenerObject;
    private _onadvertisementreceived?: EventListenerOrEventListenerObject;

    /** @hidden The Bluetooth instance this device belongs to. */
    readonly bluetooth: Bluetooth;

    /** The unique identifier of the device. */
    get id(): string {
        return this._id
    }
    /** The name of the device. */
    get name(): string {
        return this._name;
    }

    /** The manufacturer-specific data of the device. */
    get manufacturerData(): BluetoothManufacturerData | undefined {
        return this._manufacturerData;
    }

    /** The service-specific data of the device. */
    get serviceData(): BluetoothServiceData | undefined {
        return this._serviceData;
    }

    /** The gatt server of the device. */
    get gatt(): BluetoothRemoteGATTServer {
        return this._gatt;
    }

    /** Whether advertisements are being watched (not implemented). */
    get watchingAdvertisements() {
        return false;
    }

    /** @hidden */
    constructor(
        bindings: Bindings,
        peripheral: Peripheral,
        id: string,
        name: string,
        bluetooth: Bluetooth,
        manufacturerData: BluetoothManufacturerData,
    ) {
        super();
        this._id = id;
        this._name = name;
        this._manufacturerData = manufacturerData;
        this.bluetooth = bluetooth;
        this._gatt = new BluetoothRemoteGATTServer(
            bindings,
            peripheral,
            this,
        );
    }

    /** A listener for the `characteristicvaluechanged` event. */
    set oncharacteristicvaluechanged(fn: EventListenerOrEventListenerObject) {
        if (this._oncharacteristicvaluechanged) {
            this.removeEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
        }
        this._oncharacteristicvaluechanged = fn;
        this.addEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
    }

    /** A listener for the `serviceadded` event. */
    set onserviceadded(fn: EventListenerOrEventListenerObject) {
        if (this._onserviceadded) {
            this.removeEventListener('serviceadded', this._onserviceadded);
        }
        this._onserviceadded = fn;
        this.addEventListener('serviceadded', this._onserviceadded);
    }

    /** A listener for the `servicechanged` event. */
    set onservicechanged(fn: EventListenerOrEventListenerObject) {
        if (this._onservicechanged) {
            this.removeEventListener('servicechanged', this._onservicechanged);
        }
        this._onservicechanged = fn;
        this.addEventListener('servicechanged', this._onservicechanged);
    }

    /** A listener for the `serviceremoved` event. */
    set onserviceremoved(fn: EventListenerOrEventListenerObject) {
        if (this._onserviceremoved) {
            this.removeEventListener('serviceremoved', this._onserviceremoved);
        }
        this._onserviceremoved = fn;
        this.addEventListener('serviceremoved', this._onserviceremoved);
    }

    /** A listener for the `gattserverdisconnected` event. */
    set ongattserverdisconnected(fn: EventListenerOrEventListenerObject) {
        if (this._ongattserverdisconnected) {
            this.removeEventListener('gattserverdisconnected', this._ongattserverdisconnected);
        }
        this._ongattserverdisconnected = fn;
        this.addEventListener('gattserverdisconnected', this._ongattserverdisconnected);
    }

    /** A listener for the `advertisementreceived` event. */
    set onadvertisementreceived(fn: EventListenerOrEventListenerObject) {
        if (this._onadvertisementreceived) {
            this.removeEventListener('advertisementreceived', this._onadvertisementreceived);
        }
        this._onadvertisementreceived = fn;
        this.addEventListener('advertisementreceived', this._onadvertisementreceived);
    }

    /** This unstable specification is not implemented yet. */
    watchAdvertisements(_options?: WatchAdvertisementsOptions): Promise<void> {
        throw new DOMException("watchAdvertisements is not implemented yet", "NotSupportedError");
    }

    /** This unstable specification is not implemented yet. */
    unwatchAdvertisements(): Promise<void> {
        throw new DOMException("unwatchAdvertisements is not implemented yet", "NotSupportedError");
    }

    /** This unstable specification is not implemented yet. */
    forget(): Promise<void> {
        throw new DOMException("forget is not implemented yet", "NotSupportedError");
    }
}
