/*
* Node Web Bluetooth
* Copyright (c) 2017 Rob Moran
*
* The MIT License (MIT)
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

var bluetooth = require('../index');
var gattServer;
var heartChar;

function log(message) {
	console.log(message);
}

log('Requesting Bluetooth Devices...');
bluetooth.requestDevice({
	filters:[{ services:[ "heart_rate" ] }]
})
.then(device => {
	log('Found device: ' + device.name);
	return device.gatt.connect();
})
.then(server => {
	gattServer = server;
	log('Gatt server connected: ' + gattServer.connected);
	return gattServer.getPrimaryService("heart_rate");
})
.then(service => {
	log('Primary service: ' + service.uuid);
	return service.getCharacteristic("heart_rate_measurement");
})
.then(characteristic => {
	log('Characteristic: ' + characteristic.uuid);
	heartChar = characteristic;
	return heartChar.getDescriptors();
})
.then(descriptors => {
	descriptors.forEach(descriptor => {
		log('Descriptor: ' + descriptor.uuid);
	});

	return Array.apply(null, Array(10)).reduce(sequence => {
		return sequence.then(() => {
			return heartChar.readValue();
		}).then(value => {
			log('Value: ' + value.getUint16(0));
		});
	}, Promise.resolve());
})
.then(() => {
	gattServer.disconnect();
	log('Gatt server connected: ' + gattServer.connected);
	process.exit();
})
.catch(error => {
	log(error);
	process.exit();
});
