/// <reference types="node" />
/// <reference types="web-bluetooth" />
import { EventEmitter } from 'events';
import { BluetoothDevice } from './device';
import { BluetoothRemoteGATTService } from './service';
import { BluetoothRemoteGATTCharacteristic } from './characteristic';
/**
 * @hidden
 */
export interface Adapter extends EventEmitter {
    getEnabled: () => Promise<boolean>;
    startScan: (serviceUUIDs: Array<string>, foundFn: (device: Partial<BluetoothDevice>) => void) => Promise<void>;
    stopScan: () => void;
    connect: (handle: string, disconnectFn?: () => void) => Promise<void>;
    disconnect: (handle: string) => Promise<void>;
    discoverServices: (handle: string, serviceUUIDs?: Array<string>) => Promise<Array<Partial<BluetoothRemoteGATTService>>>;
    discoverIncludedServices: (handle: string, serviceUUIDs?: Array<string>) => Promise<Array<Partial<BluetoothRemoteGATTService>>>;
    discoverCharacteristics: (handle: string, characteristicUUIDs?: Array<string>) => Promise<Array<Partial<BluetoothRemoteGATTCharacteristic>>>;
    discoverDescriptors: (handle: string, descriptorUUIDs?: Array<string>) => Promise<Array<Partial<BluetoothRemoteGATTDescriptor>>>;
    readCharacteristic: (handle: string) => Promise<DataView>;
    writeCharacteristic: (handle: string, value: DataView, withoutResponse?: boolean) => Promise<void>;
    enableNotify: (handle: string, notifyFn: () => void) => Promise<void>;
    disableNotify: (handle: string) => Promise<void>;
    readDescriptor: (handle: string) => Promise<DataView>;
    writeDescriptor: (handle: string, value: DataView) => Promise<void>;
}
/**
 * @hidden
 */
export declare class NobleAdapter extends EventEmitter implements Adapter {
    static EVENT_ENABLED: string;
    private deviceHandles;
    private serviceHandles;
    private characteristicHandles;
    private descriptorHandles;
    private charNotifies;
    private discoverFn;
    private initialised;
    private enabled;
    private os;
    constructor();
    private get state();
    private init;
    private bufferToDataView;
    private dataViewToBuffer;
    private validDevice;
    private deviceToBluetoothDevice;
    getEnabled(): Promise<boolean>;
    startScan(serviceUUIDs: Array<string>, foundFn: (device: Partial<BluetoothDevice>) => void): Promise<void>;
    stopScan(_errorFn?: (errorMsg: string) => void): void;
    connect(handle: string, disconnectFn?: () => void): Promise<void>;
    disconnect(handle: string): Promise<void>;
    discoverServices(handle: string, serviceUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTService>>>;
    discoverIncludedServices(handle: string, serviceUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTService>>>;
    discoverCharacteristics(handle: string, characteristicUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTCharacteristic>>>;
    discoverDescriptors(handle: string, descriptorUUIDs?: Array<string>): Promise<Array<Partial<BluetoothRemoteGATTDescriptor>>>;
    readCharacteristic(handle: string): Promise<DataView>;
    writeCharacteristic(handle: string, value: DataView, withoutResponse?: boolean): Promise<void>;
    enableNotify(handle: string, notifyFn: (value: DataView) => void): Promise<void>;
    disableNotify(handle: string): Promise<void>;
    readDescriptor(handle: string): Promise<DataView>;
    writeDescriptor(handle: string, value: DataView): Promise<void>;
}
/**
 * @hidden
 */
export declare const adapter: NobleAdapter;
