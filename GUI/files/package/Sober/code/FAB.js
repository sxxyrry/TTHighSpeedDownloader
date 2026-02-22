import { useElement, useProps } from './core/element.js';
import './ripple.js';
const name = 's-fab';
const props = useProps({
    hidden: false,
    disabled: false,
});
const style = /*css*/ `
:host{
  display: inline-flex;
  vertical-align: middle;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  min-height: 48px;
  font-size: .875rem;
  border-radius: 28px;
  font-weight: 500;
  white-space: nowrap;
  text-transform: capitalize;
  padding: 0 24px;
  transition-property: box-shadow, transform;
  transition-duration: var(--s-motion-duration-short4, ${"200ms" /* Theme.motionDurationShort4 */});
  transition-timing-function: var(--s-motion-easing-standard, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */});
  box-shadow: var(--s-elevation-level3, ${"0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12)" /* Theme.elevationLevel3 */});
  background: var(--s-color-primary-container, ${"#BAEAFF" /* Theme.colorPrimaryContainer */});
  color: var(--s-color-on-primary-container, ${"#004D62" /* Theme.colorOnPrimaryContainer */});
}
:host([disabled=true]){
  pointer-events: none;
  box-shadow: var(--s-elevation-level1, ${"0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel1 */});
  background: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 12%, transparent) !important;
  color: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 38%, transparent) !important;
}
:host([hidden=true]){
  transform: scale(0);
  pointer-events: none;
}
::slotted(*){
  flex-shrink: 0;
}
::slotted(:is(svg, s-icon)){
  width: 24px;
  height: 24px;
  fill: currentColor;
  color: currentColor;
}
::slotted(:is(svg, s-icon):not([slot])){
  margin: 16px -8px;
}
::slotted(:is(svg[slot=start], s-icon[slot=start])){
  margin-left: -8px;
  margin-right: 8px;
}
::slotted(:is(svg[slot=end], s-icon[slot=end])){
  margin-left: 8px;
  margin-right: -8px;
}
:host([pressed]){
  box-shadow: var(--s-elevation-level4, ${"0 8px 10px -5px rgba(0, 0, 0, .2), 0 16px 24px 2px rgba(0, 0, 0, .14), 0 6px 30px 5px rgba(0, 0, 0, .12)" /* Theme.elevationLevel4 */});
}
@media (pointer: fine){
  :host(:hover){
    box-shadow: var(--s-elevation-level4, ${"0 8px 10px -5px rgba(0, 0, 0, .2), 0 16px 24px 2px rgba(0, 0, 0, .14), 0 6px 30px 5px rgba(0, 0, 0, .12)" /* Theme.elevationLevel4 */});
  }
}
@supports not (color: color-mix()){
  :host([disabled=true]){
    background: var(--s-color-surface-container-high, ${"#E7E8EA" /* Theme.colorSurfaceContainerHigh */}) !important;
    color: var(--s-color-outline, ${"#70787D" /* Theme.colorOutline */}) !important;
  }
}
`;
const template = /*html*/ `
<slot name="start"></slot>
<slot></slot>
<slot name="end"></slot>
<s-ripple attached="true" part="ripple"></s-ripple>
`;
class FloatingActionButton extends useElement({ style, template, props }) {
}
FloatingActionButton.define(name);
export { FloatingActionButton as FAB };
