const assert = require('assert');
const bluetooth = require('../').bluetooth;
const Bluetooth = require('../').Bluetooth;
const BluetoothUUID = require('../').BluetoothUUID;

describe('bluetooth module', () => {
    it('should describe basic constants', () => {
        assert.notEqual(bluetooth, undefined, 'bluetooth must not be undefined');
    });
});

describe('device', () => {
    let device;

    beforeEach(async () => {
        device = await bluetooth.requestDevice({
            filters: [{ namePrefix: 'BBC micro:bit' }]
        });
    });

    it('should return a device with requestDevice', () => {
        assert.notEqual(device, undefined);
    });

    it('should have device properties', () => {
        assert.notEqual(device.id, undefined);
        assert.notEqual(device.gatt, undefined);
        assert.equal(device.name.startsWith('BBC micro:bit ['), true);
    });

    it('should have gatt properties', () => {
        assert.equal(device.gatt.connected, false);
        assert.deepEqual(device.gatt.device, device);
    });

    it('should connect and disconnect', async () => {
        assert.equal(device.gatt.connected, false);
        await device.gatt.connect();
        assert.equal(device.gatt.connected, true);
        await device.gatt.disconnect();
        assert.equal(device.gatt.connected, false);
    });

    it('should have disconnect event', done => {
        const disconnect = () => {
            assert.equal(device.gatt.connected, false);
            done();
        }

        device.addEventListener('gattserverdisconnected', disconnect);
        device.gatt.connect()
        .then(() => device.gatt.disconnect());
    });
});

describe('devices', () => {
    let customBluetooth;

    beforeEach(() => {
        customBluetooth = new Bluetooth({
            scanTime: 2
        });
    });

    it('should return no devices with getDevices', async () => {
        const devices = await customBluetooth.getDevices();
        assert.equal(devices.length, 0);
    });

    it('should return one device with getDevices after a request', async () => {
        await customBluetooth.requestDevice({
            filters: [{ namePrefix: 'BBC micro:bit' }]
        });
        const devices = await customBluetooth.getDevices();
        assert.equal(devices.length, 1);
        assert.notEqual(devices[0], undefined);
    });

    it('should forget devices', async () => {
        const device = await customBluetooth.requestDevice({
            filters: [{ namePrefix: 'BBC micro:bit' }]
        });
        let devices = await customBluetooth.getDevices();
        assert.equal(devices.length, 1);
        assert.notEqual(devices[0], undefined);

        await device.forget();
        devices = await customBluetooth.getDevices();
        assert.equal(devices.length, 0);
    });
});

describe('all devices', () => {
    let customBluetooth;

    beforeEach(() => {
        customBluetooth = new Bluetooth({
            scanTime: 2,
            allowAllDevices: true
        });
    });

    it('should return all devices with getDevices', async () => {
        const devices = await customBluetooth.getDevices();
        assert.equal(devices.length > 0, true);
    });
});

describe('services', () => {
    let device;

    beforeEach(async () => {
        device = await bluetooth.requestDevice({
            filters: [{ namePrefix: 'BBC micro:bit' }]
        });
        await device.gatt.connect();
    });

    afterEach(async () => {
        await device.gatt.disconnect();
    });

    it('should get services', async () => {
        const services = await device.gatt.getPrimaryServices();
        assert.notEqual(services.length, 0);
        const uuids = services.map(service => service.uuid);
        // Device Info Service
        assert.equal(uuids.includes('0000180a-0000-1000-8000-00805f9b34fb'), true);
        // LED Service
        assert.equal(uuids.includes('e95dd91d-251d-470a-a062-fa1922dfa9a8'), true);
        // Button Service
        assert.equal(uuids.includes('e95d9882-251d-470a-a062-fa1922dfa9a8'), true);
    });

    it('should get primary service', async () => {
        const deviceInfoServiceUuid = '0000180a-0000-1000-8000-00805f9b34fb';
        const service = await device.gatt.getPrimaryService(deviceInfoServiceUuid);
        assert.notEqual(service, undefined);
        assert.equal(service.isPrimary, true);
        assert.equal(service.uuid, deviceInfoServiceUuid);
        assert.deepEqual(service.device, device);
    });
});

describe('characteristics', () => {
    let device;

    beforeEach(async () => {
        device = await bluetooth.requestDevice({
            filters: [{ namePrefix: 'BBC micro:bit' }]
        });
        await device.gatt.connect();
    });

    afterEach(async () => {
        await device.gatt.disconnect();
    });

    it('should get characteristics', async () => {
        const deviceInfoServiceUuid = '0000180a-0000-1000-8000-00805f9b34fb';
        const service = await device.gatt.getPrimaryService(deviceInfoServiceUuid);
        const chars = await service.getCharacteristics();
        const uuids = chars.map(service => service.uuid);
        // modelNumber Characteristic
        assert.equal(uuids.includes('00002a24-0000-1000-8000-00805f9b34fb'), true);
        // serialNumber Characteristic
        assert.equal(uuids.includes('00002a25-0000-1000-8000-00805f9b34fb'), true);
        // firmwareRevision Characteristic
        assert.equal(uuids.includes('00002a26-0000-1000-8000-00805f9b34fb'), true);
    });

    it('should get characteristic', async () => {
        const deviceInfoServiceUuid = '0000180a-0000-1000-8000-00805f9b34fb';
        const modelNumberCharUuid = '00002a24-0000-1000-8000-00805f9b34fb';
        const service = await device.gatt.getPrimaryService(deviceInfoServiceUuid);
        const char = await service.getCharacteristic(modelNumberCharUuid);
        assert.notEqual(char, undefined);
        assert.equal(char.uuid, modelNumberCharUuid);
        assert.equal(char.value, undefined);
        assert.deepEqual(char.service, service);
        assert.equal(char.properties.read, true);
        assert.equal(char.properties.writeWithoutResponse, false);
        assert.equal(char.properties.write, false);
        assert.equal(char.properties.notify, false);
        assert.equal(char.properties.indicate, false);
    });

    it('should read characteristic value', async () => {
        const deviceInfoServiceUuid = '0000180a-0000-1000-8000-00805f9b34fb';
        const modelNumberCharUuid = '00002a24-0000-1000-8000-00805f9b34fb';
        const service = await device.gatt.getPrimaryService(deviceInfoServiceUuid);
        const char = await service.getCharacteristic(modelNumberCharUuid);
        const value = await char.readValue();
        assert.notEqual(value, undefined);
        const decoder = new TextDecoder();
        assert.equal(decoder.decode(value).startsWith('BBC micro:bit'), true);
    });

    it('should write characteristic value', async () => {
        const ledServiceUuid = 'e95dd91d-251d-470a-a062-fa1922dfa9a8';
        const ledTextCharUuid = 'e95d93ee-251d-470a-a062-fa1922dfa9a8';
        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}`;
        const encoder = new TextEncoder();
        const array = encoder.encode(time);
        const service = await device.gatt.getPrimaryService(ledServiceUuid);
        const char = await service.getCharacteristic(ledTextCharUuid);
        await char.writeValue(new DataView(array.buffer));
    });

    it('should emit characteristic value changed event', () => {
        return new Promise(async resolve => {
            const buttonServiceUuid = 'e95d9882-251d-470a-a062-fa1922dfa9a8';
            const buttonACharUuid = 'e95dda90-251d-470a-a062-fa1922dfa9a8';
            const buttonBCharUuid = 'e95dda91-251d-470a-a062-fa1922dfa9a8';
            const service = await device.gatt.getPrimaryService(buttonServiceUuid);
            const charA = await service.getCharacteristic(buttonACharUuid);
            const charB = await service.getCharacteristic(buttonBCharUuid);
    
            const fn = async () => {
                charA.removeEventListener('characteristicvaluechanged', fn);
                charB.removeEventListener('characteristicvaluechanged', fn);
                await charA.stopNotifications();
                await charB.stopNotifications();
                resolve();
            }
    
            charA.addEventListener('characteristicvaluechanged', fn);
            charB.addEventListener('characteristicvaluechanged', fn);
            await charA.startNotifications();
            await charB.startNotifications();
    
            console.log('\n--- PRESS A BUTTON ---\n');    
        });
    });
});

describe('descriptors', () => {
    const buttonServiceUuid = 'e95d9882-251d-470a-a062-fa1922dfa9a8';
    const buttonCharUuid = 'e95dda90-251d-470a-a062-fa1922dfa9a8';
    const buttonDescriptorUuid = '00002902-0000-1000-8000-00805f9b34fb';

    let device;
    let service;
    let char;

    beforeEach(async () => {
        device = await bluetooth.requestDevice({
            filters: [{ namePrefix: 'BBC micro:bit' }]
        });
        await device.gatt.connect();
        service = await device.gatt.getPrimaryService(buttonServiceUuid);
        char = await service.getCharacteristic(buttonCharUuid);
    });

    afterEach(async () => {
        await device.gatt.disconnect();
    });

    it('should get descriptors', async () => {
        const descriptors = await char.getDescriptors();
        const uuids = descriptors.map(descriptor => descriptor.uuid);
        assert.equal(uuids.includes(buttonDescriptorUuid), true);
    });

    it('should get descriptor', async () => {
        const descriptor = await char.getDescriptor(buttonDescriptorUuid);
        assert.notEqual(descriptor, undefined);
        assert.equal(descriptor.uuid, buttonDescriptorUuid);
        assert.equal(descriptor.value, undefined);
        assert.deepEqual(descriptor.characteristic, char);
    });

    /*
    it('should write descriptor value', async () => {
        const descriptor = await char.getDescriptor(buttonDescriptorUuid);
        const view = new DataView(new ArrayBuffer(1));
        view.setUint8(0, 7);
        await descriptor.writeValue(view);
    });

    it('should read descriptor value', async () => {
        const descriptor = await char.getDescriptor(buttonDescriptorUuid);
        const view = await descriptor.readValue();
        const value = view.getUint8(0);
        assert.equal(value, 7);
    });
    */
});

describe('bluetoothuuid', () => {
    it('should get service', () => {
        const uuid = BluetoothUUID.getService('cycling_power');
        assert.equal(uuid, '00001818-0000-1000-8000-00805f9b34fb');
    });

    it('should get characteristic', () => {
        const uuid = BluetoothUUID.getCharacteristic('ieee_11073-20601_regulatory_certification_data_list');
        assert.equal(uuid, '00002a2a-0000-1000-8000-00805f9b34fb');
    });

    it('should get descriptor', () => {
        const uuid = BluetoothUUID.getDescriptor('gatt.characteristic_presentation_format');
        assert.equal(uuid, '00002904-0000-1000-8000-00805f9b34fb');
    });

    it('should get canonical uuid', () => {
        const uuid = BluetoothUUID.canonicalUUID(0x2A2B);
        assert.equal(uuid, '00002a2b-0000-1000-8000-00805f9b34fb');
    });
});
