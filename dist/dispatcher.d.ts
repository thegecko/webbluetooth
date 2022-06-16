/// <reference types="node" />
import { EventEmitter } from 'events';
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
export declare class EventDispatcher extends EventEmitter implements EventTarget {
    private isEventListenerObject;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject | undefined): void;
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject | undefined): void;
    dispatchEvent(event: Event): boolean;
}
