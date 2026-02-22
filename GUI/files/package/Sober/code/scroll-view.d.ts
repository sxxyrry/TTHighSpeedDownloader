declare const name = "s-scroll-view";
declare const ScrollView_base: {
    new (): {} & {
        addEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
declare class ScrollView extends ScrollView_base {
}
export { ScrollView };
declare global {
    interface HTMLElementTagNameMap {
        [name]: ScrollView;
    }
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                [name]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
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
            $props: HTMLAttributes;
        } & ScrollView;
    }
}
declare module 'vue/jsx-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: IntrinsicElements['div'];
        }
    }
}
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSX.HTMLAttributes<HTMLElement>;
        }
    }
}
declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSXInternal.HTMLAttributes<HTMLElement>;
        }
    }
}
