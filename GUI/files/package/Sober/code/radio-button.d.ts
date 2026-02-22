import './ripple.js';
declare const name = "s-radio-button";
declare const props: {
    disabled: boolean;
    checked: boolean;
    name: string;
    value: string;
};
declare const RadioButton_base: {
    new (): {
        disabled: boolean;
        checked: boolean;
        name: string;
        value: string;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            disabled: boolean;
            checked: boolean;
            name: string;
            value: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            disabled: boolean;
            checked: boolean;
            name: string;
            value: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class RadioButton extends RadioButton_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: RadioButton;
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
        } & RadioButton;
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
