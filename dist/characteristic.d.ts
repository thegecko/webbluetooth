/// <reference types="web-bluetooth" />
import { TypedDispatcher } from './dispatcher';
import { BluetoothRemoteGATTService } from './service';
import { BluetoothRemoteGATTDescriptor } from './descriptor';
import { W3CBluetoothRemoteGATTCharacteristic } from './interfaces';
/**
 * @hidden
 */
export interface BluetoothRemoteGATTCharacteristicEvents {
    /**
     * Characteristic value changed event
     */
    characteristicvaluechanged: Event;
}
declare const BluetoothRemoteGATTCharacteristic_base: new () => TypedDispatcher<BluetoothRemoteGATTCharacteristicEvents>;
/**
 * Bluetooth Remote GATT Characteristic class
 */
export declare class BluetoothRemoteGATTCharacteristic extends BluetoothRemoteGATTCharacteristic_base implements W3CBluetoothRemoteGATTCharacteristic {
    /**
     * The service the characteristic is related to
     */
    readonly service: BluetoothRemoteGATTService;
    /**
     * The unique identifier of the characteristic
     */
    readonly uuid: any;
    /**
     * The properties of the characteristic
     */
    readonly properties: BluetoothCharacteristicProperties;
    private _value;
    /**
     * The value of the characteristic
     */
    get value(): DataView;
    private handle;
    private descriptors;
    private _oncharacteristicvaluechanged;
    set oncharacteristicvaluechanged(fn: (ev: Event) => void);
    /**
     * Characteristic constructor
     * @param init A partial class to initialise values
     */
    constructor(init: Partial<BluetoothRemoteGATTCharacteristic>);
    private setValue;
    /**
     * Gets a single characteristic descriptor
     * @param descriptor descriptor UUID
     * @returns Promise containing the descriptor
     */
    getDescriptor(descriptor: string | number): Promise<BluetoothRemoteGATTDescriptor>;
    /**
     * Gets a list of the characteristic's descriptors
     * @param descriptor descriptor UUID
     * @returns Promise containing an array of descriptors
     */
    getDescriptors(descriptor?: string | number): Promise<Array<BluetoothRemoteGATTDescriptor>>;
    /**
     * Gets the value of the characteristic
     * @returns Promise containing the value
     */
    readValue(): Promise<DataView>;
    /**
     * Updates the value of the characteristic
     * @param value The value to write
     */
    writeValue(value: ArrayBuffer | ArrayBufferView): Promise<void>;
    /**
     * Updates the value of the characteristic and waits for a response
     * @param value The value to write
     */
    writeValueWithResponse(value: ArrayBuffer | ArrayBufferView): Promise<void>;
    /**
     * Updates the value of the characteristic without waiting for a response
     * @param value The value to write
     */
    writeValueWithoutResponse(value: ArrayBuffer | ArrayBufferView): Promise<void>;
    /**
     * Start notifications of changes for the characteristic
     * @returns Promise containing the characteristic
     */
    startNotifications(): Promise<W3CBluetoothRemoteGATTCharacteristic>;
    /**
     * Stop notifications of changes for the characteristic
     * @returns Promise containing the characteristic
     */
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
}
export {};
