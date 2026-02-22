import './ripple.js';
declare const name = "s-segmented-button";
declare const props: {
    value: string;
    mode: "fixed" | "auto";
};
declare const SegmentedButton_base: {
    new (): {
        value: string;
        mode: "fixed" | "auto";
    } & {
        readonly options: SegmentedButtonItem[];
        readonly selectedIndex: number;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            value: string;
            mode: "fixed" | "auto";
        } & {
            readonly options: SegmentedButtonItem[];
            readonly selectedIndex: number;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            value: string;
            mode: "fixed" | "auto";
        } & {
            readonly options: SegmentedButtonItem[];
            readonly selectedIndex: number;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class SegmentedButton extends SegmentedButton_base {
}
declare const itemName = "s-segmented-button-item";
declare const itemProps: {
    selected: boolean;
    disabled: boolean;
    selectable: boolean;
    value: string;
};
declare const SegmentedButtonItem_base: {
    new (): {
        selected: boolean;
        disabled: boolean;
        selectable: boolean;
        value: string;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            selected: boolean;
            disabled: boolean;
            selectable: boolean;
            value: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            selected: boolean;
            disabled: boolean;
            selectable: boolean;
            value: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class SegmentedButtonItem extends SegmentedButtonItem_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: SegmentedButton;
        [itemName]: SegmentedButtonItem;
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
        } & SegmentedButton;
        [itemName]: new () => {
            /**
            * @deprecated
            **/
            $props: HTMLAttributes & Partial<typeof itemProps>;
        } & SegmentedButtonItem;
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
