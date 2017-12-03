import { BluetoothDevice } from "./device";
import { BluetoothRemoteGATTService } from "./service";
import { BluetoothRemoteGATTDescriptor } from "./descriptor";
import { BluetoothRemoteGATTCharacteristic } from "./characteristic";
export interface Adapter {
    startScan: (serviceUUIDs: Array<string>, foundFn: (device: Partial<BluetoothDevice>) => void, completeFn?: () => void, errorFn?: (errorMsg: string) => void) => void;
    stopScan: (errorFn?: (errorMsg: string) => void) => void;
    connect: (handle: string, connectFn: () => void, disconnectFn: () => void, errorFn?: (errorMsg: string) => void) => void;
    disconnect: (handle: string, errorFn?: (errorMsg: string) => void) => void;
    discoverServices: (handle: string, serviceUUIDs: Array<string>, completeFn: (services: Array<Partial<BluetoothRemoteGATTService>>) => void, errorFn?: (errorMsg: string) => void) => void;
    discoverIncludedServices: (handle: string, serviceUUIDs: Array<string>, completeFn: (services: Array<Partial<BluetoothRemoteGATTService>>) => void, errorFn?: (errorMsg: string) => void) => void;
    discoverCharacteristics: (handle: string, characteristicUUIDs: Array<string>, completeFn: (characteristics: Array<Partial<BluetoothRemoteGATTCharacteristic>>) => void, errorFn?: (errorMsg: string) => void) => void;
    discoverDescriptors: (handle: string, descriptorUUIDs: Array<string>, completeFn: (descriptors: Array<Partial<BluetoothRemoteGATTDescriptor>>) => void, errorFn?: (errorMsg: string) => void) => void;
    readCharacteristic: (handle: string, completeFn: (value: DataView) => void, errorFn?: (errorMsg: string) => void) => void;
    writeCharacteristic: (handle: string, value: DataView, completeFn?: () => void, errorFn?: (errorMsg: string) => void) => void;
    enableNotify: (handle: string, notifyFn: () => void, completeFn?: () => void, errorFn?: (errorMsg: string) => void) => void;
    disableNotify: (handle: string, completeFn?: () => void, errorFn?: (errorMsg: string) => void) => void;
    readDescriptor: (handle: string, completeFn: (value: DataView) => void, errorFn?: (errorMsg: string) => void) => void;
    writeDescriptor: (handle: string, value: DataView, completeFn?: () => void, errorFn?: (errorMsg: string) => void) => void;
}
export declare class NobleAdapter implements Adapter {
    private deviceHandles;
    private serviceHandles;
    private characteristicHandles;
    private descriptorHandles;
    private charNotifies;
    private foundFn;
    private initialised;
    private init(completeFn);
    private checkForError(errorFn, continueFn?);
    private bufferToDataView(buffer);
    private dataViewToBuffer(dataView);
    private discover(deviceInfo);
    startScan(serviceUUIDs: Array<string>, foundFn: (device: Partial<BluetoothDevice>) => void, completeFn?: () => void, errorFn?: (errorMsg: string) => void): void;
    stopScan(_errorFn?: (errorMsg: string) => void): void;
    connect(handle: string, connectFn: () => void, disconnectFn: () => void, errorFn?: (errorMsg: string) => void): void;
    disconnect(handle: string, errorFn?: (errorMsg: string) => void): void;
    discoverServices(handle: string, serviceUUIDs: Array<string>, completeFn: (services: Array<Partial<BluetoothRemoteGATTService>>) => void, errorFn?: (errorMsg: string) => void): void;
    discoverIncludedServices(handle: string, serviceUUIDs: Array<string>, completeFn: (services: Array<Partial<BluetoothRemoteGATTService>>) => void, errorFn?: (errorMsg: string) => void): void;
    discoverCharacteristics(handle: string, characteristicUUIDs: Array<string>, completeFn: (characteristics: Array<Partial<BluetoothRemoteGATTCharacteristic>>) => void, errorFn?: (errorMsg: string) => void): void;
    discoverDescriptors(handle: string, descriptorUUIDs: Array<string>, completeFn: (descriptors: Array<Partial<BluetoothRemoteGATTDescriptor>>) => void, errorFn?: (errorMsg: string) => void): void;
    readCharacteristic(handle: string, completeFn: (value: DataView) => void, errorFn?: (errorMsg: string) => void): void;
    writeCharacteristic(handle: string, value: DataView, completeFn?: () => void, errorFn?: (errorMsg: string) => void): void;
    enableNotify(handle: string, notifyFn: () => void, completeFn?: () => void, errorFn?: (errorMsg: string) => void): void;
    disableNotify(handle: string, completeFn?: () => void, errorFn?: (errorMsg: string) => void): void;
    readDescriptor(handle: string, completeFn: (value: DataView) => void, errorFn?: (errorMsg: string) => void): void;
    writeDescriptor(handle: string, value: DataView, completeFn?: () => void, errorFn?: (errorMsg: string) => void): void;
}
