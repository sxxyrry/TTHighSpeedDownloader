import { useElement, supports } from './core/element.js';
const name = 's-appbar';
const style = /*css*/ `
:host{
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 8px;
  box-sizing: border-box;
  container-name: s-appbar;
  container-type: inline-size;
  background: var(--s-color-surface-container, ${"#ECEEF0" /* Theme.colorSurfaceContainer */});
}
::slotted([slot=navigation]){
  margin-left: 4px;
  flex-shrink: 0;
}
::slotted([slot=logo]){
  margin-left: 12px;
  height: 32px;
  color: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
  fill: currentColor;
  flex-shrink: 0;
}
::slotted([slot=headline]){
  font-size: 1.5rem;
  font-weight: bold;
  overflow: hidden;
  text-transform: capitalize;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 12px;
  color: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
}
.view{
  flex-grow: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  height: 64px;
  max-height: 100%;
  justify-content: flex-end;
}
.view.s-laptop{
  height: 56px;
}
.view.s-tablet ::slotted(s-search[slot=search]){
  width: auto;
  flex-grow: 1;
}
::slotted([slot=action]){
  margin: 0 4px;
  flex-shrink: 0;
}
::slotted(s-search[slot=search]){
  flex-shrink: 0;
  margin: 0 4px 0 8px;
}
@container s-appbar (max-width: ${1024 /* mediaQueries.laptop */}px){
  .view{
    height: 56px;
  }
}
@container s-appbar (max-width: ${768 /* mediaQueries.tablet */}px){
  ::slotted(s-search[slot=search]){
    width: auto;
    flex-grow: 1;
  }
}
`;
const template = /*html*/ `
<slot name="start"></slot>
<slot name="navigation"></slot>
<slot name="logo"></slot>
<slot name="headline"></slot>
<div class="view" part="view">
  <slot></slot>
  <slot name="search"></slot>
</div>
<slot name="action"></slot>
<slot name="end"></slot>
`;
class Appbar extends useElement({
    style, template,
    setup(shadowRoot) {
        const view = shadowRoot.querySelector('.view');
        if (!supports.CSSContainer) {
            new ResizeObserver(() => {
                view.classList.toggle('s-laptop', this.offsetWidth <= 1024 /* mediaQueries.laptop */);
                view.classList.toggle('s-tablet', this.offsetWidth <= 768 /* mediaQueries.tablet */);
            }).observe(this);
        }
    }
}) {
}
Appbar.define(name);
export { Appbar };
