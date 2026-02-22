import { useElement, useProps } from './core/element.js';
import './ripple.js';
const name = 's-switch';
const props = useProps({
    disabled: false,
    checked: false
});
const style = /*css*/ `
:host{
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  position: relative;
  cursor: pointer;
  color: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
  width: 52px;
  aspect-ratio: 1.625;
  -webkit-aspect-ratio: 1.625;
  border-radius: 16px;
}
:host([disabled=true]){
  pointer-events: none;
}
.track{
  width: 100%;
  height: 100%;
  border: solid 2px var(--s-color-outline, ${"#70787D" /* Theme.colorOutline */});
  box-sizing: border-box;
  border-radius: inherit;
}
:host([disabled=true]) .track{
  border-color: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 12%, transparent) !important;
}
:host([checked=true]) .track{
  border-width: 0;
  background: currentColor;
}
:host([disabled=true][checked=true]) .track{
  background: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 12%, transparent) !important;
}
.ripple{
  height: 125%;
  width: auto;
  aspect-ratio: 1;
  -webkit-aspect-ratio: 1;
  border-radius: 50%;
  inset: auto;
  transition: transform var(--s-motion-duration-short4, ${"200ms" /* Theme.motionDurationShort4 */}) var(--s-motion-easing-emphasized, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingEmphasized */});
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  color: var(--s-color-outline, ${"#70787D" /* Theme.colorOutline */});
  transform: translateX(-10%);
}
:host([checked=true]) .ripple{
  transform: translateX(40%);
  color: currentColor;
}
.thumb{
  background: var(--s-color-outline, ${"#70787D" /* Theme.colorOutline */});
  border-radius: 50%;
  width: 40%;
  height: 40%;
  transition: transform var(--s-motion-duration-short4, ${"200ms" /* Theme.motionDurationShort4 */}) var(--s-motion-easing-emphasized, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingEmphasized */});
  position: relative;
}
:host([disabled=true]) .thumb{
  background: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 38%, transparent);
}
:host([checked=true]) .thumb{
  background: var(--s-color-on-primary, ${"#ffffff" /* Theme.colorOnPrimary */});
  transform: scale(1.5);
  box-shadow: var(--s-elevation-level1, ${"0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel1 */});
}
:host([disabled=true][checked=true]) .thumb{
  background: var(--s-color-surface, ${"#F8F9FB" /* Theme.colorSurface */});
  box-shadow: none;
}
.icon{
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity var(--s-motion-duration-short4, ${"200ms" /* Theme.motionDurationShort4 */}) var(--s-motion-easing-emphasized, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingEmphasized */});
  color: currentColor;
}
::slotted([slot=icon]),
svg{
  color: currentColor;
  fill: currentColor;
  width: 70%;
  height: 70%;
}
:host([checked=true]) .icon{
  opacity: 1;
}
:host([checked=true][disabled=true]) .icon{
  color: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 12%, transparent);
}
@supports not (color: color-mix(in srgb, black, white)){
  :host([disabled=true]) .track{
    border-color: var(--s-color-surface-container-highest, ${"#E1E3E4" /* Theme.colorSurfaceContainerHighest */}) !important;
  }
  :host([disabled=true][checked=true]) .track{
    background: var(--s-color-surface-container-highest, ${"#E1E3E4" /* Theme.colorSurfaceContainerHighest */}) !important;
  }
  :host([disabled=true]) .thumb{
    background: var(--s-color-surface-container-highest, ${"#E1E3E4" /* Theme.colorSurfaceContainerHighest */}) !important;
  }
  :host([disabled=true][checked=true]) .thumb{
    background: var(--s-color-surface, ${"#F8F9FB" /* Theme.colorSurface */}) !important;
  }
}
`;
const template = /*html*/ `
<div class="track" part="track"></div>
<s-ripple attached="true" class="ripple" part="ripple">
  <div class="thumb" part="thumb">
    <slot name="icon" class="icon"></slot>
  </div>
</s-ripple>
`;
export class Switch extends useElement({
    style, template, props,
    setup() {
        this.addEventListener('click', () => {
            this.checked = !this.checked;
            this.dispatchEvent(new Event('change'));
        });
    }
}) {
}
Switch.define(name);
