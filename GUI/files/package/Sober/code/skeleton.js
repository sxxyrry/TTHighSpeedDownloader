import { useElement } from './core/element.js';
const name = 's-skeleton';
const style = /*css*/ `
:host{
  display: block;
  height: 16px;
  animation: skeleton var(--s-motion-duration-extra-long4, ${"1000ms" /* Theme.motionDurationExtraLong4 */}) var(--s-motion-easing-standard, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */}) infinite;
  background: linear-gradient(90deg, var(--s-color-surface-container-high, ${"#E7E8EA" /* Theme.colorSurfaceContainerHigh */}) 25%, var(--s-color-surface-container-highest, ${"#E1E3E4" /* Theme.colorSurfaceContainerHighest */}) 37%, var(--s-color-surface-container-high, ${"#E7E8EA" /* Theme.colorSurfaceContainerHigh */}) 63%);
  background-size: 400% 100%;
  border-radius: 8px;
}
@keyframes skeleton{
  0%{
    background-position: 100% 50%;
  }
  100%{
    background-position: 0 50%;
  }
}
`;
export class Skeleton extends useElement({ style }) {
}
Skeleton.define(name);
