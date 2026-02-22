import { useElement } from './core/element.js';
const name = 's-divider';
const style = /*css*/ `
:host{
  display: flex;
  align-items: center;
  margin: 0 16px;
  gap: 8px;
  font-size: .75rem;
  color: var(--s-color-outline, ${"#70787D" /* Theme.colorOutline */});
 }
:host::before,
:host::after{
  content: '';
  flex-grow: 1;
  border-top: solid 1px var(--s-color-outline-variant, ${"#C0C8CC" /* Theme.colorOutlineVariant */});
}
:host(:empty){
  gap: 0;
}
`;
const template = /*html*/ `<slot></slot>`;
class Divider extends useElement({ style, template }) {
}
Divider.define(name);
export { Divider };
