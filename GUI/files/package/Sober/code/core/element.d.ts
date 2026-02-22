type Prop = string | number | boolean;
export declare const supports: {
    CSSStyleSheet: boolean;
    CSSContainer: boolean;
};
export declare const useProps: <const T extends {
    [key: string]: Prop | string[];
} = {}>(options: T) => { -readonly [K in keyof T as K extends `$${infer NK}` ? NK : K]: T[K] extends string[] ? T[K][number] : T[K] extends string ? string : T[K] extends number ? number : T[K] extends boolean ? boolean : never; };
export declare const useEvents: <T extends {
    [key: string]: typeof Event | typeof CustomEvent<any>;
}>(options: T) => { [K in keyof T]: InstanceType<T[K]>; };
type ComponentOptions<Props extends {
    [key: string]: Prop;
} = {}, Expose extends {
    [key: string]: any;
} = {}, Events extends {
    [key: string]: Event | CustomEvent;
} = {}, Methods extends {
    [key: string]: any;
} = {}> = {
    style?: string | string[];
    props?: Props;
    events?: Events;
    methods?: Methods;
    template?: string;
    setup?: (this: Props & Methods & HTMLElement, shadowRoot: ShadowRoot) => ({
        onMounted?: () => void;
        onUnmounted?: () => void;
        onAdopted?: () => void;
        expose?: Expose & {
            [K in keyof Props]?: never;
        };
    } & {
        [K in keyof Props]?: ((v: Props[K], old: Props[K]) => void) | {
            get?: (old: Props[K]) => Props[K];
            set?: (v: Props[K], old: Props[K]) => void;
        };
    }) | void;
};
type ComponentReturn<Props, Expose, Events, OnEvents> = Props & Expose & OnEvents & {
    addEventListener<K extends keyof Events>(type: K, listener: (this: ComponentReturn<Props, Expose, Events, OnEvents>, ev: Events[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof Events>(type: K, listener: (this: ComponentReturn<Props, Expose, Events, OnEvents>, ev: Events[K]) => any, options?: boolean | EventListenerOptions): void;
} & HTMLElement;
export declare const useElement: <Props extends {
    [key: string]: Prop;
} = {}, Expose extends {
    [key: string]: any;
} = {}, Events extends {
    [key: string]: Event | CustomEvent;
} = {}, Methods extends {
    [key: string]: any;
} = {}>(options: ComponentOptions<Props, Expose, Events, Methods>) => {
    new (): ComponentReturn<Props, Expose, Events, { [K in keyof Events as K extends string ? `on${K}` : never]: ((event: Events[K]) => void) | null; }>;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
} & Methods;
export {};
