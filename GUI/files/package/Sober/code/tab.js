import { useElement, useProps } from './core/element.js';
import { convertCSSDuration } from './core/utils/CSSUtils.js';
import { Select } from './core/utils/select.js';
import './ripple.js';
const name = 's-tab';
const props = useProps({
    mode: ['scrollable', 'fixed'],
    $value: ''
});
const style = /*css*/ `
:host{
  display: flex;
  justify-content: flex-start;
  position: relative;
  background: var(--s-color-surface, ${"#F8F9FB" /* Theme.colorSurface */});
  color: var(--s-color-on-surface-variant, ${"#40484C" /* Theme.colorOnSurfaceVariant */});
}
:host::before{
  content: '';
  position: absolute;
  width: 100%;
  border-bottom: solid 1px var(--s-color-surface-variant, ${"#DCE4E8" /* Theme.colorSurfaceVariant */});
  bottom: 0;
  left: 0;
}
.container{
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  scrollbar-width: none;
  overflow-x: auto;
}
.container::-webkit-scrollbar{
  display: none;
}
:host([mode=fixed]) .container{
  overflow: hidden;
  width: 100%;
}
::slotted(s-tab-item){
  flex-shrink: 0;
  flex-basis: auto;
}
:host([mode=fixed]) ::slotted(s-tab-item){
  flex-basis: 100%;
  flex-shrink: 1;
}
`;
const template = /*html*/ `
<div class="container" part="container">
  <slot></slot>
</div>
`;
export class Tab extends useElement({
    style, template, props,
    setup(shadowRoot) {
        const slot = shadowRoot.querySelector('slot');
        const container = shadowRoot.querySelector('.container');
        const select = new Select({ context: this, class: TabItem, slot });
        const computedStyle = getComputedStyle(this);
        const getAnimateOptions = () => {
            const easing = computedStyle.getPropertyValue('--s-motion-easing-standard') || "cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */;
            const duration = computedStyle.getPropertyValue('--s-motion-duration-medium4') || "400ms" /* Theme.motionDurationMedium4 */;
            return { easing: easing, duration: convertCSSDuration(duration) };
        };
        select.onUpdate = (old) => {
            if (select.select && container.scrollWidth !== container.offsetWidth) {
                const left = (select.select.offsetLeft - container.offsetLeft) - (container.offsetWidth / 2 - select.select.offsetWidth / 2);
                container.scrollTo({ left, behavior: 'smooth' });
            }
            if (!old || !select.select || !this.isConnected)
                return;
            const oldRect = old.shadowRoot.querySelector('.indicator').getBoundingClientRect();
            const indicator = select.select.shadowRoot?.querySelector('.indicator');
            const rect = indicator.getBoundingClientRect();
            const offset = oldRect.left - rect.left;
            indicator.style.transform = `translateX(${rect.left > oldRect.left ? offset : Math.abs(offset)}px)`;
            indicator.style.width = `${oldRect.width}px`;
            const animation = indicator.animate([{ transform: `translateX(0)`, width: `${rect.width}px` }], getAnimateOptions());
            animation.onfinish = animation.oncancel = animation.onremove = () => {
                indicator.style.removeProperty('transform');
                indicator.style.removeProperty('width');
            };
        };
        return {
            expose: {
                get options() {
                    return select.list;
                },
                get selectedIndex() {
                    return select.selectedIndex;
                },
            },
            value: {
                get: () => select.value,
                set: (value) => select.value = value
            }
        };
    }
}) {
}
const itemName = 's-tab-item';
const itemProps = useProps({
    selected: false,
    $value: ''
});
const itemStyle = /*css*/ `
:host{
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  position: relative;
  cursor: pointer;
  font-size: .875rem;
  font-weight: 500;
  text-transform: capitalize;
  padding: 0 16px;
}
:host([selected=true]){
  color: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
}
.container{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  min-height: inherit;
}
.indicator{
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
  border-radius: 1.5px 1.5px 0 0;
  opacity: 0;
}
:host([selected=true]) .indicator{
  opacity: 1;
}
.text{
  display: flex;
  align-items: center;
  line-height: 1;
}
::slotted([slot=icon]){
  width: 24px;
  height: 24px;
  color: currentColor;
  fill: currentColor;
  margin: 10px 0;
}
::slotted([slot=text]){
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 1;
}
.icon ::slotted([slot=text]){
  margin-top: -6px;
  height: 26px;
}
::slotted([slot=badge]){
  margin-left: 4px;
}
::slotted([slot=badge]:not(:empty)){
  width: auto;
}
.icon ::slotted([slot=badge]){
  position: absolute;
  right: 0;
  width: 8px;
  top: 12px;
  margin-left: 0;
}
`;
const itemTemplate = /*html*/ `
<div class="container" part="container">
  <slot name="icon"></slot>
  <div class="text" part="text">
    <slot name="text"></slot>
    <slot name="badge"></slot>
  </div>
  <div class="indicator" part="indicator"></div>
</div>
<s-ripple attached="true" part="ripple"></s-ripple>
`;
export class TabItem extends useElement({
    style: itemStyle,
    template: itemTemplate,
    props: itemProps,
    setup(shadowRoot) {
        const container = shadowRoot.querySelector('.container');
        shadowRoot.querySelector('[name=icon]').addEventListener('slotchange', (event) => {
            const slot = event.target;
            const length = slot.assignedElements().length;
            container.classList[length > 0 ? 'add' : 'remove']('icon');
        });
        this.addEventListener('click', () => {
            if (!(this.parentNode instanceof Tab) || this.selected)
                return;
            this.dispatchEvent(new Event(`${name}:select`, { bubbles: true }));
        });
        return {
            selected: () => {
                if (!(this.parentNode instanceof Tab))
                    return;
                this.dispatchEvent(new Event(`${name}:update`, { bubbles: true }));
            },
        };
    }
}) {
}
Tab.define(name);
TabItem.define(itemName);
