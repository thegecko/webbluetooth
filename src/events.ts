/*
* Node Web Bluetooth
* Copyright (c) 2026 Rob Moran
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

import { EventEmitter } from 'events';

/**
 * @hidden
 */
export class EventDispatcher<T> {
    protected emitter = new EventEmitter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private isEventListenerObject = (listener: any): listener is EventListenerObject => (listener as EventListenerObject).handleEvent !== undefined;

    public addEventListener<K extends keyof T>(type: K, listener: (this: this, ev: T[K]) => void): void;
    public addEventListener<K extends keyof T>(type: K, listener: EventListener): void;
    public addEventListener<K extends keyof T>(type: string, listener: EventListener | ((ev: T[K]) => void)): void {
        if (listener) {
            const handler = this.isEventListenerObject(listener) ? listener.handleEvent : listener;
            this.emitter.addListener(type, handler);
        }
    }

    public removeEventListener<K extends keyof T>(type: K, callback: (this: this, ev: T[K]) => void): void;
    public removeEventListener<K extends keyof T>(type: K, callback: EventListener): void;
    public removeEventListener<K extends keyof T>(type: K, callback: EventListener | ((ev: T[K]) => void)): void {
        if (callback) {
            const handler = this.isEventListenerObject(callback) ? callback.handleEvent : callback;
            this.emitter.removeListener(type as string, handler);
        }
    }

    public dispatchEvent(event: Event): boolean {
        return this.emitter.emit(event.type, event);
    }
}
