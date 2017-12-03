import { BluetoothDevice } from "./device";
export declare class BluetoothRemoteGATTServer {
    _services: Array<string>;
    device: BluetoothDevice;
    connected: boolean;
}
