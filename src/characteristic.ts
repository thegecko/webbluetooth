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

import { getDescriptorUUID, isView } from "./common.js";
import {
    BluetoothRemoteGATTDescriptor,
    BluetoothRemoteGATTService,
} from "./gatt.js";
import type { Characteristic, Peripheral } from "./bindings.js";
import type { CustomEventListener } from "./common.js";
import type {
    BluetoothCharacteristicProperties,
    BluetoothDescriptorUUID,
} from "./interfaces.js";

/** @hidden Events for {@link BluetoothRemoteGATTCharacteristic} */
export interface BluetoothRemoteGATTCharacteristicEventMap {
    characteristicvaluechanged: Event;
}

/** @hidden Type-safe events for {@link BluetoothRemoteGATTCharacteristic}. */
export interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    /** @hidden */
    addEventListener<K extends keyof BluetoothRemoteGATTCharacteristicEventMap>(
        type: K,
        listener: CustomEventListener<BluetoothRemoteGATTCharacteristic, BluetoothRemoteGATTCharacteristicEventMap[K]>,
        options?: boolean | AddEventListenerOptions,
    ): void;
    /** @hidden */
    addEventListener(
        type: string,
        listener: CustomEventListener<BluetoothRemoteGATTCharacteristic, Event>,
        options?: boolean | AddEventListenerOptions,
    ): void;
    /** @hidden */
    removeEventListener<K extends keyof BluetoothRemoteGATTCharacteristicEventMap>(
        type: K,
        listener: CustomEventListener<BluetoothRemoteGATTCharacteristic, BluetoothRemoteGATTCharacteristicEventMap[K]>,
        options?: boolean | EventListenerOptions,
    ): void;
    /** @hidden */
    removeEventListener(
        type: string,
        listener: CustomEventListener<BluetoothRemoteGATTCharacteristic, Event>,
        options?: boolean | EventListenerOptions,
    ): void;
}

/**
 * A basic data element about a GATT service.
 *
 * See also: {@link https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTCharacteristic}
 */
export class BluetoothRemoteGATTCharacteristic extends EventTarget {
    private readonly _peripheral: Peripheral;
    private readonly _characteristic: Characteristic;
    private readonly _service: BluetoothRemoteGATTService;
    private readonly _uuid: string;
    private _value?: DataView;
    private _oncharacteristicvaluechanged?: EventListenerOrEventListenerObject;
    private _descriptors: BluetoothRemoteGATTDescriptor[];

    /** @hidden */
    constructor(
        peripheral: Peripheral,
        service: BluetoothRemoteGATTService,
        characteristic: Characteristic,
    ) {
        super();
        this._peripheral = peripheral;
        this._service = service;
        this._characteristic = characteristic;
        this._value = undefined;
        this._uuid = characteristic.uuid;
        this._descriptors = [];

        this.service.addEventListener("serviceadded", (_e) => { });
    }

    /** The {@link BluetoothRemoteGATTService} this characteristic belongs to. */
    get service(): BluetoothRemoteGATTService {
        return this._service;
    }

    /** Read-only properties of this characteristic. */
    get properties(): BluetoothCharacteristicProperties {
        return {
            authenticatedSignedWrites: false,
            broadcast: false,
            indicate: this._characteristic.canIndicate,
            notify: this._characteristic.canNotify,
            read: this._characteristic.canRead,
            reliableWrite: this._characteristic.canWriteCommand,
            write: this._characteristic.canWriteCommand,
            writeWithoutResponse: this._characteristic.canWriteRequest,
            writableAuxiliaries: false,
        };
    }

    /** The UUID of this characteristic. */
    get uuid(): string {
        return this._uuid;
    }

    /**
     * The current value of this characteristic.
     *
     * This value gets updated when the value of the characteristic is read or
     * updated via a notification or indication.
     */
    get value(): DataView | undefined {
        return this._value;
    }

    /** Update the value and emit events. */
    private _setValue(value?: DataView, emit?: boolean): void {
        this._value = value;
        if (emit) {
            this.dispatchEvent(new Event("characteristicvaluechanged"));
            this.service.dispatchEvent(new Event('characteristicvaluechanged'));
            this.service.device.dispatchEvent(new Event('characteristicvaluechanged'));
            this.service.device.bluetooth.dispatchEvent(new Event('characteristicvaluechanged'));
        }
    }

    /** Resolves a single descriptor. */
    async getDescriptor(uuid: BluetoothDescriptorUUID): Promise<BluetoothRemoteGATTDescriptor> {
        if (!this.service.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        } else if (!uuid) {
            throw new TypeError("No descriptor specified")
        }

        const descriptors = await this.getDescriptors(uuid);
        if (!descriptors.length) {
            throw new DOMException("Descriptor not found", "NotFoundError");
        }
        return descriptors[0];
    }

    /** Resolves multiple descriptors. */
    getDescriptors(uuid?: BluetoothDescriptorUUID): Promise<BluetoothRemoteGATTDescriptor[]> {
        if (!this.service.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        }
        if (!this._descriptors) {
            const descriptors: BluetoothRemoteGATTDescriptor[] = [];
            for (const descriptorUuid of this._characteristic.descriptors) {
                const descriptor = new BluetoothRemoteGATTDescriptor(
                    this._peripheral,
                    this._service,
                    this,
                    descriptorUuid,
                );
                descriptors.push(descriptor);
            }
            this._descriptors = descriptors;
        }

        if (!uuid) {
            return Promise.resolve(this._descriptors);
        }

        const filtered = this._descriptors.filter((descriptor) => descriptor.uuid === getDescriptorUUID(uuid));
        if (filtered.length !== 1) {
            throw new DOMException("Descriptors not found", "NotFoundError");
        }

        return Promise.resolve(filtered);
    }

    /** Returns the current value */
    readValue(): Promise<DataView> {
        if (!this.service.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        }
        const buffer = this._peripheral.read(
            this.service.uuid,
            this.uuid,
        );
        if (!buffer) {
            throw new DOMException("Characteristic is no longer valid", "InvalidStateError");
        }
        const view = new DataView(buffer);
        this._setValue(view, true);
        return Promise.resolve(view);
    }

    /**
     * Write a value.
     *
     * __NOTE__: This is an alias for {@link BluetoothRemoteGATTCharacteristic#writeValueWithResponse}
     * @param value The value to write.
     */
    writeValue(value: BufferSource): Promise<void> {
        return this.writeValueWithResponse(value);
    }

    /** Write a value, requiring a response to be successful. */
    writeValueWithResponse(value: BufferSource): Promise<void> {
        const buffer = isView(value) ? value.buffer : value;
        const data = new Uint8Array(buffer);
        if (!this.service.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        }
        if (data.byteLength > 512) {
            throw new DOMException("Value can't exceed 512 bytes", "InvalidModificationError");
        }
        const ret = this._peripheral.writeCommand(
            this.service.uuid,
            this.uuid,
            data,
        );
        if (!ret) {
            throw new DOMException("Error while writing a command to a characteristic", "NotSupportedError");
        }
        const view = new DataView(buffer);
        this._setValue(view, false);
        return Promise.resolve();
    }

    /** Writes a value, with or without a response. */
    writeValueWithoutResponse(value: BufferSource): Promise<void> {
        const buffer = isView(value) ? value.buffer : value;
        const data = new Uint8Array(buffer);
        if (!this.service.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        }
        if (data.byteLength > 512) {
            throw new DOMException("Value can't exceed 512 bytes", "InvalidModificationError");
        }
        const ret = this._peripheral.writeRequest(
            this.service.uuid,
            this.uuid,
            data,
        );
        if (!ret) {
            throw new DOMException("Error while writing a request to a characteristic", "NotSupportedError");
        }
        const view = new DataView(buffer);
        this._setValue(view, false);
        return Promise.resolve();
    }

    /** Begin subscribing to value updates. */
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic> {
        if (!this.service.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        }
        this._peripheral.notify(
            this.service.uuid,
            this.uuid,
            (data: Uint8Array) => {
                const arrayBuffer = data.buffer;
                const view = new DataView(arrayBuffer);
                this._setValue(view, true);
                this.dispatchEvent(new Event("notify"));
            },
        );
        return Promise.resolve(this);
    }

    /** Stop listening for value updates. */
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic> {
        if (!this.service.device.gatt.connected) {
            throw new DOMException("Device not connected", "NetworkError");
        }
        this._peripheral.unsubscribe(
            this._service.uuid,
            this.uuid,
        );
        return Promise.resolve(this);
    }

    /** A callback invoked when a characteristic value is changed. */
    set oncharacteristicvaluechanged(fn: EventListenerOrEventListenerObject) {
        if (this._oncharacteristicvaluechanged) {
            this.removeEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
        }
        this._oncharacteristicvaluechanged = fn;
        this.addEventListener('characteristicvaluechanged', this._oncharacteristicvaluechanged);
    }
}
