/**
 * @hidden
 */
export declare class DOMEvent implements Event {
    /**
     * Type of the event
     */
    type: string;
    /**
     * @hidden
     */
    target: EventTarget;
    /**
     * @hidden
     */
    currentTarget: EventTarget;
    /**
     * @hidden
     */
    srcElement: EventTarget;
    /**
     * @hidden
     */
    timeStamp: number;
    /**
     * @hidden
     */
    bubbles: boolean;
    /**
     * @hidden
     */
    cancelable: boolean;
    /**
     * @hidden
     */
    cancelBubble: boolean;
    /**
     * @hidden
     */
    composed: boolean;
    /**
     * @hidden
     */
    defaultPrevented: boolean;
    /**
     * @hidden
     */
    eventPhase: number;
    /**
     * @hidden
     */
    isTrusted: boolean;
    /**
     * @hidden
     */
    returnValue: boolean;
    /**
     * @hidden
     */
    AT_TARGET: number;
    /**
     * @hidden
     */
    BUBBLING_PHASE: number;
    /**
     * @hidden
     */
    CAPTURING_PHASE: number;
    /**
     * @hidden
     */
    NONE: number;
    constructor(target: EventTarget, type: string);
    /**
     * @hidden
     */
    composedPath(): Array<EventTarget>;
    /**
     * @hidden
     */
    initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void;
    /**
     * @hidden
     */
    preventDefault(): void;
    /**
     * @hidden
     */
    stopImmediatePropagation(): void;
    /**
     * @hidden
     */
    stopPropagation(): void;
}
