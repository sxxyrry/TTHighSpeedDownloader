type EventShowSource = 'TRIGGER';
type EventCloseSource = 'SCRIM' | 'GESTURE';
declare const name = "s-bottom-sheet";
declare const props: {
    showed: boolean;
    disabledGesture: boolean;
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
type View = HTMLElement | ((bottomSheet: BottomSheet) => void);
declare const BottomSheet_base: {
    new (): {
        showed: boolean;
        disabledGesture: boolean;
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
            disabledGesture: boolean;
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
            disabledGesture: boolean;
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
    builder: (options: string | View | {
        root?: Element;
        view: View | string;
        disabledGesture: boolean;
    }) => BottomSheet;
};
export declare class BottomSheet extends BottomSheet_base {
}
type JSXEvents<UP extends boolean = false> = {
    [K in keyof typeof events as `on${UP extends false ? K : K extends `${infer F}${infer L}` ? `${Uppercase<F>}${L}` : never}`]?: (ev: typeof events[K]) => void;
};
declare global {
    interface HTMLElementTagNameMap {
        [name]: BottomSheet;
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
        } & BottomSheet;
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
