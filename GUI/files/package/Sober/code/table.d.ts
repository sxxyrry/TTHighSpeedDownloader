declare const name = "s-table";
declare const Table_base: {
    new (): {} & {
        addEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Table extends Table_base {
}
declare const theadName = "s-thead";
declare const Thead_base: {
    new (): {} & {
        addEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Thead extends Thead_base {
}
declare const tbodyName = "s-tbody";
declare const Tbody_base: {
    new (): {} & {
        addEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Tbody extends Tbody_base {
}
declare const trName = "s-tr";
declare const Tr_base: {
    new (): {} & {
        addEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Tr extends Tr_base {
}
declare const thName = "s-th";
declare const Th_base: {
    new (): {} & {
        addEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Th extends Th_base {
}
declare const tdName = "s-td";
declare const Td_base: {
    new (): {} & {
        addEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends never>(type: K, listener: (this: {} & /*elided*/ any & HTMLElement, ev: {}[K]) => any, options?: boolean | EventListenerOptions): void;
    } & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export declare class Td extends Td_base {
}
declare global {
    interface HTMLElementTagNameMap {
        [name]: Table;
        [theadName]: Thead;
        [tbodyName]: Tbody;
        [trName]: Tr;
        [thName]: Th;
        [tdName]: Td;
    }
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                [name]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
                [theadName]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
                [tbodyName]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
                [trName]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
                [thName]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
                [tdName]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
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
        } & Table;
        [theadName]: new () => {
            /**
            * @deprecated
            **/
            $props: HTMLAttributes;
        } & Thead;
        [tbodyName]: new () => {
            /**
            * @deprecated
            **/
            $props: HTMLAttributes;
        } & Tbody;
        [trName]: new () => {
            /**
            * @deprecated
            **/
            $props: HTMLAttributes;
        } & Tr;
        [thName]: new () => {
            /**
            * @deprecated
            **/
            $props: HTMLAttributes;
        } & Th;
        [tdName]: new () => {
            /**
            * @deprecated
            **/
            $props: HTMLAttributes;
        } & Td;
    }
}
declare module 'vue/jsx-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: IntrinsicElements['div'];
            [tbodyName]: HTMLAttributes;
            [trName]: HTMLAttributes;
            [thName]: HTMLAttributes;
            [tdName]: HTMLAttributes;
        }
    }
}
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSX.HTMLAttributes<HTMLElement>;
            [theadName]: JSX.HTMLAttributes;
            [tbodyName]: JSX.HTMLAttributes;
            [trName]: JSX.HTMLAttributes;
            [thName]: JSX.HTMLAttributes;
            [tdName]: JSX.HTMLAttributes;
        }
    }
}
declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            [name]: JSXInternal.HTMLAttributes<HTMLElement>;
            [theadName]: JSXInternal.HTMLAttributes;
            [tbodyName]: JSXInternal.HTMLAttributes;
            [trName]: JSXInternal.HTMLAttributes;
            [thName]: JSXInternal.HTMLAttributes;
            [tdName]: JSXInternal.HTMLAttributes;
        }
    }
}
export {};
