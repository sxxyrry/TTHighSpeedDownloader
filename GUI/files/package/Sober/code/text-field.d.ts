declare const name = "s-text-field";
declare const props: {
    label: string;
    placeholder: string;
    disabled: boolean;
    type: "number" | "text" | "password" | "multiline";
    error: boolean;
    value: string;
    maxLength: number;
    readOnly: boolean;
    multiLine: boolean;
    countered: boolean;
};
declare const TextField_base: {
    new (): {
        label: string;
        placeholder: string;
        disabled: boolean;
        type: "number" | "text" | "password" | "multiline";
        error: boolean;
        value: string;
        maxLength: number;
        readOnly: boolean;
        multiLine: boolean;
        countered: boolean;
    } & {
        readonly native: HTMLInputElement | HTMLTextAreaElement;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            label: string;
            placeholder: string;
            disabled: boolean;
            type: "number" | "text" | "password" | "multiline";
            error: boolean;
            value: string;
            maxLength: number;
            readOnly: boolean;
            multiLine: boolean;
            countered: boolean;
        } & {
            readonly native: HTMLInputElement | HTMLTextAreaElement;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            label: string;
            placeholder: string;
            disabled: boolean;
            type: "number" | "text" | "password" | "multiline";
            error: boolean;
            value: string;
            maxLength: number;
            readOnly: boolean;
            multiLine: boolean;
            countered: boolean;
        } & {
            readonly native: HTMLInputElement | HTMLTextAreaElement;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class TextField extends TextField_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: TextField;
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
        } & TextField;
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
