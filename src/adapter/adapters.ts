/*
 * Node Web Bluetooth
 * Copyright (c) 2017-2023 Rob Moran
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
import type { Adapter, SimpleBLE } from './simpleble';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const simpleble: SimpleBLE = require('bindings')('simpleble.node');

/** @hidden Array of Node-specific SimpleBLE implementation. */
export const adapters: Adapter[] = simpleble.getAdapters();

/** @hidden Is Bluetooth available? */
export const isEnabled = simpleble.isEnabled;

// Prevent memory leaks.
// Might not be necessary since all bindings do is delete `this`.
function unload() {
    if (adapters) {
        for (const adapter of adapters) {
            adapter.release();
        }
    }
}
process.on('exit', unload);
process.on('SIGINT', unload);
