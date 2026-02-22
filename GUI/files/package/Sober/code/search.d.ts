declare const name = "s-search";
declare const props: {
    placeholder: string;
    disabled: boolean;
    value: string;
    maxLength: number;
    readOnly: boolean;
};
declare const Search_base: {
    new (): {
        placeholder: string;
        disabled: boolean;
        value: string;
        maxLength: number;
        readOnly: boolean;
    } & {
        readonly native: HTMLInputElement;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            placeholder: string;
            disabled: boolean;
            value: string;
            maxLength: number;
            readOnly: boolean;
        } & {
            readonly native: HTMLInputElement;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            placeholder: string;
            disabled: boolean;
            value: string;
            maxLength: number;
            readOnly: boolean;
        } & {
            readonly native: HTMLInputElement;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Search extends Search_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: Search;
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
            $props: HTMLAttributes & Partial<typeof props>;
        };
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
