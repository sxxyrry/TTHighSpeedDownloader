import { useElement, useEvents, useProps } from './core/element.js';
import { convertCSSDuration } from './core/utils/CSSUtils.js';
const name = 's-bottom-sheet';
const props = useProps({
    showed: false,
    disabledGesture: false
});
const events = useEvents({
    show: (CustomEvent),
    showed: Event,
    close: (CustomEvent),
    closed: Event
});
const style = /*css*/ `
:host{
  display: inline-block;
  vertical-align: middle;
}
dialog{
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  padding: 0;
  max-width: none;
  max-height: none;
  outline: none;
  justify-content: center;
  align-items: flex-end;
  color: inherit;
  overflow: hidden;
}
dialog::backdrop{
  background: none;
}
dialog[open]{
  display: flex;
}
.scrim{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  backdrop-filter: saturate(180%) blur(2px);
}
.scrim::before{
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  opacity: .75;
  background: var(--s-color-scrim, ${"#000000" /* Theme.colorScrim */});
}
dialog.show .scrim{
  opacity: 1;
}
.container{
  outline: none;
  position: relative;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-height: calc(100% - 56px);
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
  max-width: ${425 /* mediaQueries.mobileL */}px;
  box-shadow: var(--s-elevation-level1, ${"0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel1 */});
  background: var(--s-color-surface-container-low, ${"#F2F4F5" /* Theme.colorSurfaceContainerLow */});
}
.indicator{
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
}
.indicator::before{
  content: '';
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--s-color-outline, ${"#70787D" /* Theme.colorOutline */});
  opacity: .4;
}
::slotted([slot=text]){
  padding: 24px;
  line-height: 22px;
}
::slotted(:not([slot])){
  overscroll-behavior: none;
}
@media (max-width: ${768 /* mediaQueries.tablet */}px){
  .container{
    max-width: ${768 /* mediaQueries.tablet */}px;
  }
}
`;
const template = /*html*/ `
<slot name="trigger"></slot>
<dialog part="popup">
  <div class="scrim" part="scrim"></div>
  <div class="container" part="container">
    <div class="indicator" part="indicator"></div>
    <slot name="text"></slot>
    <slot id="view"></slot>
  </div>
</dialog>
`;
const builder = (options) => {
    let root = document.body;
    const page = document.body.firstElementChild;
    if (page && page.tagName === 'S-PAGE')
        root = page;
    const bottomSheet = new BottomSheet();
    const text = document.createElement('div');
    text.slot = 'text';
    if (typeof options === 'function' || options instanceof HTMLElement) {
        options instanceof HTMLElement ? bottomSheet.appendChild(options) : options(bottomSheet);
    }
    else if (typeof options === 'string') {
        text.textContent = options;
        bottomSheet.appendChild(text);
    }
    else {
        if (options.root)
            root = options.root;
        if (options.disabledGesture)
            bottomSheet.disabledGesture = options.disabledGesture;
        if (typeof options.view === 'string') {
            text.textContent = options.view;
            bottomSheet.appendChild(text);
        }
        if (options.view instanceof HTMLElement) {
            bottomSheet.appendChild(options.view);
        }
        if (typeof options.view === 'function') {
            options.view(bottomSheet);
        }
    }
    bottomSheet.addEventListener('closed', () => root.removeChild(bottomSheet));
    bottomSheet.showed = true;
    root.appendChild(bottomSheet);
    return bottomSheet;
};
export class BottomSheet extends useElement({
    style, template, props, events, methods: { builder },
    setup(shadowRoot) {
        const dialog = shadowRoot.querySelector('dialog');
        const container = shadowRoot.querySelector('.container');
        const scrim = shadowRoot.querySelector('.scrim');
        const indicator = shadowRoot.querySelector('.indicator');
        const computedStyle = getComputedStyle(this);
        let scrollView = null;
        const getAnimateOptions = () => {
            const easing = computedStyle.getPropertyValue('--s-motion-easing-standard') || "cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */;
            const duration = computedStyle.getPropertyValue('--s-motion-duration-medium4') || "400ms" /* Theme.motionDurationMedium4 */;
            return { easing: easing, duration: convertCSSDuration(duration) };
        };
        shadowRoot.querySelector('#view').onslotchange = (event) => {
            const target = event.target;
            scrollView = target.assignedElements()[0] ?? null;
        };
        shadowRoot.querySelector('slot[name=trigger]').onclick = () => {
            if (this.showed || !this.dispatchEvent(new CustomEvent('show', { cancelable: true, detail: { source: 'TRIGGER' } })))
                return;
            this.showed = true;
        };
        const onClose = (source) => {
            if (!this.showed || !this.dispatchEvent(new CustomEvent('close', { cancelable: true, detail: { source } })))
                return;
            this.showed = false;
        };
        scrim.onclick = () => onClose('SCRIM');
        let touchs = null;
        container.addEventListener('touchmove', (event) => {
            const target = event.target;
            if (this.disabledGesture)
                return;
            const touch = event.touches[0];
            if (!touchs)
                return touchs = { y: touch.pageY, x: touch.pageX, disabled: false, top: 0, h: container.offsetHeight, now: Date.now() };
            if (touchs.disabled)
                return;
            const top = touch.pageY - touchs.y;
            const left = touch.pageX - touchs.x;
            touchs.top = Math.min(touchs.h, Math.max(0, top));
            if ((target !== indicator && scrollView && scrollView.scrollTop > 0) || Math.abs(top) < Math.abs(left))
                return touchs.disabled = true;
            container.style.transform = `translateY(${touchs.top}px)`;
        }, { passive: false });
        container.ontouchend = () => {
            if (!touchs || touchs.disabled)
                return touchs = null;
            const threshold = (Date.now() - touchs.now) > 300 ? (touchs.h / 3) : 20;
            if (touchs.top > threshold) {
                if (!this.dispatchEvent(new CustomEvent('close', { cancelable: true, detail: { source: 'GESTURE' } })))
                    return;
                this.showed = false;
            }
            else {
                container.animate({ transform: [container.style.transform, 'translateY(0)'] }, getAnimateOptions());
                container.style.removeProperty('transform');
            }
            touchs = null;
        };
        const show = () => {
            if (!this.isConnected || dialog.open)
                return;
            dialog.showModal();
            dialog.classList.add('show');
            const animateOptions = getAnimateOptions();
            scrim.animate({ opacity: [0, 1] }, animateOptions);
            const animation = container.animate({ transform: ['translateY(100%)', 'translateY(0)'], opacity: [0, 1] }, animateOptions);
            animation.finished.then(() => this.dispatchEvent(new Event('showed')));
        };
        const close = () => {
            if (!this.isConnected || !dialog.open)
                return;
            dialog.classList.remove('show');
            const animateOptions = getAnimateOptions();
            const oldTransform = container.style.transform;
            scrim.animate({ opacity: [1, 0] }, animateOptions);
            const animation = container.animate({ transform: [oldTransform === '' ? 'translateY(0)' : oldTransform, 'translateY(100%)'], opacity: [1, 0] }, animateOptions);
            animation.finished.then(() => {
                dialog.close();
                if (oldTransform)
                    container.style.removeProperty('transform');
                this.dispatchEvent(new Event('closed'));
            });
        };
        return {
            onMounted: () => this.showed && !dialog.open && show(),
            showed: (value) => value ? show() : close()
        };
    }
}) {
}
BottomSheet.define(name);
