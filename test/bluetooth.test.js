const assert = require('assert');
const bluetooth = require('../').bluetooth;
const Bluetooth = require('../').Bluetooth;

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

    it('should return a device with requestDevice', async () => {
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
        // assert.equal(service.isPrimary, true);
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
        assert.equal(value.starsWith('BBC micro:bit'), true);
    });

    it('should write characteristic value', async () => {
        const ledServiceUuid = 'e95dd91d-251d-470a-a062-fa1922dfa9a8';
        const ledTextCharUuid = 'e95d93ee-251d-470a-a062-fa1922dfa9a8';
        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}`;
        const buffer = new ArrayBuffer(time.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < time.length; i++) {
            view[i] = time.charCodeAt(i);
        }
        const service = await device.gatt.getPrimaryService(ledServiceUuid);
        const char = await service.getCharacteristic(ledTextCharUuid);
        await char.writeValue(buffer);
    });
});
