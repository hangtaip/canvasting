type EventHandler<Self> = (event: Event, listener: DelegatedListener<Self>) => void;
export type DelegatedHandlers<Self> = {
    [K in `handle${Capitalize<string>}`]?: EventHandler<Self>;
};
export type AllowedDelegates<Self> = Self | HTMLElement | object;
export interface EventValue<Delegate = AllowedDelegates<any>> {
    eventName: string;
    eventListener: string;
    eventDelegates: Delegate;
    callback: Function;
}
export interface Listener<Type> {
    delegated: Type;
    getDelegates: (obj: Type) => boolean;
    setDelegates: (obj: Type) => void;
    checkDelegates: () => object;
    handleEvent: (event: CustomEvent, details: EventValue) => void;
}
export default class DelegatedListener<Type> implements Listener<Type> {
    delegated: Type;
    constructor(delegated: Type);
    getDelegates(obj: Type): boolean;
    setDelegates(obj: Type): void;
    checkDelegates(): WeakSet<object>;
    handleEvent(event: CustomEvent, details: EventValue): void;
}
export {};
//# sourceMappingURL=listener.d.ts.map