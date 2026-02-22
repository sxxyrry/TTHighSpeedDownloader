import { useElement, useProps } from './core/element.js';
import { mediaQueryList } from './core/utils/mediaQuery.js';
const name = 's-slider';
const props = useProps({
    disabled: false,
    $labeled: false,
    $max: 100,
    $min: 0,
    $step: 1,
    $value: 0
});
const style = /*css*/ `
:host{
  display: block;
  color: var(--s-color-primary, ${"#006782" /* Theme.colorPrimary */});
  height: 16px;
  cursor: pointer;
  position: relative;
}
:host([disabled=true]){
  pointer-events: none;
  color: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 38%, transparent) !important;
}
.container{
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  pointer-events: none;
}
.track,
.indicator{
  height: 4px;
  border-radius: 2px;
  position: absolute;
  right: 0;
}
.track{
  background: var(--s-color-secondary-container, ${"#CFE6F1" /* Theme.colorSecondaryContainer */});
  width: calc(100% - 20px);
}
:host([disabled=true]) .track{
  background: color-mix(in srgb, var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) 12%, transparent) !important;
}
.indicator{
  left: 0;
  width: 0;
  background: currentColor;
}
.handle{
  position: relative;
  height: 16px;
  width: 16px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}
.thumb{
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: 50%;
  background: currentColor;
  box-shadow: var(--s-elevation-level1, ${"0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel1 */});
}
.thumb::before{
  content: '';
  position: absolute;
  left: -10px;
  top: -10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: color-mix(in srgb, currentColor 20%, transparent);
  transform: scale(0);
  transition: transform var(--s-motion-duration-short4, ${"200ms" /* Theme.motionDurationShort4 */}) var(--s-motion-easing-standard, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */});
}
.active .thumb::before{
  transform: scale(1);
}
.label{
  position: absolute;
  bottom: 100%;
  margin-bottom: 12px;
  background: var(--s-color-inverse-surface, ${"#2E3132" /* Theme.colorInverseSurface */});
  color: var(--s-color-inverse-on-surface, ${"#EFF1F3" /* Theme.colorInverseOnSurface */});
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 0 6px;
  height: 24px;
  font-size: .75rem;
  transform: scale(0);
  transform-origin: center bottom;
  transition: transform var(--s-motion-duration-short4, ${"200ms" /* Theme.motionDurationShort4 */}) var(--s-motion-easing-standard, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */});
  opacity: .85;
  z-index: 1;
  display: none;
}
.active .label{
  transform: scale(1);
}
:host([labeled=true]) .label{
  display: flex;
}
input{
  margin: 0;
  height: 100%;
  width: 100%;
  cursor: inherit;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
}
@supports not (color: color-mix(in srgb, black, white)){
  :host([disabled=true]){
    color: var(--s-color-on-surface, ${"#191C1E" /* Theme.colorOnSurface */}) !important;
  }
  :host([disabled=true]) .track{
    background: var(--s-color-surface-container-high, ${"#E7E8EA" /* Theme.colorSurfaceContainerHigh */}) !important;
  }
  :host([disabled=true]) .thumb{
    opacity: .38;
  }
}
`;
const template = /*html*/ `
<div class="container" part="container">
  <div class="indicator" part="indicator"></div>
  <div class="track" part="track"></div>
  <div class="handle" part="handle">
    <div class="thumb" part="thumb"></div>
    <div class="label" part="label">${props.value}</div>
  </div>
</div>
<input
  type="range"
  max="${props.max}"
  min="${props.min}"
  step="${props.step}"
  value="${props.value}"
/>
`;
export class Slider extends useElement({
    style, template, props,
    setup(shadowRoot) {
        const container = shadowRoot.querySelector('.container');
        const indicator = shadowRoot.querySelector('.indicator');
        const track = shadowRoot.querySelector('.track');
        const handle = shadowRoot.querySelector('.handle');
        const label = shadowRoot.querySelector('.label');
        const input = shadowRoot.querySelector('input');
        const update = () => {
            const value = Number(input.value);
            const percentage = ((value - this.min) * 100) / (this.max - this.min);
            handle.style.left = `calc(${percentage}% - ${percentage * 0.16}px)`;
            indicator.style.width = `calc(${percentage}% - ${4 + (percentage * 0.16)}px)`;
            track.style.width = `calc(${100 - percentage}% - ${20 - (percentage * 0.16)}px)`;
            label.textContent = String(value);
        };
        input.onchange = () => this.dispatchEvent(new Event('change'));
        input.oninput = () => {
            this.value = Number(input.value);
            this.dispatchEvent(new Event('input'));
        };
        input.onmousedown = (event) => event.button === 0 && mediaQueryList.pointerFine.matches && container.classList.add('active');
        input.onmouseup = () => mediaQueryList.pointerFine.matches && container.classList.remove('active');
        input.ontouchstart = () => mediaQueryList.pointerCoarse.matches && container.classList.add('active');
        input.ontouchend = () => mediaQueryList.pointerCoarse.matches && container.classList.remove('active');
        input.ontouchcancel = () => mediaQueryList.pointerCoarse.matches && container.classList.remove('active');
        return {
            max: (value) => {
                input.max = String(value);
                update();
            },
            min: (value) => {
                input.min = String(value);
                update();
            },
            step: (value) => {
                input.step = String(value);
                update();
            },
            value: (value) => {
                input.value = String(value);
                update();
            }
        };
    }
}) {
}
Slider.define(name);
