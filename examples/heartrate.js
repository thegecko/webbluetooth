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

var bluetooth = require("../").bluetooth;

console.log("Requesting Bluetooth Devices...");
bluetooth.requestDevice({
	filters:[{ services:[ "heart_rate" ] }]
})
.then(device => {
	console.log("Found device: " + device.name);
	return device.gatt.connect();
})
.then(server => {
	console.log("Gatt server connected: " + server.connected);
	return server.getPrimaryService("heart_rate");
})
.then(service => {
	console.log("Primary service: " + service.uuid);
	return service.getCharacteristic("heart_rate_measurement");
})
.then(characteristic => {
	console.log("Characteristic: " + characteristic.uuid);
	return characteristic.startNotifications();
})
.then(characteristic => {
	console.log("Notifications started");

	characteristic.addEventListener("characteristicvaluechanged", event => {
		if (event.value.buffer.byteLength) console.log(event.value.getUint16(0));
	});
})
.catch(error => {
	console.log(error);
	process.exit();
});
