type Locale = {
    display: (date: Date) => string;
    displayMonth: (date: Date) => string;
    displayWeeks: string[];
};
declare const name = "s-date";
declare const props: {
    value: string;
    locale: string;
    max: string;
    min: string;
};
declare const DateElement_base: {
    new (): {
        value: string;
        locale: string;
        max: string;
        min: string;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            value: string;
            locale: string;
            max: string;
            min: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            value: string;
            locale: string;
            max: string;
            min: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
} & {
    addLocale: (name: string, locale: Locale) => void;
    setLocale: (name?: string) => void;
};
declare class DateElement extends DateElement_base {
}
export { DateElement as Date };
declare global {
    interface HTMLElementTagNameMap {
        [name]: DateElement;
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
        } & DateElement;
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
