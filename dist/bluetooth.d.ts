/// <reference types="web-bluetooth" />
import { TypedDispatcher } from './dispatcher';
import { BluetoothDevice, BluetoothDeviceEvents } from './device';
import { W3CBluetooth } from './interfaces';
/**
 * Bluetooth Options interface
 */
export interface BluetoothOptions {
    /**
     * A `device found` callback function to allow the user to select a device
     */
    deviceFound?: (device: BluetoothDevice, selectFn: () => void) => boolean;
    /**
     * The amount of seconds to scan for the device (default is 10)
     */
    scanTime?: number;
    /**
     * An optional referring device
     */
    referringDevice?: BluetoothDevice;
}
/**
 * @hidden
 */
export interface BluetoothEvents extends BluetoothDeviceEvents {
    /**
     * Bluetooth Availability Changed event
     */
    availabilitychanged: Event;
}
declare const Bluetooth_base: new () => TypedDispatcher<BluetoothEvents>;
/**
 * Bluetooth class
 */
export declare class Bluetooth extends Bluetooth_base implements W3CBluetooth {
    /**
     * Bluetooth Availability Changed event
     * @event
     */
    static EVENT_AVAILABILITY: string;
    /**
     * Referring device for the bluetooth instance
     */
    readonly referringDevice?: BluetoothDevice;
    private deviceFound;
    private scanTime;
    private scanner;
    private _oncharacteristicvaluechanged;
    set oncharacteristicvaluechanged(fn: (ev: Event) => void);
    private _onserviceadded;
    set onserviceadded(fn: (ev: Event) => void);
    private _onservicechanged;
    set onservicechanged(fn: (ev: Event) => void);
    private _onserviceremoved;
    set onserviceremoved(fn: (ev: Event) => void);
    private _ongattserverdisconnected;
    set ongattserverdisconnected(fn: (ev: Event) => void);
    private _onadvertisementreceived;
    set onadvertisementreceived(fn: (ev: Event) => void);
    private _onavailabilitychanged;
    set onavailabilitychanged(fn: (ev: Event) => void);
    /**
     * Bluetooth constructor
     * @param options Bluetooth initialisation options
     */
    constructor(options?: BluetoothOptions);
    private filterDevice;
    /**
     * Gets the availability of a bluetooth adapter
     * @returns Promise containing a flag indicating bluetooth availability
     */
    getAvailability(): Promise<boolean>;
    /**
     * Scans for a device matching optional filters
     * @param options The options to use when scanning
     * @returns Promise containing a device which matches the options
     */
    requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
    /**
     * Get all bluetooth devices
     */
    getDevices(): Promise<BluetoothDevice[]>;
    /**
     * Cancels the scan for devices
     */
    cancelRequest(): Promise<void>;
    /**
     * @hidden
     * Request LE scan (not implemented)
     */
    requestLEScan(_options?: BluetoothLEScanOptions): Promise<BluetoothLEScan>;
}
export {};
