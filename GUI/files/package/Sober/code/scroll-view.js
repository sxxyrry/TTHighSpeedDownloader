import { useElement } from './core/element.js';
const name = 's-scroll-view';
const style = /*css*/ `
:host{
  display: block;
  overflow: auto;
}
@media (pointer: fine){
  :host::-webkit-scrollbar{
    background: transparent;
    width: 6px;
    height: 6px;
  }
  :host::-webkit-scrollbar-thumb{
    background: var(--s-color-outline-variant, ${"#C0C8CC" /* Theme.colorOutlineVariant */});
    border-radius: 3px;
  }
  @supports not selector(::-webkit-scrollbar){
    :host{
      scrollbar-color: var(--s-color-outline-variant, ${"#C0C8CC" /* Theme.colorOutlineVariant */}) transparent;
    }
  }
}
`;
const template = /*html*/ `<slot></slot>`;
class ScrollView extends useElement({ style, template }) {
}
ScrollView.define(name);
export { ScrollView };
