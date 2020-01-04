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

/**
 * @hidden
 */
export class DOMEvent implements Event {

    /**
     * Type of the event
     */
    public type: string;

    /**
     * @hidden
     */
    public target: EventTarget;

    /**
     * @hidden
     */
    public currentTarget: EventTarget;

    /**
     * @hidden
     */
    public srcElement: EventTarget;

    /**
     * @hidden
     */
    public timeStamp: number;

    /**
     * @hidden
     */
    public bubbles = true;

    /**
     * @hidden
     */
    public cancelable = false;

    /**
     * @hidden
     */
    public cancelBubble = false;

    /**
     * @hidden
     */
    public composed = false;

    /**
     * @hidden
     */
    public defaultPrevented = false;

    /**
     * @hidden
     */
    public eventPhase = 0;

    /**
     * @hidden
     */
    public isTrusted = true;

    /**
     * @hidden
     */
    public returnValue = true;

    /**
     * @hidden
     */
    public AT_TARGET: number;

    /**
     * @hidden
     */
    public BUBBLING_PHASE: number;

    /**
     * @hidden
     */
    public CAPTURING_PHASE: number;

    /**
     * @hidden
     */
    public NONE: number;

    constructor(target: EventTarget, type: string) {
        this.target = target;
        this.srcElement = target;
        this.currentTarget = target;
        this.type = type;
    }

    /**
     * @hidden
     */
    public composedPath(): Array<EventTarget> {
        return [];
    }

    /**
     * @hidden
     */
    public initEvent(type: string, bubbles?: boolean, cancelable?: boolean) {
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
    }

    /**
     * @hidden
     */
    public preventDefault() {
        this.defaultPrevented = true;
    }

    /**
     * @hidden
     */
    public stopImmediatePropagation() {
        return;
    }

    /**
     * @hidden
     */
    public stopPropagation() {
        return;
    }
}
