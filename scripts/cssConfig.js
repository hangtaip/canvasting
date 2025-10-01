import eventManager from "./eventManager.js";
import DelegatedListener from "./listener.js";
export class CssConfig {
    el;
    style;
    types;
    listener;
    events;
    unsubscribe;
    constructor() {
        this.el = document.createElement("div");
        this.style = document.createElement("style");
        this.types = [];
        this.listener = new DelegatedListener(this);
        this.events = [{ eventName: "", eventListener: "", eventDelegates: this, callback: () => { } }];
        this.unsubscribe = () => { };
    }
    init(target, display) {
        this.render(target, display);
    }
    render(target, display) {
        this.addStyleSheetRules([display]);
        // (Object.keys(display) as (keyof Props)[]).forEach((property) => {
        //    const prop = display[property];
        //    if (!prop) {
        //       console.warn(`${String(property)} is not available`);
        //       return;
        //    }
        //
        //    // const { value, unit } = prop;
        //    // this.el.style[property as any] = unit ? `${value}${unit}` : String(value);
        //    // this.addStyleSheetRules(prop);
        // });
        this.el.classList.add(String(display.selector).substring(1));
        this.types.forEach((elem) => {
            this.el.append(elem);
        });
        target.append(this.el);
    }
    createOptions(options) {
        const arr = [];
        options.forEach((option) => {
            let { tagName, name, attributes, properties, events } = option;
            let wrapElem = this.el.cloneNode();
            wrapElem.classList.add("input-block");
            // const uuid = crypto.randomUUID();
            // console.log(uuid);
            let elem = document.createElement(tagName);
            elem.dataset.name = name;
            if (attributes) {
                Object.keys(attributes).forEach((attribute) => {
                    const value = attributes[attribute];
                    if (value !== undefined)
                        elem.setAttribute(attribute, value);
                });
            }
            // (Object.keys(properties) as (keyof Props)[]).forEach((property) => {
            //    if (property != "selector") return;
            //
            //    const prop = properties[property];
            //    if (!prop) {
            //       console.warn(`${String(property)} is not available`);
            //       return;
            //    }
            //    const { value, unit } = prop;
            //    elem.style[property as any] = unit ? `${value}${unit}` : String(value);
            // });
            wrapElem.appendChild(elem);
            arr.push(wrapElem);
            this.addStyleSheetRules(properties);
            this.setupEventListener(elem, events);
        });
        this.types = arr;
    }
    addStyleSheetRules(rules) {
        document.head.appendChild(this.style);
        const styleSheet = this.style.sheet;
        for (let rule of rules) {
            let propStr = "";
            for (let prop in rule) {
                if (prop != "selector") {
                    if (typeof rule[prop] == "object") {
                        propStr += `${prop}: ${rule[prop].value}${rule[prop].unit || ""};`;
                    }
                    else {
                        propStr += `${prop}: ${rule[prop]};`;
                    }
                }
            }
            propStr = `${rule.selector} { ${propStr} }`;
            if (styleSheet != null) {
                styleSheet.insertRule(propStr, styleSheet?.cssRules.length);
            }
        }
    }
    setupEventListener(elem, events) {
        let subscribe = [];
        events?.forEach((event) => {
            if ("eventDelegates" in event) {
                // this.listener.setDelegates(event.eventDelegates);
                if (event.eventName) {
                    subscribe.push(event.eventName);
                    const eventType = `${event.eventName.slice(0, 1).toUpperCase()}${event.eventName.slice(1)}`;
                    const key = `handle${eventType}`;
                    this[key] = event.callback.call(this, elem);
                    // this.listener.setDelegates(elem);
                    // elem.addEventListener(event.eventListener, (e) => {
                    //    this.listener.handleEvent(e, event);
                    // });
                }
            }
        });
        console.log(subscribe);
        // this.unsubscribe = eventManager.subscribe(subscribe, this.listener);
    }
    async publishCustomEvent(data) {
        try {
            if (data.await) {
                await data.awaitDetail();
            }
            const eventDetail = {
                bubbles: true,
                composed: true,
                detail: data.details,
            };
            eventManager.publish(data.eventName, eventDetail);
        }
        catch (err) {
            console.error(`Failed to publish ${data.eventName} : ${err}`);
        }
    }
}
//# sourceMappingURL=cssConfig.js.map