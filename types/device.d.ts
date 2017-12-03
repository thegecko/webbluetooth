import { BluetoothRemoteGATTServer } from "./server";
export declare class BluetoothDevice {
    _handle: string;
    _allowedServices: Array<string>;
    id: string;
    name: string;
    gatt: BluetoothRemoteGATTServer;
    uuids: Array<string>;
    constructor(init?: Partial<BluetoothDevice>);
}
