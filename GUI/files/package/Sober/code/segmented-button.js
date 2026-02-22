import { useElement, useProps } from './core/element.js';
import { Select } from './core/utils/select.js';
import { convertCSSDuration } from './core/utils/CSSUtils.js';
import './ripple.js';
const name = 's-segmented-button';
const props = useProps({
    $value: '',
    mode: ['auto', 'fixed']
});
const style = /*css*/ `
:host{
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  border-radius: 20px;
  height: 40px;
  padding: 3px;
  overflow: hidden;
  box-sizing: border-box;
  border: solid 1px var(--s-color-surface-variant, ${"#C0C8CC" /* Theme.colorOutlineVariant */});
  background: var(--s-color-surface-container, ${"#ECEEF0" /* Theme.colorSurfaceContainer */});
}
:host([mode=fixed]){
  display: flex;
}
:host([mode=fixed]) ::slotted(s-segmented-button-item){
  flex-basis: 100%;
}
`;
const template = /*html*/ `<slot></slot>`;
export class SegmentedButton extends useElement({
    style, template, props,
    setup(shadowRoot) {
        const slot = shadowRoot.querySelector('slot');
        const select = new Select({ context: this, class: SegmentedButtonItem, slot });
        const computedStyle = getComputedStyle(this);
        const getAnimateOptions = () => {
            const easing = computedStyle.getPropertyValue('--s-motion-easing-standard') || "cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */;
            const duration = computedStyle.getPropertyValue('--s-motion-duration-medium4') || "400ms" /* Theme.motionDurationMedium4 */;
            return { easing: easing, duration: convertCSSDuration(duration) };
        };
        select.onUpdate = (old) => {
            if (!old || !select.select || !this.isConnected)
                return;
            const oldRect = old.shadowRoot.querySelector('.indicator').getBoundingClientRect();
            const indicator = select.select.shadowRoot.querySelector('.indicator');
            const rect = indicator.getBoundingClientRect();
            const offset = oldRect.left - rect.left;
            indicator.style.transform = `translateX(${rect.left > oldRect.left ? offset : Math.abs(offset)}px)`;
            indicator.style.width = `${oldRect.width}px`;
            old.style.zIndex = '1';
            const animation = indicator.animate([{ transform: `translateX(0)`, width: `${rect.width}px` }], getAnimateOptions());
            animation.onfinish = animation.oncancel = animation.onremove = () => {
                indicator.style.removeProperty('transform');
                indicator.style.removeProperty('width');
                old.style.removeProperty('z-index');
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
const itemName = 's-segmented-button-item';
const itemProps = useProps({
    selected: false,
    disabled: false,
    selectable: true,
    $value: ''
});
const itemStyle = /*css*/ `
:host{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-width: 64px;
  padding: 0 16px;
  text-transform: capitalize;
  cursor: pointer;
  font-weight: 500;
  font-size: .8125rem;
  position: relative;
  box-sizing: border-box;
  border-radius: 20px;
  transition: color var(--s-motion-duration-medium4, ${"400ms" /* Theme.motionDurationMedium4 */}) var(--s-motion-easing-standard, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */});
  color: var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */});
}
:host([selected=true]){
  color: var(--s-color-on-primary, ${"#ffffff" /* Theme.colorOnPrimary */});
}
:host([disabled=true]){
  pointer-events: none;
  color: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 38%, transparent);
}
.indicator{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  border-radius: inherit;
  background: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
}
:host([selected=true]) .indicator{
  opacity: 1;
}
::slotted([slot]){
  width: 18px;
  height: 18px;
  color: inherit;
  fill: currentColor;
  flex-shrink: 0;
  position: relative;
}
::slotted([slot=start]){
  margin-right: 4px;
}
::slotted([slot=end]){
  margin-right: 4px;
}
.text{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  position: relative;
}
@supports not (color: color-mix(in srgb, black, white)){
  :host([disabled=true]){
    opacity: .38;
    color: var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */});
  }
}
`;
const itemTemplate = /*html*/ `
<div class="indicator" part="indicator"></div>
<slot name="start"></slot>
<div class="text" part="text">
  <slot></slot>
</div>
<slot name="end"></slot>
<s-ripple attached="true" part="ripple"></s-ripple>
`;
export class SegmentedButtonItem extends useElement({
    style: itemStyle,
    template: itemTemplate,
    props: itemProps,
    setup() {
        this.addEventListener('click', () => {
            if (!(this.parentNode instanceof SegmentedButton) || this.selected)
                return;
            if (this.selectable)
                this.dispatchEvent(new Event(`${name}:select`, { bubbles: true }));
        });
        return {
            selected: () => {
                if (!(this.parentNode instanceof SegmentedButton))
                    return;
                this.dispatchEvent(new CustomEvent(`${name}:update`, { bubbles: true, detail: {} }));
            }
        };
    }
}) {
}
SegmentedButton.define(name);
SegmentedButtonItem.define(itemName);
