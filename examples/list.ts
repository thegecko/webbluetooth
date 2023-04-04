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

// TODO: integrate readline.
const DEVICE_ADDRESS = "90:84:2B:08:34:BB";

(async () => {
    console.log("Scanning");
    const device = await bluetooth.requestDevice({
        filter: (info: RequestDeviceInfo) => {
            if (info.address === DEVICE_ADDRESS) {
                return true;
            }
            return false;
        },
        timeout: 5000,
    });
    console.log(`- ${device.name} [${device.id}]`);
    await device.gatt.connect();
    const services = await device.gatt.getPrimaryServices();
    for (const service of services) {
        console.log(`\t+ ${service.uuid}`);
    }
    device.gatt.disconnect();
    console.log("Done");
    process.exit(0);
})();
