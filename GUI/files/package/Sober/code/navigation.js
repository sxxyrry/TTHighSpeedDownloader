import { useElement, useProps } from './core/element.js';
import { Select } from './core/utils/select.js';
import './ripple.js';
const name = 's-navigation';
const props = useProps({
    mode: ['bottom', 'rail'],
    $value: ''
});
const style = /*css*/ `
:host{
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: var(--s-color-surface, ${"#F8F9FB" /* Theme.colorSurface */});
  box-shadow: var(--s-elevation-level2, ${"0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel2 */});
  position: relative;
  padding-bottom: env(safe-area-inset-bottom);
}
:host([mode=rail]){
  flex-direction: column;
  justify-content: flex-start;
  width: 80px;
  box-shadow: none;
  height: 100%;
  background: none;
  padding-bottom: 0;
}
::slotted(s-navigation-item){
  height: 64px;
}
:host([mode=rail]) ::slotted(s-navigation-item){
  height: 72px;
}
:host([mode=rail]) ::slotted(s-icon-button[slot=start]){
  width: 56px;
  height: 56px;
  margin: 16px 0 8px 0;
  border-radius: 12px;
}
:host([mode=rail]) ::slotted([slot=end]){
  flex-grow: 1;
}
`;
const template = /*html*/ `
<slot name="start"></slot>
<slot id="slot"></slot>
<slot name="end"></slot>
`;
export class Navigation extends useElement({
    style, template, props,
    setup(shadowRoot) {
        const slot = shadowRoot.querySelector('#slot');
        const select = new Select({ context: this, class: NavigationItem, slot });
        return {
            expose: {
                get options() {
                    return select.list;
                },
                get selectedIndex() {
                    return select.selectedIndex;
                }
            },
            value: {
                get: () => select.value,
                set: (value) => select.value = value
            }
        };
    }
}) {
}
const itemName = 's-navigation-item';
const itemProps = useProps({
    selected: false,
    $value: ''
});
const itemStyle = /*css*/ `
:host{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  font-size: .75rem;
  font-weight: 500;
  box-sizing: border-box;
  width: 100%;
  max-width: 80px;
  text-transform: capitalize;
  transition: color var(--s-motion-duration-short4, ${"400ms" /* Theme.motionDurationMedium4 */}) var(--s-motion-easing-emphasized, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingEmphasized */});
  color: var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */});
}
:host([selected=true]){
  color: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
}
.icon{
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28px;
  width: 48px;
  border-radius: 14px;
  transition: background-color var(--s-motion-duration-short4, ${"400ms" /* Theme.motionDurationMedium4 */}) var(--s-motion-easing-emphasized, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingEmphasized */});
}
:host([selected=true]) .icon{
  background: var(--s-color-secondary-container, ${"#CFE6F1" /* Theme.colorSecondaryContainer */});
}
::slotted(*){
  flex-shrink: 0;
}
::slotted(svg){
  color: var(--s-color-on-surface-variant, ${"#40484C" /* Theme.colorOnSurfaceVariant */});
  fill: currentColor;
  width: 24px;
  height: 24px;
}
:host([selected=true]) ::slotted(:is(svg, s-icon)){
  color: currentColor;
}
::slotted([slot=badge]){
  position: absolute;
  right: 4px;
  top: 0;
}
::slotted([slot=text]){
  margin-top: 4px;
}
`;
const itemTemplate = /*html*/ `
<s-ripple attached="true" class="icon" part="icon">
  <slot name="icon"></slot>
  <slot name="badge"></slot>
</s-ripple>
<slot name="text"></slot>
`;
export class NavigationItem extends useElement({
    style: itemStyle,
    template: itemTemplate,
    props: itemProps,
    setup() {
        this.addEventListener('click', () => {
            if (this.selected)
                return;
            if (!(this.parentNode instanceof Navigation))
                return;
            this.dispatchEvent(new Event(`${name}:select`, { bubbles: true }));
        });
        return {
            selected: () => {
                if (!(this.parentNode instanceof Navigation))
                    return;
                this.dispatchEvent(new Event(`${name}:update`, { bubbles: true }));
            }
        };
    }
}) {
}
Navigation.define(name);
NavigationItem.define(itemName);
