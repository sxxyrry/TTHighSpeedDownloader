declare const name = "s-drawer";
type SlotName = 'start' | 'end';
declare const Drawer_base: {
    new (): {
        show: (slot?: SlotName, folded?: boolean) => void;
        close: (slot?: SlotName, folded?: boolean) => void;
        toggle: (slot?: SlotName, folded?: boolean) => void;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            show: (slot?: SlotName, folded?: boolean) => void;
            close: (slot?: SlotName, folded?: boolean) => void;
            toggle: (slot?: SlotName, folded?: boolean) => void;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            show: (slot?: SlotName, folded?: boolean) => void;
            close: (slot?: SlotName, folded?: boolean) => void;
            toggle: (slot?: SlotName, folded?: boolean) => void;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Drawer extends Drawer_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: Drawer;
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
        } & Drawer;
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
export {};
