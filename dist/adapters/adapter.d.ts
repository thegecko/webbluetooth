/// <reference types="node" />
/// <reference types="web-bluetooth" />
import { EventEmitter } from 'events';
import { BluetoothDevice } from '../device';
import { BluetoothRemoteGATTService } from '../service';
import { BluetoothRemoteGATTCharacteristic } from '../characteristic';
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
