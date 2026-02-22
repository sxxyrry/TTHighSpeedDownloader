export declare class I18n<T> {
    list: {
        [key: string]: T;
    };
    locale: string;
    updates: Map<HTMLElement, Function>;
    constructor(list: {
        [key: string]: T;
    });
    getItem(name: string): T;
    addItem(name: string, item: T): void;
    setLocale(name?: string): void;
}
