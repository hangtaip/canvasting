import eventManager from "./eventManager.js";
import type { CustomEventData } from "./eventManager.js";
import DelegatedListener from "./listener.js";
import type { AllowedDelegates, DelegatedHandlers, EventValue, Listener } from "./listener.js";

interface CssValue {
   value: string | number;
   unit?: string;
}

interface Option<
   Props extends Record<string, CssValue>,
   Events extends EventValue,
> {
   tagName: string;
   name: string;
   attributes?: Record<string, string>;
   properties: [Props];
   events: [Events];
}

export class CssConfig {
   el: HTMLElement;
   style: HTMLStyleElement;
   types: HTMLElement[];
   listener: Listener<AllowedDelegates<this>>;
   events: [EventValue];
   unsubscribe: Function;

   constructor() {
      this.el = document.createElement("div");
      this.style = document.createElement("style");
      this.types = [];
      this.listener = new DelegatedListener<AllowedDelegates<this>>(this);
      this.events = [{ eventName: "", eventListener: "", eventDelegates: this, callback: () => { } }];
      this.unsubscribe = () => { };
   }

   init<Props extends Record<string, CssValue>>(target: HTMLElement, display: Props) {
      this.render(target, display);
   }

   render<Props extends Record<string, CssValue>>(target: HTMLElement, display: Props) {

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

   createOptions<Props extends Record<string, CssValue>, Events extends EventValue>(options: Option<Props, Events>[]) {

      const arr: HTMLElement[] = [];
      options.forEach((option) => {
         let { tagName, name, attributes, properties, events } = option;

         let wrapElem = this.el.cloneNode() as HTMLElement;
         wrapElem.classList.add("input-block");

         // const uuid = crypto.randomUUID();
         // console.log(uuid);

         let elem = document.createElement(tagName);
         elem.dataset.name = name;
         if (attributes) {
            Object.keys(attributes).forEach((attribute) => {
               const value = attributes[attribute as keyof typeof attributes];
               if (value !== undefined) elem.setAttribute(attribute, value);
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

   addStyleSheetRules<Props extends [Record<string, CssValue>]>(rules: Props) {
      document.head.appendChild(this.style);

      const styleSheet = this.style.sheet;

      for (let rule of rules) {

         let propStr = "";
         for (let prop in rule) {
            if (prop != "selector") {

               if (typeof rule[prop] == "object") {
                  propStr += `${prop}: ${rule[prop].value}${rule[prop].unit || ""};`;
               } else {
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

   setupEventListener<Events extends EventValue[]>(elem: HTMLElement, events: Events) {
      let subscribe: string[] = [];
      events?.forEach((event) => {
         if ("eventDelegates" in event) {
            // this.listener.setDelegates(event.eventDelegates);

            if (event.eventName) {
               subscribe.push(event.eventName);

               const eventType = `${event.eventName.slice(0, 1).toUpperCase()}${event.eventName.slice(1)}`;
               const key = `handle${eventType}` as keyof DelegatedHandlers<Events>;
               (this as any)[key] = event.callback.call(this, elem);
            }


         }
      });
   }
}

