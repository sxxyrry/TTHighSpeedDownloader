export class I18n {
    list;
    locale = navigator.language;
    updates = new Map();
    constructor(list) {
        this.list = list;
    }
    getItem(name) {
        name = name || this.locale;
        if (name in this.list)
            return this.list[name];
        const [def] = name.split('-');
        if (def in this.list)
            return this.list[def];
        return this.list.zh;
    }
    addItem(name, item) {
        if (this.list[name])
            throw new Error(`Locale ${name} already exists`);
        this.list[name] = item;
    }
    setLocale(name) {
        this.locale = name ?? navigator.language;
        this.updates.forEach((item) => item());
    }
}
