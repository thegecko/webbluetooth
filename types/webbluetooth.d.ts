import { BluetoothDevice } from "./device";
import { Adapter } from "./adapter";
export interface FilterOptions {
    acceptAllDevices: boolean;
    deviceFound: (device: BluetoothDevice, selectFn: any) => void;
    filters: Array<any>;
    optionalServices: Array<any>;
    scanTime: any;
}
export declare class WebBluetooth {
    private adapter;
    private defaultScanTime;
    private scanner;
    constructor(adapter?: Adapter);
    private filterDevice(options, deviceInfo, validServices);
    requestDevice(options: FilterOptions): Promise<{}>;
    cancelRequest(): Promise<{}>;
}
