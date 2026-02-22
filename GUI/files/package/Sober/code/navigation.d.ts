import './ripple.js';
declare const name = "s-navigation";
declare const props: {
    mode: "bottom" | "rail";
    value: string;
};
declare const Navigation_base: {
    new (): {
        mode: "bottom" | "rail";
        value: string;
    } & {
        readonly options: NavigationItem[];
        readonly selectedIndex: number;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            mode: "bottom" | "rail";
            value: string;
        } & {
            readonly options: NavigationItem[];
            readonly selectedIndex: number;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            mode: "bottom" | "rail";
            value: string;
        } & {
            readonly options: NavigationItem[];
            readonly selectedIndex: number;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Navigation extends Navigation_base {
}
declare const itemName = "s-navigation-item";
declare const itemProps: {
    selected: boolean;
    value: string;
};
declare const NavigationItem_base: {
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
export declare class NavigationItem extends NavigationItem_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: Navigation;
        [itemName]: NavigationItem;
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
        } & Navigation;
        [itemName]: new () => {
            /**
            * @deprecated
            **/
            $props: HTMLAttributes & Partial<typeof itemProps>;
        } & NavigationItem;
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
