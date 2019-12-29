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

const webbluetooth = require("../");

const eddystoneUUID = 0xFEAA;

const frameTypes = {
    "UID": 0x00,
    "URL": 0x10,
    "TLM": 0x20
}

const schemes = {
    0x00: "http://www.",
    0x01: "https://www.",
    0x02: "http://",
    0x03: "https://"
}

const expansions = {
    0x00: ".com/",
    0x01: ".org/",
    0x02: ".edu/",
    0x03: ".net/",
    0x04: ".info/",
    0x05: ".biz/",
    0x06: ".gov/",
    0x07: ".com",
    0x08: ".org",
    0x09: ".edu",
    0x0a: ".net",
    0x0b: ".info",
    0x0c: ".biz",
    0x0d: ".gov"
}

const deviceFound = bluetoothDevice => {
    const uuid = webbluetooth.getServiceUUID(eddystoneUUID);
    const eddyData = bluetoothDevice.adData.serviceData.get(uuid);
    if (eddyData) {
        const decoded = decodeEddystone(eddyData);
        if (decoded) {
            switch(decoded.type) {
                case frameTypes.UID:
                    console.log(`txPower: ${decoded.txPower}`);
                    break;
                case frameTypes.URL:
                    console.log(`url: ${decoded.url}`);
                    break;
                case frameTypes.TLM:
                    console.log(`version: ${decoded.version}`);
                    break;
            }
        }
    }
};

const bluetooth = new webbluetooth.Bluetooth({ deviceFound });

const decodeEddystone = view => {
    const type = view.getUint8(0);
    if (typeof type === "undefined") return undefined;

    if (type === frameTypes.UID) {
        const uidArray = [];
        for (let i = 2; i < view.byteLength; i++) {
            const hex = view.getUint8(i).toString(16);
            uidArray.push(("00" + hex).slice(-2));
        }
        return {
            type: type,
            txPower: view.getInt8(1),
            namespace: uidArray.slice(0, 10).join(),
            instance: uidArray.slice(10, 16).join()
        };
    }

    if (type === frameTypes.URL) {
        const url = "";
        for (let i = 2; i < view.byteLength; i++) {
            if (i === 2) {
                url += schemes[view.getUint8(i)];
            } else {
                url += expansions[view.getUint8(i)] || String.fromCharCode(view.getUint8(i));
            }
        }
        return {
            type: type,
            txPower: view.getInt8(1),
            url: url
        };
    }

    if (type === frameTypes.TLM) {
        return {
            type: type,
            version: view.getUint8(1),
            battery: view.getUint16(2),
            temperature: view.getInt16(4),
            advCount: view.getUint32(6),
            secCount: view.getUint32(10)
        };
    }
}

// Continuously scan
(async () => {
    console.log("scanning...");

    while (true) {
        try {
            await bluetooth.requestDevice({
                filters: [{ services: [ eddystoneUUID ] }]
            });
        } catch (error) {
            console.log(error);
            process.exit();
        }
    }
})();
