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

var Bluetooth = require("../").Bluetooth;
var bluetoothDevices = [];

process.stdin.setEncoding("utf8");
process.stdin.on("readable", () => {
    var input = process.stdin.read();
    if (input === "\u0003") {
        process.exit();
    } else {
        var index = parseInt(input);
        if (index && index <= bluetoothDevices.length) {
            process.stdin.setRawMode(false);
            selectDevice(index - 1);
        }
    }
});

function handleDeviceFound(bluetoothDevice, selectFn) {
    var discovered = bluetoothDevices.some(device => {
        return (device.id === bluetoothDevice.id);
    });
    if (discovered) return;

    if (bluetoothDevices.length === 0) {
        process.stdin.setRawMode(true);
        console.log("select a device:");
    }

    bluetoothDevices.push({ id: bluetoothDevice.id, select: selectFn });

    console.log(bluetoothDevices.length + ": " + bluetoothDevice.name);
    if (bluetoothDevice._serviceUUIDs.length) {
        console.log("\tAdvertising: " + bluetoothDevice._serviceUUIDs);
    }
}

var bluetooth = new Bluetooth({
	deviceFound: handleDeviceFound
});

function logError(error) {
    console.log(error);
    process.exit();
}

function enumerateGatt(server) {
    return server.getPrimaryServices()
    .then(services => {
        var sPromises = services.map(service => {
            return service.getCharacteristics()
            .then(characteristics => {
                var cPromises = characteristics.map(characteristic => {
                    return characteristic.getDescriptors()
                    .then(descriptors => {
                        descriptors = descriptors.map(descriptor => `\t\t└descriptor: ${descriptor.uuid}`);
                        descriptors.unshift(`\t└characteristic: ${characteristic.uuid}`);
                        return descriptors.join("\n");
                    });
                });

                return Promise.all(cPromises)
                .then(descriptors => {
                    descriptors.unshift(`service: ${service.uuid}`);
                    return descriptors.join("\n");
                });
            });
        });

        return Promise.all(sPromises)
        .then(services => {
            console.log(services.join("\n"));
        });
    });
}

function selectDevice(index) {
    var device = bluetoothDevices[index];
    device.select();
}

var server = null;
console.log("scanning...");

bluetooth.requestDevice()
.then(device => {
    console.log("connecting...");
    return device.gatt.connect();
})
.then(gattServer => {
    console.log("connected");
    server = gattServer;
    return enumerateGatt(server);
})
.then(() => server.disconnect())
.then(() => {
    console.log("\ndisconnected");
    process.exit();
})
.catch(logError);
