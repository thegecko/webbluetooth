/*
* Node Web Bluetooth
* Copyright (c) 2025 Rob Moran
*
* The MIT License (MIT)
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the 'Software'), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

const scanTime = 0.5;
const buttonServiceUuid = 'e95d9882-251d-470a-a062-fa1922dfa9a8';
const buttonACharUuid = 'e95dda90-251d-470a-a062-fa1922dfa9a8';
const buttonBCharUuid = 'e95dda91-251d-470a-a062-fa1922dfa9a8';

const Bluetooth = require('../').Bluetooth;
const bluetooth = new Bluetooth({ allowAllDevices: true, scanTime });

(async () => {
    try {
        console.log(`Scanning for ${scanTime} seconds...`);
        let devices = await bluetooth.getDevices();
        devices = devices.filter(device => device.name?.startsWith('BBC micro:bit'));

        if (devices.length === 0) {
            console.log('No micro:bits found');
            process.exit();
        }

        for (const device of devices) {
            console.log(`Found device: ${device.name}`);
        }

        console.log('Connecting...');

        for (const device of devices) {
            await device.gatt.connect();

            const service = await device.gatt.getPrimaryService(buttonServiceUuid);
            const charA = await service.getCharacteristic(buttonACharUuid);
            const charB = await service.getCharacteristic(buttonBCharUuid);
    
            const button = (event, button) => console.log(`${device.name}: ${button} ${event.target.value.getUint8(0) ? ' pressed' : ' released'}`);
            charA.addEventListener('characteristicvaluechanged', event => button(event, 'A'));
            charB.addEventListener('characteristicvaluechanged', event => button(event, 'B'));

            await charA.startNotifications();
            await charB.startNotifications();
        }

        console.log('Press some buttons on the micro:bits');

    } catch (error) {
        console.log(error);
    }

    while (true) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
})();
