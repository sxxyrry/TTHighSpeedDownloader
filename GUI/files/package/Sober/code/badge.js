import { useElement } from './core/element.js';
const name = 's-badge';
const style = /*css*/ `
:host{
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 8px;
  height: 8px;
  border-radius: 8px;
  font-size: .625rem;
  vertical-align: middle;
  box-sizing: border-box;
  background: var(--s-color-error, ${"#BA1A1A" /* Theme.colorError */});
  color: var(--s-color-on-error, ${"#ffffff" /* Theme.colorOnError */});
}
:host(:not(:empty)) .text{
  height: 16px;
  padding: 0 5px;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  background: inherit;
  color: inherit;
  box-shadow: inherit;
  border-radius: 8px;
}
`;
const template = /*html*/ `
<slot class="text" part="text"></slot>
`;
class Badge extends useElement({ style, template }) {
}
Badge.define(name);
export { Badge };
