declare const name = "s-popup";
declare const props: {
    align: "center" | "left" | "right";
};
declare const events: {
    show: Event;
    showed: Event;
    closed: Event;
};
type ShowOptions = {
    x: number;
    y: number;
    origin?: string;
};
declare const Popup_base: {
    new (): {
        align: "center" | "left" | "right";
    } & {
        show: (option?: HTMLElement | ShowOptions) => void;
        toggle: (option?: HTMLElement | ShowOptions) => void;
        close: () => void;
    } & {
        onshow: ((event: Event) => void) | null;
        onshowed: ((event: Event) => void) | null;
        onclosed: ((event: Event) => void) | null;
    } & {
        addEventListener<K extends "closed" | "showed" | "show">(type: K, listener: (this: {
            align: "center" | "left" | "right";
        } & {
            show: (option?: HTMLElement | ShowOptions) => void;
            toggle: (option?: HTMLElement | ShowOptions) => void;
            close: () => void;
        } & {
            onshow: ((event: Event) => void) | null;
            onshowed: ((event: Event) => void) | null;
            onclosed: ((event: Event) => void) | null;
        } & /*elided*/ any & HTMLElement, ev: {
            show: Event;
            showed: Event;
            closed: Event;
        }[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends "closed" | "showed" | "show">(type: K, listener: (this: {
            align: "center" | "left" | "right";
        } & {
            show: (option?: HTMLElement | ShowOptions) => void;
            toggle: (option?: HTMLElement | ShowOptions) => void;
            close: () => void;
        } & {
            onshow: ((event: Event) => void) | null;
            onshowed: ((event: Event) => void) | null;
            onclosed: ((event: Event) => void) | null;
        } & /*elided*/ any & HTMLElement, ev: {
            show: Event;
            showed: Event;
            closed: Event;
        }[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Popup extends Popup_base {
}
type JSXEvents<UP extends boolean = false> = {
    [K in keyof typeof events as `on${UP extends false ? K : K extends `${infer F}${infer L}` ? `${Uppercase<F>}${L}` : never}`]?: (ev: typeof events[K]) => void;
};
declare global {
    interface HTMLElementTagNameMap {
        [name]: Popup;
    }
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                [name]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Partial<typeof props> & JSXEvents;
            }
        }
    }
}
declare module 'vue' {
    import { HTMLAttributes } from 'vue';
    interface GlobalComponents {
        [name]: new () => {
            /**
            * @deprecated
            **/
            $props: HTMLAttributes & Partial<typeof props> & JSXEvents<true>;
        } & Popup;
    }
}
declare module 'vue/jsx-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: IntrinsicElements['div'] & Partial<typeof props> & JSXEvents<true>;
        }
    }
}
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSX.HTMLAttributes<HTMLElement> & Partial<typeof props> & JSXEvents;
        }
    }
}
declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSXInternal.HTMLAttributes<HTMLElement> & Partial<typeof props> & JSXEvents;
        }
    }
}
export {};
