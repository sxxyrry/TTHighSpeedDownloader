declare const name = "s-page";
declare const props: {
    theme: "auto" | "light" | "dark";
};
declare const Page_base: {
    new (): {
        theme: "auto" | "light" | "dark";
    } & {
        toggle: (theme: (typeof props)["theme"], trigger?: HTMLElement) => Promise<void | Animation>;
        readonly isDark: boolean;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            theme: "auto" | "light" | "dark";
        } & {
            toggle: (theme: (typeof props)["theme"], trigger?: HTMLElement) => Promise<void | Animation>;
            readonly isDark: boolean;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            theme: "auto" | "light" | "dark";
        } & {
            toggle: (theme: (typeof props)["theme"], trigger?: HTMLElement) => Promise<void | Animation>;
            readonly isDark: boolean;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Page extends Page_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: Page;
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
        } & Page;
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
