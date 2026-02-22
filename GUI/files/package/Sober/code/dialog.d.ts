import './scroll-view.js';
type EventShowSource = 'TRIGGER';
type EventCloseSource = 'SCRIM' | 'ACTION';
declare const name = "s-dialog";
declare const props: {
    showed: boolean;
    size: "standard" | "full";
};
declare const events: {
    show: CustomEvent<{
        source: EventShowSource;
    }>;
    showed: Event;
    close: CustomEvent<{
        source: EventCloseSource;
    }>;
    closed: Event;
};
type BuildActions = {
    text: string;
    click?: (event: MouseEvent) => unknown;
};
declare const Dialog_base: {
    new (): {
        showed: boolean;
        size: "standard" | "full";
    } & {
        onshow: ((event: CustomEvent<{
            source: EventShowSource;
        }>) => void) | null;
        onshowed: ((event: Event) => void) | null;
        onclose: ((event: CustomEvent<{
            source: EventCloseSource;
        }>) => void) | null;
        onclosed: ((event: Event) => void) | null;
    } & {
        addEventListener<K extends "closed" | "close" | "showed" | "show">(type: K, listener: (this: {
            showed: boolean;
            size: "standard" | "full";
        } & {
            onshow: ((event: CustomEvent<{
                source: EventShowSource;
            }>) => void) | null;
            onshowed: ((event: Event) => void) | null;
            onclose: ((event: CustomEvent<{
                source: EventCloseSource;
            }>) => void) | null;
            onclosed: ((event: Event) => void) | null;
        } & /*elided*/ any & HTMLElement, ev: {
            show: CustomEvent<{
                source: EventShowSource;
            }>;
            showed: Event;
            close: CustomEvent<{
                source: EventCloseSource;
            }>;
            closed: Event;
        }[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends "closed" | "close" | "showed" | "show">(type: K, listener: (this: {
            showed: boolean;
            size: "standard" | "full";
        } & {
            onshow: ((event: CustomEvent<{
                source: EventShowSource;
            }>) => void) | null;
            onshowed: ((event: Event) => void) | null;
            onclose: ((event: CustomEvent<{
                source: EventCloseSource;
            }>) => void) | null;
            onclosed: ((event: Event) => void) | null;
        } & /*elided*/ any & HTMLElement, ev: {
            show: CustomEvent<{
                source: EventShowSource;
            }>;
            showed: Event;
            close: CustomEvent<{
                source: EventCloseSource;
            }>;
            closed: Event;
        }[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
} & {
    builder: (options: string | {
        root?: Element;
        headline?: string;
        text?: string;
        view?: HTMLElement | ((dialog: Dialog) => void);
        actions?: BuildActions | BuildActions[];
    }) => Dialog;
};
export declare class Dialog extends Dialog_base {
}
type JSXEvents<UP extends boolean = false> = {
    [K in keyof typeof events as `on${UP extends false ? K : K extends `${infer F}${infer L}` ? `${Uppercase<F>}${L}` : never}`]?: (ev: typeof events[K]) => void;
};
declare global {
    interface HTMLElementTagNameMap {
        [name]: Dialog;
    }
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                [name]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Partial<typeof props> & Events;
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
        } & Dialog;
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
            [name]: JSX.HTMLAttributes<HTMLElement> & Partial<typeof props> & Events;
        }
    }
}
declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSXInternal.HTMLAttributes<HTMLElement> & Partial<typeof props> & Events;
        }
    }
}
export {};
