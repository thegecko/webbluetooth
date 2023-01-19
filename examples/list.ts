/*
 * Node Web Bluetooth
 * Copyright (c) 2019 Rob Moran
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
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { bluetooth } from "../dist/index.js";
import type { RequestDeviceInfo } from "../dist/index.js";

(async () => {
    /*
    const options = {
        filter: () => false,
        signal: controller.signal,
    }
    */
    //console.log("SCANNING")
    //const devices = await bluetooth.requestDevices(options);
    //console.log(`Found ${devices.length} devices`);
    console.log("Scanning");
    const devices = await bluetooth.requestDevices({
        filter: (info: RequestDeviceInfo) => {
            if (info.name === "HUB NO.4") {
                return true;
            }
            return false;
        },
        timeout: 5000,
    });
    console.log(`Done - found ${devices.length} devices`);
    for (const device of devices) {
        console.log(`- ${device.name} [${device.id}]`);
        await device.gatt.connect();
        const services = await device.gatt.getPrimaryServices();
        for (const service of services) {
            console.log(`    + ${service.uuid}`);
        }
        device.gatt.disconnect();
    }
    console.log("Done");
    process.exit(0);

    /*
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 8000);
        //process.on("SIGINT", () => {});
        const options = {
            filter: (info: RequestDeviceInfo) => {
                //console.log(info);
                if (info.services!.length > 1) {
                    console.log("GOOD")
                    return true;
                }
                return false;
            },
            signal: controller.signal,
            timeout: 2000,
        };
        console.log("Scanning for devices:");
        for await (const device of bluetooth.scan(options)) {
            console.log(`- ${device.name} [${device.id}]`);
        }
    } catch (err: any) {
        if (err.name === "AbortError") {
            console.log("Done");
            process.exit(0);
        }
        console.log(`Error: ${err.message}`);
        process.exit(1);
    }
    */

    /*
    try {
        const options = {
            filter: () => true
        };
        console.log("Scanning for devices:")
        for await (const device of bluetooth.scan(options)) {
            console.log(`- ${device.name} [${device.id}]`);
        }
        process.exit(0);
    } catch (err: any) {
        console.log(`Error: ${err.message}`);
        process.exit(1);
    }
    */
})();
