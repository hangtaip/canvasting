interface EventManager {
    listeners: Map<any, any>;
}
export type CustomEventData = {
    await: boolean;
    awaitDetail: Function;
    details: object;
    eventName: string;
    target: object;
};
declare class EventManager implements EventManager {
    constructor();
    subscribe(eventType: string | string[], delegatedListener: object): () => void;
    unsubscribe(eventType: string | string[], delegatedListener: object): void;
    publish(eventType: string, data: object): void;
    destroy(): void;
    publishCustomEvent(data: CustomEventData): Promise<void>;
}
declare const _default: EventManager;
export default _default;
//# sourceMappingURL=eventManager.d.ts.map