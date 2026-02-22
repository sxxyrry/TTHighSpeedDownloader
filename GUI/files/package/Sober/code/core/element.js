export const supports = { CSSStyleSheet: true, CSSContainer: CSS.supports('container-type', 'size') };
try {
    new CSSStyleSheet();
}
catch (error) {
    supports.CSSStyleSheet = false;
}
//设置样式
const setStyle = (shadowRoot, cssStr) => {
    for (const css of cssStr) {
        if (!supports.CSSStyleSheet) {
            const el = document.createElement('style');
            el.textContent = css;
            shadowRoot.insertBefore(el, shadowRoot.firstChild);
            continue;
        }
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, sheet];
    }
};
export const useProps = (options) => {
    const props = {};
    const meta = {};
    for (const key in options) {
        let value = options[key];
        const state = { key: key, sync: true, types: [] };
        if (key.startsWith('$')) {
            state.key = key.slice(1);
            state.sync = false;
        }
        if (Array.isArray(value)) {
            state.types = value;
            value = state.types[0];
        }
        props[state.key] = value;
        meta[state.key] = {
            sync: state.sync,
            def: value,
            to: (v) => {
                switch (typeof value) {
                    case 'string':
                        const val = String(v);
                        return state.types.length > 0 ? (state.types.includes(val) ? val : state.types[0]) : val;
                    case 'number':
                        const num = Number(v);
                        return isNaN(num) ? value : num;
                    case 'boolean':
                        return typeof v === 'boolean' ? v : v === 'true';
                }
            }
        };
    }
    Object.defineProperty(props, '$meta', { value: meta });
    return props;
};
//注册事件
export const useEvents = (options) => {
    return options;
};
const baseStyle = /*css*/ `
:host{
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}
*{
  outline: none;
}
`;
//注册组件
export const useElement = (options) => {
    const state = {
        observedAttributes: [],
        upperPropKeys: {},
        metaProps: options.props?.$meta ?? {},
        events: []
    };
    for (const key in state.metaProps ?? {}) {
        const value = key.toLowerCase();
        state.observedAttributes.push(value);
        state.upperPropKeys[value] = key;
    }
    for (const key in options.events) {
        const k = `on${key}`;
        state.observedAttributes.push(k);
        if (k in HTMLElement.prototype)
            continue;
        state.events.push(k);
    }
    const map = new Map();
    class Component extends HTMLElement {
        static observedAttributes = state.observedAttributes;
        static define(name) {
            customElements.define(name, this);
        }
        constructor() {
            super();
            const shadowRoot = this.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = options.template ?? '';
            setStyle(shadowRoot, [baseStyle, ...options.style ? (Array.isArray(options.style) ? options.style : [options.style]) : []]);
            const props = { ...options.props };
            let setup;
            const ahead = {};
            for (const key in props) {
                const initValue = this[key];
                if (initValue !== undefined)
                    ahead[key] = initValue;
                Object.defineProperty(this, key, {
                    configurable: true,
                    get: () => {
                        const call = setup?.[key];
                        if (!call || typeof call === 'function' || !call.get)
                            return props[key];
                        return call.get?.(props[key]);
                    },
                    set: (v) => {
                        const meta = state.metaProps[key];
                        const value = v === undefined ? meta.def : meta.to(v);
                        if (meta.sync) {
                            const lowerKey = key.toLowerCase();
                            const attrValue = this.getAttribute(lowerKey);
                            const valueStr = String(value);
                            if (value === meta.def && attrValue !== null)
                                return this.removeAttribute(lowerKey);
                            if (value !== meta.def && attrValue !== valueStr)
                                return this.setAttribute(lowerKey, valueStr);
                        }
                        if (value === this[key])
                            return;
                        const old = props[key];
                        props[key] = value;
                        const call = setup?.[key];
                        if (!call)
                            return;
                        try {
                            typeof call === 'function' ? call(value, old) : call.set?.(value, old);
                        }
                        catch (error) {
                            props[key] = old;
                            throw error;
                        }
                    }
                });
            }
            //自定义事件
            const customEvents = {};
            for (const key of state.events) {
                const k = key;
                if (typeof this[k] === 'function') {
                    customEvents[key] = this[k];
                }
                Object.defineProperty(this, key, {
                    configurable: true,
                    get: () => customEvents[key] ?? null,
                    set: (v) => customEvents[key] = typeof v === 'function' ? v : undefined
                });
                this.addEventListener(key.slice(2), (event) => customEvents[key] && customEvents[key].bind(this)(event));
            }
            setup = options.setup?.call(this, shadowRoot);
            // //导出expose
            for (const key in setup?.expose ?? {})
                Object.defineProperty(this, key, { get: () => setup?.expose?.[key] });
            //重新赋值
            for (const key in ahead)
                this[key] = ahead[key];
            //@ts-ignore 清除生命周期
            this.connectedCallback = this.disconnectedCallback = this.adoptedCallback = this.attributeChangedCallback = undefined;
            map.set(this, setup);
        }
        connectedCallback() {
            map.get(this)?.onMounted?.();
        }
        disconnectedCallback() {
            map.get(this)?.onUnmounted?.();
        }
        adoptedCallback() {
            map.get(this)?.onAdopted?.();
        }
        attributeChangedCallback(key, _, value) {
            if (state.events.includes(key))
                return this[key] = (value ? new Function('event', value) : null);
            this[state.upperPropKeys[key]] = (value ?? undefined);
        }
    }
    for (const key in options.methods) {
        Component[key] = options.methods[key];
    }
    return Component;
};
