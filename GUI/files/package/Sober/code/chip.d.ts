import './ripple.js';
declare const name = "s-chip";
declare const props: {
    type: "filled" | "outlined";
    value: string;
    checked: boolean;
    disabled: boolean;
    clickable: boolean;
};
declare const Chip_base: {
    new (): {
        type: "filled" | "outlined";
        value: string;
        checked: boolean;
        disabled: boolean;
        clickable: boolean;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            type: "filled" | "outlined";
            value: string;
            checked: boolean;
            disabled: boolean;
            clickable: boolean;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            type: "filled" | "outlined";
            value: string;
            checked: boolean;
            disabled: boolean;
            clickable: boolean;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Chip extends Chip_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: Chip;
    }
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                [name]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Partial<typeof props>;
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
        } & Chip;
    }
}
declare module 'vue/jsx-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: IntrinsicElements['div'] & Partial<typeof props>;
        }
    }
}
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSX.HTMLAttributes<HTMLElement> & Partial<typeof props>;
        }
    }
}
declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSXInternal.HTMLAttributes<HTMLElement> & Partial<typeof props>;
        }
    }
}
export {};
