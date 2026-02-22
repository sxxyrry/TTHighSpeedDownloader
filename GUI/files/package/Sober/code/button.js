import { useElement, useProps } from './core/element.js';
import './ripple.js';
const name = 's-button';
const props = useProps({
    disabled: false,
    type: ['filled', 'elevated', 'filled-tonal', 'outlined', 'text']
});
const style = /*css*/ `
:host{
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  display: inline-flex;
  vertical-align: middle;
  border-radius: 20px;
  padding: 0 24px;
  height: 40px;
  text-transform: capitalize;
  position: relative;
  cursor: pointer;
  font-size: .875rem;
  font-weight: 500;
  max-width: -moz-available;
  max-width: -webkit-fill-available;
  background: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
  color: var(--s-color-on-primary, ${"#ffffff" /* Theme.colorOnPrimary */});
  transition: box-shadow var(--s-motion-duration-short4, ${"200ms" /* Theme.motionDurationShort4 */}) var(--s-motion-easing-standard, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */});
  overflow: hidden;
}
:host([disabled=true]){
  pointer-events: none !important;
  background: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 12%, transparent) !important;
  color: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 38%, transparent) !important;
}
:host([type=elevated]){
  background: var(--s-color-surface-container-low, ${"#F2F4F5" /* Theme.colorSurfaceContainerLow */});
  color: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
  box-shadow: var(--s-elevation-level1, ${"0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel1 */});
}
:host([type=elevated][disabled=true]){
  box-shadow: none !important;
}
:host([type=filled-tonal]){
  background: var(--s-color-secondary-container, ${"#CFE6F1" /* Theme.colorSecondaryContainer */});
  color: var(--s-color-on-secondary-container, ${"#354A53" /* Theme.colorOnSecondaryContainer */});
}
:host([type=outlined]){
  border: solid 1px var(--s-color-outline, ${"#70787D" /* Theme.colorOutline */});
  background: none;
  color: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
}
:host([type=outlined][disabled=true]){
  background: none !important;
  border-color: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 12%, transparent) !important;
}
:host([type=text]){
  background: none;
  color: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
  padding: 0 16px;
}
:host([type=text][disabled=true]){
  background: none !important;
}
::slotted(*){
  flex-shrink: 0;
}
::slotted(:is(svg, s-icon, s-circular-progress)){
  fill: currentColor;
  color: currentColor;
  width: 20px;
  height: 20px;
}
::slotted(:is(svg[slot=start], s-icon[slot=start])){
  margin-right: 4px;
  margin-left: -8px;
}
::slotted(:is(svg[slot=end], s-icon[slot=end])){
  margin-right: -8px;
  margin-left: 4px;
}
::slotted(s-circular-progress[slot=start]){
  margin-left: -8px;
  margin-right: 8px;
}
::slotted(s-circular-progress[slot=end]){
  margin-left: 8px;
  margin-right: -8px;
}
:host([type=text]) ::slotted(:is(s-icon[slot=start], svg[slot=start])){
  margin-left: -4px;
  margin-right: 4px;
}
:host([type=text]) ::slotted(:is(s-icon[slot=end], svg[slot=end])){
  margin-left: 4px;
  margin-right: -4px;
}
:host(:not([type])[pressed]){
  box-shadow: var(--s-elevation-level1, ${"0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel1 */});
}
:host([type=elevated][pressed]){
  box-shadow: var(--s-elevation-level2, ${"0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel2 */});
}
.text{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
@media (pointer: fine){
  :host(:not([type]):hover){
    box-shadow: var(--s-elevation-level1, ${"0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel1 */});
  }
  :host([type=elevated]:hover){
    box-shadow: var(--s-elevation-level2, ${"0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel2 */});
  }
}
@supports not (color: color-mix(in srgb, black, white)){
  :host([disabled=true]){
    background: var(--s-color-surface-container-high, ${"#E7E8EA" /* Theme.colorSurfaceContainerHigh */}) !important;
    color: var(--s-color-outline, ${"#70787D" /* Theme.colorOutline */}) !important;
  }
  :host([type=outlined][disabled=true]){
    border-color: var(--s-color-surface-container-highest, ${"#E1E3E4" /* Theme.colorSurfaceContainerHighest */}) !important;
  }
}
`;
const template = /*html*/ `
<slot name="start"></slot>
<div class="text" part="text">
  <slot></slot>
</div>
<slot name="end"></slot>
<s-ripple class="ripple" attached="true" part="ripple"></s-ripple>
`;
export class Button extends useElement({ style, template, props }) {
}
Button.define(name);
