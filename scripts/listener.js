const delegates = new WeakSet();
export default class DelegatedListener {
    delegated;
    constructor(delegated) {
        this.delegated = delegated;
    }
    // TODO: i forgot what is obj
    getDelegates(obj) {
        return delegates.has(obj);
    }
    setDelegates(obj) {
        delegates.add(obj);
    }
    checkDelegates() {
        return delegates;
    }
    handleEvent(event, details) {
        // const eventType = `${event.type.slice(0, 1).toUpperCase()}${event.type.slice(1)}`;
        let eventType = `${event.type.slice(0, 1).toUpperCase()}${event.type.slice(1)}`;
        if (details) {
            eventType = `${details.eventName.slice(0, 1).toUpperCase()}${details.eventName.slice(1)}`;
        }
        const key = `handle${eventType}`;
        const handler = this.delegated[key];
        if (typeof handler === "function") {
            handler.call(this.delegated, event, this);
        }
    }
}
//# sourceMappingURL=listener.js.map