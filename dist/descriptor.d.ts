/// <reference types="web-bluetooth" />
import { W3CBluetoothRemoteGATTDescriptor } from './interfaces';
/**
 * Bluetooth Remote GATT Descriptor class
 */
export declare class BluetoothRemoteGATTDescriptor implements W3CBluetoothRemoteGATTDescriptor {
    /**
     * The characteristic the descriptor is related to
     */
    readonly characteristic: BluetoothRemoteGATTCharacteristic;
    /**
     * The unique identifier of the descriptor
     */
    readonly uuid: string;
    private _value;
    /**
     * The value of the descriptor
     */
    get value(): DataView;
    private handle;
    /**
     * Descriptor constructor
     * @param init A partial class to initialise values
     */
    constructor(init: Partial<BluetoothRemoteGATTDescriptor>);
    /**
     * Gets the value of the descriptor
     * @returns Promise containing the value
     */
    readValue(): Promise<DataView>;
    /**
     * Updates the value of the descriptor
     * @param value The value to write
     */
    writeValue(value: ArrayBuffer | ArrayBufferView): Promise<void>;
}
