/** SimpleBLE address type. */
export enum AddressType {
    PUBLIC = 0,
    RANDOM = 1,
    UNSPECIFIED = 2,
}

/** SimpleBLE descriptor. */
export type Descriptor = string;

/** SimpleBLE characteristic. */
export interface Characteristic {
    canRead: boolean;
    canWriteRequest: boolean;
    canWriteCommand: boolean;
    canNotify: boolean;
    canIndicate: boolean;
    descriptors: Descriptor[];
    uuid: string;
}

/** SimpleBLE Service. */
export interface Service {
    uuid: string;
    data: Uint8Array;
    characteristics: Characteristic[];
}

/** SimpleBLE Peripheral. */
export interface Peripheral {
    identifier: string;
    address: string;
    addressType: AddressType;
    rssi: number;
    mtu: number;
    connected: boolean;
    connectable: boolean;
    paired: boolean;
    manufacturerData: Record<string, Uint8Array>;
    services: Service[];

    connect(): boolean;
    disconnect(): boolean;
    unpair(): boolean;
    read(sevice: string, characteristic: string): Uint8Array;
    writeRequest(service: string, characteristic: string, data: Uint8Array): boolean;
    writeCommand(service: string, characteristic: string, data: Uint8Array): boolean;
    notify(service: string, characteristic: string, cb: (data: Uint8Array) => void): boolean;
    indicate(service: string, characteristic: string, cb: (data: Uint8Array) => void): boolean;
    unsubscribe(service: string, characteristic: string): boolean;
    readDescriptor(sevice: string, characteristic: string, descriptor: string): Uint8Array;
    writeDescriptor(service: string, characteristic: string, descriptor: string, data: Uint8Array): boolean;
    setCallbackOnConnected(cb: () => void): boolean;
    setCallbackOnDisconnected(cb: () => void): boolean;
}

/** SimpleBLE Adapter. */
export interface Adapter {
    identifier: string;
    address: string;
    active: boolean;
    peripherals: Peripheral[];
    pairedPeripherals: Peripheral[];
    scanFor(ms: number): boolean;
    scanStart(): boolean;
    scanStop(): boolean;
    setCallbackOnScanStart(cb: () => void): boolean;
    setCallbackOnScanStop(cb: () => void): boolean;
    setCallbackOnScanUpdated(cb: (peripheral: Peripheral) => void): boolean;
    setCallbackOnScanFound(cb: (peripheral: Peripheral) => void): boolean;
    release(): void;
}

/** @hidden SimpleBLE bindings. */
export interface Bindings {
    getAdapters(): Adapter[];
    isEnabled(): boolean;
}
