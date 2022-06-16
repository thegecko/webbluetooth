/// <reference types="web-bluetooth" />
import { BluetoothDevice } from './device';
import { W3CBluetoothRemoteGATTServer } from './interfaces';
import { BluetoothRemoteGATTService } from './service';
/**
 * Bluetooth Remote GATT Server class
 */
export declare class BluetoothRemoteGATTServer implements W3CBluetoothRemoteGATTServer {
    /**
     * The device the gatt server is related to
     */
    readonly device: BluetoothDevice;
    private _connected;
    /**
     * Whether the gatt server is connected
     */
    get connected(): boolean;
    private handle;
    private services;
    /**
     * Server constructor
     * @param device Device the gatt server relates to
     */
    constructor(device: BluetoothDevice);
    /**
     * Connect the gatt server
     * @returns Promise containing the gatt server
     */
    connect(): Promise<BluetoothRemoteGATTServer>;
    /**
     * Disconnect the gatt server
     */
    disconnect(): void;
    /**
     * Gets a single primary service contained in the gatt server
     * @param service service UUID
     * @returns Promise containing the service
     */
    getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
    /**
     * Gets a list of primary services contained in the gatt server
     * @param service service UUID
     * @returns Promise containing an array of services
     */
    getPrimaryServices(service?: BluetoothServiceUUID): Promise<Array<BluetoothRemoteGATTService>>;
}
