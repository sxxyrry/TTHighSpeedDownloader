import { useElement, useProps } from './core/element.js';
import './ripple.js';
const name = 's-icon-button';
const props = useProps({
    disabled: false,
    type: ['standard', 'filled', 'filled-tonal', 'outlined']
});
const style = /*css*/ `
:host{
  display: inline-flex;
  vertical-align: middle;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  color: var(--s-color-on-surface-variant, ${"#40484C" /* Theme.colorOnSurfaceVariant */});
  position: relative;
  box-sizing: border-box;
}
:host([disabled=true]){
  pointer-events: none !important;
  color: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 38%, transparent) !important;
  background: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 12%, transparent) !important;
}
:host([type=filled]){
  background: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
  color: var(--s-color-on-primary, ${"#ffffff" /* Theme.colorOnPrimary */});
}
:host([type=filled]) ::slotted([slot=badge]){
  box-shadow: 0 0 0 2px var(--s-color-surface, ${"#F8F9FB" /* Theme.colorSurface */});
}
:host([type=filled-tonal]){
  background: var(--s-color-secondary-container, ${"#CFE6F1" /* Theme.colorSecondaryContainer */});
  color: var(--s-color-on-secondary-container, ${"#354A53" /* Theme.colorOnSecondaryContainer */});
}
:host([type=outlined]){
  border: solid 1px var(--s-color-outline, ${"#70787D" /* Theme.colorOutline */})
}
:host([type=outlined][disabled=true]){
  background: none !important;
  border-color: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 12%, transparent) !important;
}
::slotted(:not([slot=badge])){
  color: inherit;
}
::slotted(svg){
  width: 24px;
  height: 24px;
  fill: currentColor;
}
::slotted([slot=badge]){
  position: absolute;
  right: 4px;
  top: 0;
  flex-shrink: 0;
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
<slot></slot>
<slot name="end"></slot>
<s-ripple class="ripple" attached="true" part="ripple"></s-ripple>
<slot name="badge"></slot>
`;
export class IconButton extends useElement({ style, template, props }) {
}
IconButton.define(name);
