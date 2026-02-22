declare const name = "s-icon";
declare const props: {
    name: "search" | "menu" | "close" | "none" | "arrow_back" | "arrow_drop_up" | "more_vert" | "chevron_up" | "home" | "add" | "arrow_forward" | "arrow_upward" | "arrow_downward" | "arrow_drop_down" | "arrow_drop_left" | "arrow_drop_right" | "more_horiz" | "done" | "chevron_down" | "chevron_left" | "chevron_right" | "light_mode" | "dark_mode" | "star" | "favorite";
    src: string;
};
declare const Icon_base: {
    new (): {
        name: "search" | "menu" | "close" | "none" | "arrow_back" | "arrow_drop_up" | "more_vert" | "chevron_up" | "home" | "add" | "arrow_forward" | "arrow_upward" | "arrow_downward" | "arrow_drop_down" | "arrow_drop_left" | "arrow_drop_right" | "more_horiz" | "done" | "chevron_down" | "chevron_left" | "chevron_right" | "light_mode" | "dark_mode" | "star" | "favorite";
        src: string;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            name: "search" | "menu" | "close" | "none" | "arrow_back" | "arrow_drop_up" | "more_vert" | "chevron_up" | "home" | "add" | "arrow_forward" | "arrow_upward" | "arrow_downward" | "arrow_drop_down" | "arrow_drop_left" | "arrow_drop_right" | "more_horiz" | "done" | "chevron_down" | "chevron_left" | "chevron_right" | "light_mode" | "dark_mode" | "star" | "favorite";
            src: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            name: "search" | "menu" | "close" | "none" | "arrow_back" | "arrow_drop_up" | "more_vert" | "chevron_up" | "home" | "add" | "arrow_forward" | "arrow_upward" | "arrow_downward" | "arrow_drop_down" | "arrow_drop_left" | "arrow_drop_right" | "more_horiz" | "done" | "chevron_down" | "chevron_left" | "chevron_right" | "light_mode" | "dark_mode" | "star" | "favorite";
            src: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Icon extends Icon_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: Icon;
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
        } & Icon;
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
