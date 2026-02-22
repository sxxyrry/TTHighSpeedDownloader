import './ripple.js';
import './scroll-view.js';
declare const name = "s-picker";
declare const props: {
    disabled: boolean;
    label: string;
    value: string;
};
declare const Picker_base: {
    new (): {
        disabled: boolean;
        label: string;
        value: string;
    } & {
        readonly options: PickerItem[];
        readonly selectedIndex: number;
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
            disabled: boolean;
            label: string;
            value: string;
        } & {
            readonly options: PickerItem[];
            readonly selectedIndex: number;
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
            disabled: boolean;
            label: string;
            value: string;
        } & {
            readonly options: PickerItem[];
            readonly selectedIndex: number;
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
export declare class Picker extends Picker_base {
}
declare const itemName = "s-picker-item";
declare const itemProps: {
    selected: boolean;
    value: string;
};
declare const PickerItem_base: {
    new (): {
        selected: boolean;
        value: string;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            selected: boolean;
            value: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            selected: boolean;
            value: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class PickerItem extends PickerItem_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: Picker;
        [itemName]: PickerItem;
    }
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                [name]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Partial<typeof props>;
                [itemName]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Partial<typeof itemProps>;
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
        } & Picker;
        [itemName]: new () => {
            /**
            * @deprecated
            **/
            $props: HTMLAttributes & Partial<typeof itemProps>;
        } & PickerItem;
    }
}
declare module 'vue/jsx-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: IntrinsicElements['div'] & Partial<typeof props>;
            [itemName]: IntrinsicElements['div'] & Partial<typeof itemProps>;
        }
    }
}
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSX.HTMLAttributes<HTMLElement> & Partial<typeof props>;
            [itemName]: JSX.HTMLAttributes<HTMLElement> & Partial<typeof itemProps>;
        }
    }
}
declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSXInternal.HTMLAttributes<HTMLElement> & Partial<typeof props>;
            [itemName]: JSXInternal.HTMLAttributes<HTMLElement> & Partial<typeof itemProps>;
        }
    }
}
export {};
