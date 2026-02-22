type Parent = {
    value: string;
} & HTMLElement;
type Item = {
    selected: boolean;
    value: string;
} & HTMLElement;
export declare class Select<P extends Parent, I extends Item> {
    list: I[];
    select?: I;
    selectValue?: string;
    flag: boolean;
    constructor(options: {
        context: P;
        class: {
            new (): I;
        };
        slot: HTMLSlotElement;
    });
    get value(): string;
    set value(value: string);
    get selectedIndex(): number;
    onUpdate?: (old?: I) => void;
    onSelect?: () => void;
    onSlotChange?: () => void;
}
export {};
