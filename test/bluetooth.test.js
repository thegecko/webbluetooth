const assert = require('assert');
const bluetooth = require('../').bluetooth;

describe('bluetooth module', () => {
    it('should describe basic constants', () => {
        assert.notEqual(bluetooth, undefined, 'bluetooth must not be undefined');
    });
});

describe('requestDevice', () => {
    it('should return a device', async () => {
        const device = await bluetooth.requestDevice({
            filters: [{ namePrefix: 'BBC micro:bit' }]
        });
        assert.notEqual(device, undefined);
    });
});

/*
describe('getDevices', () => {
    it('should return one device', async () => {
        const device = await bluetooth.requestDevice({
            filters: [{ namePrefix: 'BBC micro:bit' }]
        });
        const devices = await bluetooth.getDevices();
        assert.equal(devices.length, 1);
        assert.notEqual(devices[0], undefined);
        assert.deepEqual(devices[0], device);
    });
});

*/
describe('device', () => {
    let device;

    before(async () => {
        device = await bluetooth.requestDevice({
            filters: [{ namePrefix: 'BBC micro:bit' }]
        });
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

    it('should get services', async () => {
        await device.gatt.connect();
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
