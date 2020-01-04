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

import { EventEmitter } from "events";

// tslint:disable:ban-types

/**
 * @hidden
 */
export interface EventListeners<T> {
    newListener: keyof T;
    removeListener: keyof T;
}

/**
 * @hidden
 */
export interface TypedDispatcher<T> {
    addEventListener<K extends keyof T>(type: K, listener: (this: this, event: T[K]) => void): void;
    addEventListener<E extends keyof EventListeners<T>>(type: E, listener: (this: this, event: EventListeners<T>[E]) => void): void;
    removeEventListener<K extends keyof T>(type: K, callback: (this: this, event: T[K]) => void): void;
    removeEventListener<E extends keyof EventListeners<T>>(type: E, callback: (this: this, event: EventListeners<T>[E]) => void): void;
    dispatchEvent<K extends keyof T>(event: T[K]): boolean;
    addListener<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    addListener<E extends keyof EventListeners<T>>(event: E, listener: (data: EventListeners<T>[E]) => void): this;
    on<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    on<E extends keyof EventListeners<T>>(event: E, listener: (data: EventListeners<T>[E]) => void): this;
    once<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    once<E extends keyof EventListeners<T>>(event: E, listener: (data: EventListeners<T>[E]) => void): this;
    prependListener<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    prependOnceListener<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    removeListener<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
    removeListener<E extends keyof EventListeners<T>>(event: E, listener: (data: EventListeners<T>[E]) => void): this;
    removeAllListeners<K extends keyof T>(event?: K): this;
    removeAllListeners<E extends keyof EventListeners<T>>(event?: E): this;
    listeners<K extends keyof T>(event: K): Array<Function>;
    listeners<E extends keyof EventListeners<T>>(event: EventListeners<T>[E]): Array<Function>;
    emit<K extends keyof T>(event: K, data: T[K]): boolean;
    eventNames<K extends keyof T, E extends keyof EventListeners<T>>(): Array<K | E>;
    listenerCount<K extends keyof T>(type: K): number;
    listenerCount<E extends keyof EventListeners<T>>(type: EventListeners<T>[E]): number;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
}

/**
 * @hidden
 */
export class EventDispatcher extends EventEmitter implements EventTarget {

    private isEventListenerObject = (listener: EventListenerOrEventListenerObject): listener is EventListenerObject => (listener as EventListenerObject).handleEvent !== undefined;

    public addEventListener(type: string, listener: EventListenerOrEventListenerObject | null) {
        if (listener) {
            const handler = this.isEventListenerObject(listener) ? listener.handleEvent : listener;
            super.addListener(type, handler);
        }
    }

    public removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null) {
        if (callback) {
            const handler = this.isEventListenerObject(callback) ? callback.handleEvent : callback;
            super.removeListener(type, handler);
        }
    }

    public dispatchEvent(event: Event): boolean {
        return super.emit(event.type, event);
    }
}
