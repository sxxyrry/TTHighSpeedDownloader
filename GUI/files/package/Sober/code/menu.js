import { useElement, useProps } from './core/element.js';
import './ripple.js';
const name = 's-menu';
const style = /*css*/ `
:host{
  display: flex;
  flex-direction: column;
  font-size: .875rem;
  padding: 4px 0;
  background: var(--s-color-surface-container-low, ${"#F2F4F5" /* Theme.colorSurfaceContainerLow */});
}
:host(:nth-of-type(n+2)){
  border-top: solid 1px var(--s-color-surface-variant, ${"#DCE4E8" /* Theme.colorSurfaceVariant */});
}
::slotted([slot=label]){
  display: flex;
  align-items: center;
  height: 44px;
  margin: -4px 20px;
  font-size: .75rem;
  color: var(--s-color-on-surface-variant, ${"#40484C" /* Theme.colorOnSurfaceVariant */});
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
}
`;
const template = /*html*/ `
<slot name="label"></slot>
<slot></slot>
`;
export class Menu extends useElement({ style, template }) {
}
const itemName = 's-menu-item';
const itemProps = useProps({
    checked: false,
    folded: true
});
const itemStyle = /*css*/ `
:host{
  display: flex;
  flex-direction: column;
  margin: 4px 8px 4px 0;
  color: var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */});
}
.container{
  display: flex;
  align-items: center;
  height: 40px;
  border-radius: 0 24px 24px 0;
  padding: 0 20px;
  flex-shrink: 0;
}
:host([checked=true]) .container{
  background: var(--s-color-secondary-container, ${"#CFE6F1" /* Theme.colorSecondaryContainer */});
  color: var(--s-color-on-secondary-container, ${"#354A53" /* Theme.colorOnSecondaryContainer */});
}
.text{
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.toggle-icon{
  width: 24px;
  height: 24px;
  display: none;
  margin-right: -8px;
  margin-left: 12px;
  transform: rotate(-90deg);
  transition: transform var(--s-motion-duration-short4, ${"200ms" /* Theme.motionDurationShort4 */}) var(--s-motion-easing-standard, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */});
  fill: var(--s-color-on-surface-variant, ${"#40484C" /* Theme.colorOnSurfaceVariant */});
}
.show-menu .toggle-icon{
  display: block;
}
:host([folded=false]) .toggle-icon{
  transform: rotate(0deg);
}
.fold{
  flex-shrink: 0;
}
.show-menu+.fold{
  margin: 0 -8px 0 0;
}
.menu{
  display: block;
  padding-top: 8px;
}
::slotted(:is(svg, s-icon)){
  color: var(--s-color-on-surface-variant, ${"#40484C" /* Theme.colorOnSurfaceVariant */});
  fill: currentColor;
  height: 24px;
  width: 24px;
}
:host([checked=true]) ::slotted(:is(svg, s-icon)){
  color: currentColor;
}
::slotted([slot]){
  flex-shrink: 0;
}
::slotted([slot=start]){
  margin-left: -4px;
  margin-right: 12px;
}
::slotted([slot=end]){
  margin-right: -8px;
  margin-left: 12px;
}
::slotted([slot=menu]){
  background: var(--s-color-surface-container-high, ${"#E7E8EA" /* Theme.colorSurfaceContainerHigh */});
}
`;
const itemTemplate = /*html*/ `
<s-ripple class="container" part="container">
  <slot name="start"></slot>
  <div class="text" part="text">
    <slot></slot>
  </div>
  <slot name="end">
    <svg viewBox="0 -960 960 960" class="toggle-icon">
      <path d="M480-360 280-560h400L480-360Z"></path>
    </svg>
  </slot>
</s-ripple>
<s-fold class="fold" part="fold" folded="${itemProps.folded}">
  <slot name="menu" class="menu"></slot>
</s-fold>
`;
export class MenuItem extends useElement({
    style: itemStyle,
    template: itemTemplate,
    props: itemProps,
    setup(shadowRoot) {
        const container = shadowRoot.querySelector('.container');
        const fold = shadowRoot.querySelector('.fold');
        const menu = shadowRoot.querySelector('slot[name=menu]');
        fold.onclick = (event) => event.stopPropagation();
        menu.onslotchange = () => container.classList[menu.assignedElements().length > 0 ? 'add' : 'remove']('show-menu');
        container.onclick = () => {
            if (!container.classList.contains('show-menu'))
                return;
            this.folded = !this.folded;
        };
        return {
            folded: (value) => fold.folded = value
        };
    }
}) {
}
Menu.define(name);
MenuItem.define(itemName);
