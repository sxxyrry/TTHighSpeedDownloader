import './ripple.js';
declare const name = "s-icon-button";
declare const props: {
    disabled: boolean;
    type: "filled" | "filled-tonal" | "outlined" | "standard";
};
declare const IconButton_base: {
    new (): {
        disabled: boolean;
        type: "filled" | "filled-tonal" | "outlined" | "standard";
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            disabled: boolean;
            type: "filled" | "filled-tonal" | "outlined" | "standard";
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            disabled: boolean;
            type: "filled" | "filled-tonal" | "outlined" | "standard";
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class IconButton extends IconButton_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: IconButton;
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
        } & IconButton;
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
