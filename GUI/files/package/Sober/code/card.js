import { useElement, useProps } from './core/element.js';
import './ripple.js';
const name = 's-card';
const props = useProps({
    type: ['elevated', 'filled', 'outlined'],
    clickable: false
});
const style = /*css*/ `
:host{
  display: inline-block;
  vertical-align: middle;
  border-radius: 12px;
  position: relative;
  font-size: .875rem;
  box-sizing: border-box;
  max-width: 280px;
  overflow: hidden;
  color: var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */});
  background: var(--s-color-surface-container-low, ${"#F2F4F5" /* Theme.colorSurfaceContainerLow */});
  box-shadow: var(--s-elevation-level1, ${"0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel1 */});
}
:host([type=filled]){
  box-shadow: none;
  background: var(--s-color-surface-container-highest, ${"#E1E3E4" /* Theme.colorSurfaceContainerHighest */});
}
:host([type=outlined]){
  box-shadow: none;
  background: var(--s-color-surface, ${"#F8F9FB" /* Theme.colorSurface */});
  border: solid 1px var(--s-color-outline-variant, ${"#C0C8CC" /* Theme.colorOutlineVariant */});
}
:host([clickable=true]){
  cursor: pointer;
  transition: box-shadow var(--s-motion-duration-short4, ${"200ms" /* Theme.motionDurationShort4 */}) var(--s-motion-easing-standard, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */});
}
:host([clickable=true]) .ripple{
  display: block;
}
.action{
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 16px;
}
.ripple{
  display: none;
  border-radius: 0;
}
::slotted([slot=image]){
  display: block;
  max-height: 160px;
  min-height: 96px;
  width: 100%;
  object-fit: cover;
  background: var(--s-color-surface-container, ${"#ECEEF0" /* Theme.colorSurfaceContainer */});
}
::slotted([slot=headline]){
  font-size: 1.375rem;
  line-height: 22px;
  margin: 12px 16px;
}
::slotted([slot=subhead]){
  font-size: 1rem;
  margin: -8px 16px 12px 16px;
}
::slotted([slot=text]){
  line-height: 22px;
  margin: 12px 16px;
  color: var(--s-color-on-surface-variant, ${"#40484C" /* Theme.colorOnSurfaceVariant */});
}
::slotted(s-button[slot=action]){
  margin-bottom: 16px;
}
::slotted([slot=headline]+[slot=subhead]){
  background: red;
}
@media (pointer: fine){
  :host([clickable=true][type=filled]:hover),
  :host([clickable=true][type=outlined]:hover){
    box-shadow: var(--s-elevation-level1, ${"0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel1 */});
  }
  :host([clickable=true]:hover){
    box-shadow: var(--s-elevation-level2, ${"0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel2 */});
  }
}
`;
const template = /*html*/ `
<slot name="start"></slot>
<slot name="image"></slot>
<slot name="headline"></slot>
<slot name="subhead"></slot>
<slot name="text"></slot>
<slot></slot>
<div class="action" part="action">
  <slot name="action"></slot>
</div>
<slot name="end"></slot>
<s-ripple class="ripple" attached="true" part="ripple"></s-ripple>
`;
export class Card extends useElement({
    style, template, props,
    setup(shadowRoot) {
        const action = shadowRoot.querySelector('slot[name=action]');
        action.onpointerdown = (e) => e.stopPropagation();
    }
}) {
}
Card.define(name);
