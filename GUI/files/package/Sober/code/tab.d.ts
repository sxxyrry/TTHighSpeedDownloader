import './ripple.js';
declare const name = "s-tab";
declare const props: {
    mode: "fixed" | "scrollable";
    value: string;
};
declare const Tab_base: {
    new (): {
        mode: "fixed" | "scrollable";
        value: string;
    } & {
        readonly options: TabItem[];
        readonly selectedIndex: number;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            mode: "fixed" | "scrollable";
            value: string;
        } & {
            readonly options: TabItem[];
            readonly selectedIndex: number;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            mode: "fixed" | "scrollable";
            value: string;
        } & {
            readonly options: TabItem[];
            readonly selectedIndex: number;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Tab extends Tab_base {
}
declare const itemName = "s-tab-item";
declare const itemProps: {
    selected: boolean;
    value: string;
};
declare const TabItem_base: {
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
export declare class TabItem extends TabItem_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: Tab;
        [itemName]: TabItem;
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
        } & Tab;
        [itemName]: new () => {
            /**
            * @deprecated
            **/
            $props: HTMLAttributes & Partial<typeof itemProps>;
        } & TabItem;
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
