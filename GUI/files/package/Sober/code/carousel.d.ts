import './ripple.js';
declare const name = "s-carousel";
declare const props: {
    value: string;
    autoplay: boolean;
    duration: number;
};
declare const Carousel_base: {
    new (): {
        value: string;
        autoplay: boolean;
        duration: number;
    } & {
        readonly options: CarouselItem[];
        readonly selectedIndex: number;
        togglePrevious: () => void;
        toggleNext: () => void;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            value: string;
            autoplay: boolean;
            duration: number;
        } & {
            readonly options: CarouselItem[];
            readonly selectedIndex: number;
            togglePrevious: () => void;
            toggleNext: () => void;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            value: string;
            autoplay: boolean;
            duration: number;
        } & {
            readonly options: CarouselItem[];
            readonly selectedIndex: number;
            togglePrevious: () => void;
            toggleNext: () => void;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Carousel extends Carousel_base {
}
declare const itemName = "s-carousel-item";
declare const itemProps: {
    selected: boolean;
    value: string;
};
declare const CarouselItem_base: {
    new (): {
        selected: boolean;
        value: string;
    } & {} & {
        addEventListener<K extends never>(type: K, listener: (this: {
            selected: boolean;
            value: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {
            selected: boolean;
            value: string;
        } & {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class CarouselItem extends CarouselItem_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: Carousel;
        [itemName]: CarouselItem;
    }
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                [name]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Partial<typeof props>;
                [itemName]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Partial<typeof itemProps>;
            }
        }
    }
}
declare module 'vue' {
    import { HTMLAttributes } from 'vue';
    interface GlobalComponents {
        [name]: new () => {
            $props: HTMLAttributes & Partial<typeof props>;
        } & Carousel;
        [itemName]: new () => {
            $props: HTMLAttributes & Partial<typeof itemProps>;
        } & CarouselItem;
    }
}
declare module 'vue/jsx-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: IntrinsicElements['div'] & Partial<typeof props>;
            [itemName]: IntrinsicElements['div'] & Partial<typeof itemProps>;
        }
    }
}
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSX.ButtonHTMLAttributes<HTMLElement> & Partial<typeof props>;
            [itemName]: JSX.ButtonHTMLAttributes<HTMLElement> & Partial<typeof itemProps>;
        }
    }
}
declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSXInternal.HTMLAttributes<HTMLElement> & Partial<typeof props>;
            [itemName]: JSXInternal.HTMLAttributes<HTMLElement> & Partial<typeof itemProps>;
        }
    }
}
export {};
