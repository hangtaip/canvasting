import type { AllowedDelegates, EventValue, Listener } from "./listener.js";
interface CssValue {
    value: string | number;
    unit?: string;
}
interface Option<Props extends Record<string, CssValue>, Events extends EventValue> {
    tagName: string;
    name: string;
    attributes?: Record<string, string>;
    properties: [Props];
    events: [Events];
}
export declare class CssConfig {
    el: HTMLElement;
    style: HTMLStyleElement;
    types: HTMLElement[];
    listener: Listener<AllowedDelegates<this>>;
    events: [EventValue];
    unsubscribe: Function;
    constructor();
    init<Props extends Record<string, CssValue>>(target: HTMLElement, display: Props): void;
    render<Props extends Record<string, CssValue>>(target: HTMLElement, display: Props): void;
    createOptions<Props extends Record<string, CssValue>, Events extends EventValue>(options: Option<Props, Events>[]): void;
    addStyleSheetRules<Props extends [Record<string, CssValue>]>(rules: Props): void;
    setupEventListener<Events extends EventValue[]>(elem: HTMLElement, events: Events): void;
}
export {};
//# sourceMappingURL=cssConfig.d.ts.map