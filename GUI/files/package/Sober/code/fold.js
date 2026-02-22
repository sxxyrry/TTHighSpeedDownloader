import { useElement, useProps } from './core/element.js';
const name = 's-fold';
const props = useProps({
    folded: false
});
const style = /*css*/ `
:host{
  display: block;
}
.container{
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
  transition: grid-template-rows var(--s-motion-duration-short4, ${"200ms" /* Theme.motionDurationShort4 */}) var(--s-motion-easing-emphasized, ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingEmphasized */});
}
:host([folded=true]) .container{
  grid-template-rows: 0fr;
}
.view{
  display: block;
  min-height: 0;
  overflow: hidden;
}
`;
const template = /*html*/ `
<slot name="trigger"></slot>
<div class="container" part="container">
  <slot class="view" part="view"></slot>
</div>
`;
export class Fold extends useElement({
    style, template, props,
    setup(shadowRoot) {
        shadowRoot.querySelector('slot[name=trigger]').onclick = () => this.folded = !this.folded;
    }
}) {
}
Fold.define(name);
