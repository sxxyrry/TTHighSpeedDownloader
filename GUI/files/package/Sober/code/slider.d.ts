declare const name = "s-slider";
declare const props: {
    disabled: boolean;
    labeled: boolean;
    max: number;
    min: number;
    step: number;
    value: number;
};
declare const Slider_base: {
    new (): {
        disabled: boolean;
        labeled: boolean;
        max: number;
        min: number;
        step: number;
        value: number;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            disabled: boolean;
            labeled: boolean;
            max: number;
            min: number;
            step: number;
            value: number;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            disabled: boolean;
            labeled: boolean;
            max: number;
            min: number;
            step: number;
            value: number;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Slider extends Slider_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: Slider;
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
        } & Slider;
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
