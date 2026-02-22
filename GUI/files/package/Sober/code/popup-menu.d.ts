import './ripple.js';
import './scroll-view.js';
declare const name = "s-popup-menu";
declare const props: {
    group: "" | "start" | "end";
};
declare const PopupMenu_base: {
    new (): {
        group: "" | "start" | "end";
    } & {
        readonly show: (option?: HTMLElement | {
            x: number;
            y: number;
            origin?: string;
        }) => void;
        readonly toggle: (option?: HTMLElement | {
            x: number;
            y: number;
            origin?: string;
        }) => void;
        readonly close: () => void;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            group: "" | "start" | "end";
        } & {
            readonly show: (option?: HTMLElement | {
                x: number;
                y: number;
                origin?: string;
            }) => void;
            readonly toggle: (option?: HTMLElement | {
                x: number;
                y: number;
                origin?: string;
            }) => void;
            readonly close: () => void;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            group: "" | "start" | "end";
        } & {
            readonly show: (option?: HTMLElement | {
                x: number;
                y: number;
                origin?: string;
            }) => void;
            readonly toggle: (option?: HTMLElement | {
                x: number;
                y: number;
                origin?: string;
            }) => void;
            readonly close: () => void;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class PopupMenu extends PopupMenu_base {
}
declare const itemName = "s-popup-menu-item";
declare const PopupMenuItem_base: {
    new (): {} & {
        addEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class PopupMenuItem extends PopupMenuItem_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: PopupMenu;
        [itemName]: PopupMenuItem;
    }
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                [name]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Partial<typeof props>;
                [itemName]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
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
            $props: HTMLAttributes & Partial<typeof props>;
        } & PopupMenu;
        [itemName]: new () => {
            /**
            * @deprecated
            **/
            $props: HTMLAttributes;
        } & PopupMenuItem;
    }
}
declare module 'vue/jsx-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: IntrinsicElements['div'] & Partial<typeof props>;
            [itemName]: IntrinsicElements['div'];
        }
    }
}
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSX.HTMLAttributes<HTMLElement> & Partial<typeof props>;
            [itemName]: JSX.HTMLAttributes<HTMLElement>;
        }
    }
}
declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSXInternal.HTMLAttributes<HTMLElement> & Partial<typeof props>;
            [itemName]: JSXInternal.HTMLAttributes<HTMLElement>;
        }
    }
}
export {};
