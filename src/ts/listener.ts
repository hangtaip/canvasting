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

const delegates = new WeakSet<object>();

export default class DelegatedListener<Type> implements Listener<Type> {
  delegated: Type;

  constructor(delegated: Type) {
    this.delegated = delegated;
  }

  // TODO: i forgot what is obj
  getDelegates(obj: Type): boolean {
    return delegates.has(obj as object);
  }

  setDelegates(obj: Type) {
    delegates.add(obj as object);
  }

  checkDelegates() {
    return delegates;
  }

  handleEvent(event: CustomEvent, details: EventValue) {
    // const eventType = `${event.type.slice(0, 1).toUpperCase()}${event.type.slice(1)}`;
    let eventType = `${event.type.slice(0, 1).toUpperCase()}${event.type.slice(1)}`;

    if (details) {
      eventType = `${details.eventName.slice(0, 1).toUpperCase()}${details.eventName.slice(1)}`;
    }
    const key = `handle${eventType}` as keyof DelegatedHandlers<Type>;

    const handler = (this.delegated as any)[key] as EventHandler<Type> | undefined;

    if (typeof handler === "function") {

      handler.call(this.delegated, event, this);
    }
  }
}
