export const supports = { CSSStyleSheet: true, CSSContainer: CSS.supports('container-type', 'size') };
try {
    new CSSStyleSheet();
}
catch (error) {
    supports.CSSStyleSheet = false;
}
const parseType = (value, old) => {
    if (value === undefined)
        return old;
    if (typeof old === 'string')
        return String(value);
    if (typeof old === 'number')
        return Number(value);
    if (typeof old === 'boolean') {
        if (typeof value === 'boolean')
            return value;
        return value === 'true' ? true : false;
    }
    throw new TypeError();
};
const baseStyle = /*css*/ `
:host{
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
`;
const setStyle = (shadowRoot, css) => {
    const all = [baseStyle, css];
    for (const css of all) {
        if (!css)
            continue;
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
export const useElement = (options) => {
    const attrs = [];
    const upperAttrs = {};
    for (const key in options.props) {
        const value = key.toLowerCase();
        attrs.push(value);
        upperAttrs[value] = key;
    }
    const map = new Map();
    class Prototype extends HTMLElement {
        static observedAttributes = attrs;
        static define(name) {
            customElements.define(name, this);
        }
        constructor() {
            super();
            const shadowRoot = this.attachShadow({ mode: 'open' });
            shadowRoot.innerHTML = options.template ?? '';
            setStyle(shadowRoot, options.style);
            const props = { ...options.props };
            const ahead = {};
            for (const key in options.props) {
                const k = key;
                if (this[k] !== undefined) {
                    ahead[key] = this[k];
                }
                this[k] = props[key];
            }
            const setup = options.setup?.apply(this, [shadowRoot]);
            for (const key in options.props) {
                Object.defineProperty(this, key, {
                    configurable: true,
                    get: () => {
                        const call = setup?.[key];
                        if (!call || typeof call === 'function' || !call.get)
                            return props[key];
                        return call.get?.(props[key]);
                    },
                    set: (v) => {
                        const value = parseType(v, options.props[key]);
                        if (value === this[key])
                            return;
                        if (options.syncProps === true || options.syncProps?.includes(key)) {
                            const lowerKey = key.toLowerCase();
                            const attrValue = this.getAttribute(lowerKey);
                            const valueStr = String(value);
                            if (value === options.props?.[key] && attrValue !== null) {
                                this.removeAttribute(lowerKey);
                                return;
                            }
                            if (value !== options.props?.[key] && attrValue !== valueStr) {
                                this.setAttribute(lowerKey, valueStr);
                                return;
                            }
                        }
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
            for (const key in setup?.expose) {
                Object.defineProperty(this, key, { get: () => setup?.expose?.[key] });
            }
            for (const key in ahead) {
                this[key] = ahead[key];
            }
            map.set(this, setup);
            //@ts-ignore
            this.connectedCallback = this.disconnectedCallback = this.adoptedCallback = this.attributeChangedCallback = undefined;
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
            this[upperAttrs[key]] = (value ?? undefined);
        }
    }
    return Prototype;
};
