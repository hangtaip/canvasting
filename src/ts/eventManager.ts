interface EventManager {
  listeners: Map<any, any>;
}

export type CustomEventData = {
  await: boolean,
  awaitDetail: Function,
  details: object,
  eventName: string,
  target: object,
};

class EventManager implements EventManager {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(eventType: string | string[], delegatedListener: object) {
    const subscribeSingleType = (type: string) => {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Set());
      }
      this.listeners.get(type).add(delegatedListener);
    };

    if (Array.isArray(eventType)) {
      eventType.forEach(subscribeSingleType);
    } else {
      subscribeSingleType(eventType);
    }

    return () => this.unsubscribe(eventType, delegatedListener);
  }

  unsubscribe(eventType: string | string[], delegatedListener: object) {
    const unsubscribeSingleType = (type: string) => {
      if (this.listeners.has(type)) {
        this.listeners.get(type).delete(delegatedListener);

        if (this.listeners.get(type).size === 0) {
          this.listeners.delete(type);
        }
      }
    };

    if (Array.isArray(eventType)) {
      eventType.forEach(unsubscribeSingleType);
    } else {
      unsubscribeSingleType(eventType);
    }
  }

  publish(eventType: string, data: object) {
    if (this.listeners.has(eventType)) {
      const customEvent = new CustomEvent(eventType, data);
      const currentListeners = [...this.listeners.get(eventType)];

      currentListeners.forEach(listener => {
        try {
          if (typeof listener === "function") {
            listener(customEvent);
          } else if (listener && typeof listener.handleEvent === "function") {
            listener.handleEvent.call(listener, customEvent);
          }
        } catch (error) {
          console.error(`Error in listener for event '${eventType}':`, error);
        }
      });
    }
  }

  destroy() {
    this.listeners.forEach((_, eventType) => {
      this.listeners.delete(eventType);
    });

    this.listeners.clear();
  }

  async publishCustomEvent(data: CustomEventData) {
    try {
      if (data.await) {
        await data.awaitDetail();
      }

      const eventDetail = {
        bubbles: true,
        composed: true,
        detail: data.details,
      };

      console.log(this);
      this.publish(data.eventName, eventDetail);
    } catch (err) {
      console.error(`Failed to publish ${data.eventName} : ${err}`);
    }
  }
}

export default new EventManager();
