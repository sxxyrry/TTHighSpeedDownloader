declare const name = "s-date-picker";
declare const props: {
    value: string;
    min: string;
    max: string;
    label: string;
    positiveText: string;
    negativeText: string;
    format: string;
    locale: string;
};
declare const DatePicker_base: {
    new (): {
        value: string;
        min: string;
        max: string;
        label: string;
        positiveText: string;
        negativeText: string;
        format: string;
        locale: string;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            value: string;
            min: string;
            max: string;
            label: string;
            positiveText: string;
            negativeText: string;
            format: string;
            locale: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            value: string;
            min: string;
            max: string;
            label: string;
            positiveText: string;
            negativeText: string;
            format: string;
            locale: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class DatePicker extends DatePicker_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: DatePicker;
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
        } & DatePicker;
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
