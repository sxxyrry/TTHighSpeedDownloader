export declare const supports: {
    CSSStyleSheet: boolean;
    CSSContainer: boolean;
};
type Prop = string | number | boolean;
export declare const useElement: <P extends {
    [key: string]: Prop;
} = {}, E extends {} = {}>(options: {
    style?: string;
    props?: P;
    syncProps?: (keyof P)[] | true;
    template?: string;
    setup?: (this: P & HTMLElement, shadowRoot: ShadowRoot) => ({
        onMounted?: () => void;
        onUnmounted?: () => void;
        onAdopted?: () => void;
        expose?: E & { [K in keyof P]?: never; };
    } & { [K in keyof P]?: ((v: P[K], old: P[K]) => void) | {
        get?: (old: P[K]) => P[K];
        set?: (v: P[K], old: P[K]) => void;
    }; }) | void;
}) => {
    new (): P & E & HTMLElement;
    readonly define: (name: string) => void;
    prototype: HTMLElement;
};
export {};
