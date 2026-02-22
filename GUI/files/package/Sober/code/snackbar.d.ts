declare const name = "s-snackbar";
declare const props: {
    type: "error" | "none" | "info" | "success" | "warning";
    align: "top" | "auto" | "bottom";
    duration: number;
};
declare const events: {
    show: Event;
    showed: Event;
    closed: Event;
};
declare const Snackbar_base: {
    new (): {
        type: "error" | "none" | "info" | "success" | "warning";
        align: "top" | "auto" | "bottom";
        duration: number;
    } & {
        show: () => void;
        close: () => void;
    } & {
        onshow: ((event: Event) => void) | null;
        onshowed: ((event: Event) => void) | null;
        onclosed: ((event: Event) => void) | null;
    } & {
        addEventListener<K extends "closed" | "showed" | "show">(type: K, listener: (this: {
            type: "error" | "none" | "info" | "success" | "warning";
            align: "top" | "auto" | "bottom";
            duration: number;
        } & {
            show: () => void;
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
            type: "error" | "none" | "info" | "success" | "warning";
            align: "top" | "auto" | "bottom";
            duration: number;
        } & {
            show: () => void;
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
} & {
    builder: (options: string | {
        root?: Element;
        icon?: string | Element;
        text: string;
        type?: (typeof props)["type"];
        align?: (typeof props)["align"];
        duration?: number;
        action?: string | {
            text: string;
            click: (event: MouseEvent) => unknown;
        };
    }) => Snackbar;
};
export declare class Snackbar extends Snackbar_base {
}
type JSXEvents<UP extends boolean = false> = {
    [K in keyof typeof events as `on${UP extends false ? K : K extends `${infer F}${infer L}` ? `${Uppercase<F>}${L}` : never}`]?: (ev: typeof events[K]) => void;
};
declare global {
    interface HTMLElementTagNameMap {
        [name]: Snackbar;
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
        } & Snackbar;
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
