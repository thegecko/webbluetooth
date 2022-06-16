/// <reference types="web-bluetooth" />
import { TypedDispatcher } from './dispatcher';
import { BluetoothDevice } from './device';
import { BluetoothRemoteGATTCharacteristic, BluetoothRemoteGATTCharacteristicEvents } from './characteristic';
import { W3CBluetoothRemoteGATTService } from './interfaces';
/**
 * @hidden
 */
export interface BluetoothRemoteGATTServiceEvents extends BluetoothRemoteGATTCharacteristicEvents {
    /**
     * Service added event
     */
    serviceadded: Event;
    /**
     * Service changed event
     */
    servicechanged: Event;
    /**
     * Service removed event
     */
    serviceremoved: Event;
}
declare const BluetoothRemoteGATTService_base: new () => TypedDispatcher<BluetoothRemoteGATTServiceEvents>;
/**
 * Bluetooth Remote GATT Service class
 */
export declare class BluetoothRemoteGATTService extends BluetoothRemoteGATTService_base implements W3CBluetoothRemoteGATTService {
    /**
     * The device the service is related to
     */
    readonly device: BluetoothDevice;
    /**
     * The unique identifier of the service
     */
    readonly uuid: string;
    /**
     * Whether the service is a primary one
     */
    readonly isPrimary: boolean;
    private handle;
    private services;
    private characteristics;
    private _oncharacteristicvaluechanged;
    set oncharacteristicvaluechanged(fn: (ev: Event) => void);
    private _onserviceadded;
    set onserviceadded(fn: (ev: Event) => void);
    private _onservicechanged;
    set onservicechanged(fn: (ev: Event) => void);
    private _onserviceremoved;
    set onserviceremoved(fn: (ev: Event) => void);
    /**
     * Service constructor
     * @param init A partial class to initialise values
     */
    constructor(init: Partial<BluetoothRemoteGATTService>);
    /**
     * Gets a single characteristic contained in the service
     * @param characteristic characteristic UUID
     * @returns Promise containing the characteristic
     */
    getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>;
    /**
     * Gets a list of characteristics contained in the service
     * @param characteristic characteristic UUID
     * @returns Promise containing an array of characteristics
     */
    getCharacteristics(characteristic?: BluetoothCharacteristicUUID): Promise<Array<BluetoothRemoteGATTCharacteristic>>;
    /**
     * Gets a single service included in the service
     * @param service service UUID
     * @returns Promise containing the service
     */
    getIncludedService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
    /**
     * Gets a list of services included in the service
     * @param service service UUID
     * @returns Promise containing an array of services
     */
    getIncludedServices(service?: BluetoothServiceUUID): Promise<Array<BluetoothRemoteGATTService>>;
}
export {};
