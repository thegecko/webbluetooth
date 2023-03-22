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
        // await new Promise(resolve => setTimeout(resolve, 5000));
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
});
