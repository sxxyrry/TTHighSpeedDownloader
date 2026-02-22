import { useElement, useProps } from './core/element.js';
import { convertCSSDuration } from './core/utils/CSSUtils.js';
const name = 's-page';
const props = useProps({
    theme: ['light', 'auto', 'dark']
});
const style = /*css*/ `
:host{
  display: flow-root;
  height: 100%;
  font-family: Roboto, system-ui;
  color: var(--s-color-on-background);
  background: var(--s-color-background);
  --s-color-scrim: ${"#000000" /* Theme.colorScrim */};
  --s-color-primary: ${"#006782" /* Theme.colorPrimary */};
  --s-color-on-primary: ${"#ffffff" /* Theme.colorOnPrimary */};
  --s-color-primary-container: ${"#BAEAFF" /* Theme.colorPrimaryContainer */};
  --s-color-on-primary-container: ${"#004D62" /* Theme.colorOnPrimaryContainer */};
  --s-color-secondary: ${"#4C616B" /* Theme.colorSecondary */};
  --s-color-on-secondary: ${"#ffffff" /* Theme.colorOnSecondary */};
  --s-color-secondary-container: ${"#CFE6F1" /* Theme.colorSecondaryContainer */};
  --s-color-on-secondary-container: ${"#354A53" /* Theme.colorOnSecondaryContainer */};
  --s-color-tertiary: ${"#5C5B7E" /* Theme.colorTertiary */};
  --s-color-on-tertiary: ${"#ffffff" /* Theme.colorOnTertiary */};
  --s-color-tertiary-container: ${"#E2DFFF" /* Theme.colorTertiaryContainer */};
  --s-color-on-tertiary-container: ${"#444465" /* Theme.colorOnTertiaryContainer */};
  --s-color-error: ${"#BA1A1A" /* Theme.colorError */};
  --s-color-on-error: ${"#ffffff" /* Theme.colorOnError */};
  --s-color-error-container: ${"#FFDAD6" /* Theme.colorErrorContainer */};
  --s-color-on-error-container: ${"#93000A" /* Theme.colorOnErrorContainer */};
  --s-color-background: ${"#F8F9FB" /* Theme.colorBackground */};
  --s-color-on-background: ${"#191C1E" /* Theme.colorOnBackground */};
  --s-color-outline: ${"#70787D" /* Theme.colorOutline */};
  --s-color-outline-variant: ${"#C0C8CC" /* Theme.colorOutlineVariant */};
  --s-color-surface: ${"#F8F9FB" /* Theme.colorSurface */};
  --s-color-on-surface: ${"#191C1E" /* Theme.colorOnSurface */};
  --s-color-surface-variant: ${"#DCE4E8" /* Theme.colorSurfaceVariant */};
  --s-color-on-surface-variant: ${"#40484C" /* Theme.colorOnSurfaceVariant */};
  --s-color-inverse-surface: ${"#2E3132" /* Theme.colorInverseSurface */};
  --s-color-inverse-on-surface: ${"#EFF1F3" /* Theme.colorInverseOnSurface */};
  --s-color-inverse-primary: ${"#60D4FE" /* Theme.colorInversePrimary */};
  --s-color-surface-container: ${"#ECEEF0" /* Theme.colorSurfaceContainer */};
  --s-color-surface-container-high: ${"#E7E8EA" /* Theme.colorSurfaceContainerHigh */};
  --s-color-surface-container-highest: ${"#E1E3E4" /* Theme.colorSurfaceContainerHighest */};
  --s-color-surface-container-low: ${"#F2F4F5" /* Theme.colorSurfaceContainerLow */};
  --s-color-surface-container-lowest: ${"#FFFFFF" /* Theme.colorSurfaceContainerLowest */};
  --s-color-success: ${"#006d43" /* Theme.colorSuccess */};
  --s-color-on-success: ${"#ffffff" /* Theme.colorOnSuccess */};
  --s-color-success-container: ${"#92f7bc" /* Theme.colorSuccessContainer */};
  --s-color-on-success-container: ${"#002111" /* Theme.colorOnSuccessContainer */};
  --s-color-warning: ${"#6f5d00" /* Theme.colorWarning */};
  --s-color-on-warning: ${"#ffffff" /* Theme.colorOnWarning */};
  --s-color-warning-container: ${"#ffe169" /* Theme.colorWarningContainer */};
  --s-color-on-warning-container: ${"#221b00" /* Theme.colorOnWarningContainer */};
  --s-color-dark-primary: ${"#60D4FE" /* Theme.colorDarkPrimary */};
  --s-color-dark-on-primary: ${"#003545" /* Theme.colorDarkOnPrimary */};
  --s-color-dark-primary-container: ${"#004D62" /* Theme.colorDarkPrimaryContainer */};
  --s-color-dark-on-primary-container: ${"#BAEAFF" /* Theme.colorDarkOnPrimaryContainer */};
  --s-color-dark-secondary: ${"#B4CAD5" /* Theme.colorDarkSecondary */};
  --s-color-dark-on-secondary: ${"#1E333C" /* Theme.colorDarkOnSecondary */};
  --s-color-dark-secondary-container: ${"#354A53" /* Theme.colorDarkSecondaryContainer */};
  --s-color-dark-on-secondary-container: ${"#CFE6F1" /* Theme.colorDarkOnSecondaryContainer */};
  --s-color-dark-tertiary: ${"#C4C3EA" /* Theme.colorDarkTertiary */};
  --s-color-dark-on-tertiary: ${"#2D2D4D" /* Theme.colorDarkOnTertiary */};
  --s-color-dark-tertiary-container: ${"#444465" /* Theme.colorDarkTertiaryContainer */};
  --s-color-dark-on-tertiary-container: ${"#E2DFFF" /* Theme.colorDarkOnTertiaryContainer */};
  --s-color-dark-error: ${"#FFB4AB" /* Theme.colorDarkError */};
  --s-color-dark-on-error: ${"#690005" /* Theme.colorDarkOnError */};
  --s-color-dark-error-container: ${"#93000A" /* Theme.colorDarkErrorContainer */};
  --s-color-dark-on-error-container: ${"#FFDAD6" /* Theme.colorDarkOnErrorContainer */};
  --s-color-dark-background: ${"#111415" /* Theme.colorDarkBackground */};
  --s-color-dark-on-background: ${"#E1E3E4" /* Theme.colorDarkOnBackground */};
  --s-color-dark-outline: ${"#8A9296" /* Theme.colorDarkOutline */};
  --s-color-dark-outline-variant: ${"#40484C" /* Theme.colorDarkOutlineVariant */};
  --s-color-dark-surface: ${"#111415" /* Theme.colorDarkSurface */};
  --s-color-dark-on-surface: ${"#E1E3E4" /* Theme.colorDarkOnSurface */};
  --s-color-dark-surface-variant: ${"#40484C" /* Theme.colorDarkSurfaceVariant */};
  --s-color-dark-on-surface-variant: ${"#C0C8CC" /* Theme.colorDarkOnSurfaceVariant */};
  --s-color-dark-inverse-surface: ${"#E1E3E4" /* Theme.colorDarkInverseSurface */};
  --s-color-dark-inverse-on-surface: ${"#2E3132" /* Theme.colorDarkInverseOnSurface */};
  --s-color-dark-inverse-primary: ${"#006782" /* Theme.colorDarkInversePrimary */};
  --s-color-dark-surface-container: ${"#1D2022" /* Theme.colorDarkSurfaceContainer */};
  --s-color-dark-surface-container-high: ${"#272A2C" /* Theme.colorDarkSurfaceContainerHigh */};
  --s-color-dark-surface-container-highest: ${"#323537" /* Theme.colorDarkSurfaceContainerHighest */};
  --s-color-dark-surface-container-low: ${"#191C1E" /* Theme.colorDarkSurfaceContainerLow */};
  --s-color-dark-surface-container-lowest: ${"#0C0F10" /* Theme.colorDarkSurfaceContainerLowest */};
  --s-color-dark-success: ${"#76daa1" /* Theme.colorDarkSuccess */};
  --s-color-dark-on-success: ${"#003920" /* Theme.colorDarkOnSuccess */};
  --s-color-dark-success-container: ${"#005231" /* Theme.colorDarkSuccessContainer */};
  --s-color-dark-on-success-container: ${"#92f7bc" /* Theme.colorDarkOnSuccessContainer */};
  --s-color-dark-warning: ${"#e2c54b" /* Theme.colorDarkWarning */};
  --s-color-dark-on-warning: ${"#3a3000" /* Theme.colorDarkOnWarning */};
  --s-color-dark-warning-container: ${"#544600" /* Theme.colorDarkWarningContainer */};
  --s-color-dark-on-warning-container: ${"#ffe169" /* Theme.colorDarkOnWarningContainer */};
  --s-elevation-level1: ${"0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel1 */};
  --s-elevation-level2: ${"0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12)" /* Theme.elevationLevel2 */};
  --s-elevation-level3: ${"0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12)" /* Theme.elevationLevel3 */};
  --s-elevation-level4: ${"0 8px 10px -5px rgba(0, 0, 0, .2), 0 16px 24px 2px rgba(0, 0, 0, .14), 0 6px 30px 5px rgba(0, 0, 0, .12)" /* Theme.elevationLevel4 */};
  --s-elevation-level5: ${"0 10px 14px -6px rgba(0, 0, 0, .2), 0 22px 35px 3px rgba(0, 0, 0, .14), 0 8px 42px 7px rgba(0, 0, 0, .12)" /* Theme.elevationLevel5 */};
  --s-motion-duration-Short1: ${"50ms" /* Theme.motionDurationShort1 */};
  --s-motion-duration-short2: ${"100ms" /* Theme.motionDurationShort2 */};
  --s-motion-duration-short3: ${"150ms" /* Theme.motionDurationShort3 */};
  --s-motion-duration-short4: ${"200ms" /* Theme.motionDurationShort4 */};
  --s-motion-duration-medium1: ${"250ms" /* Theme.motionDurationMedium1 */};
  --s-motion-duration-medium2: ${"300ms" /* Theme.motionDurationMedium2 */};
  --s-motion-duration-medium3: ${"350ms" /* Theme.motionDurationMedium3 */};
  --s-motion-duration-medium4: ${"400ms" /* Theme.motionDurationMedium4 */};
  --s-motion-duration-long1: ${"450ms" /* Theme.motionDurationLong1 */};
  --s-motion-duration-long2: ${"500ms" /* Theme.motionDurationLong2 */};
  --s-motion-duration-long3: ${"550ms" /* Theme.motionDurationLong3 */};
  --s-motion-duration-long4: ${"600ms" /* Theme.motionDurationLong4 */};
  --s-motion-duration-extra-long1: ${"700ms" /* Theme.motionDurationExtraLong1 */};
  --s-motion-duration-extra-long2: ${"800ms" /* Theme.motionDurationExtraLong2 */};
  --s-motion-duration-extra-long3: ${"900ms" /* Theme.motionDurationExtraLong3 */};
  --s-motion-duration-extra-long4: ${"1000ms" /* Theme.motionDurationExtraLong4 */};
  --s-motion-easing-emphasized: ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingEmphasized */};
  --s-motion-easing-emphasized-decelerate: ${"cubic-bezier(0.05, 0.7, 0.1, 1.0)" /* Theme.motionEasingEmphasizedDecelerate */};
  --s-motion-easing-emphasized-accelerate: ${"cubic-bezier(0.3, 0, 0.8, 0.15)" /* Theme.motionEasingEmphasizedAccelerate */};
  --s-motion-easing-standard: ${"cubic-bezier(0.2, 0, 0, 1.0)" /* Theme.motionEasingStandard */};
  --s-motion-easing-standard-decelerate: ${"cubic-bezier(0, 0, 0, 1)" /* Theme.motionEasingStandardDecelerate */};
  --s-motion-easing-standard-accelerate: ${"cubic-bezier(0.3, 0, 1, 1)" /* Theme.motionEasingStandardAccelerate */};
}
:host([dark]){
  --s-color-primary: var(--s-color-dark-primary) !important;
  --s-color-on-primary: var(--s-color-dark-on-primary) !important;
  --s-color-primary-container: var(--s-color-dark-primary-container) !important;
  --s-color-on-primary-container: var(--s-color-dark-on-primary-container) !important;
  --s-color-secondary: var(--s-color-dark-secondary) !important;
  --s-color-on-secondary: var(--s-color-dark-on-secondary) !important;
  --s-color-secondary-container: var(--s-color-dark-secondary-container) !important;
  --s-color-on-secondary-container: var(--s-color-dark-on-secondary-container) !important;
  --s-color-tertiary: var(--s-color-dark-tertiary) !important;
  --s-color-on-tertiary: var(--s-color-dark-on-tertiary) !important;
  --s-color-tertiary-container: var(--s-color-dark-tertiary-container) !important;
  --s-color-on-tertiary-container: var(--s-color-dark-on-tertiary-container) !important;
  --s-color-error: var(--s-color-dark-error) !important;
  --s-color-on-error: var(--s-color-dark-on-error) !important;
  --s-color-error-container: var(--s-color-dark-error-container) !important;
  --s-color-on-error-container: var(--s-color-dark-on-error-container) !important;
  --s-color-background: var(--s-color-dark-background) !important;
  --s-color-on-background: var(--s-color-dark-on-background) !important;
  --s-color-outline: var(--s-color-dark-outline) !important;
  --s-color-outline-variant: var(--s-color-dark-outline-variant) !important;
  --s-color-surface: var(--s-color-dark-surface) !important;
  --s-color-on-surface: var(--s-color-dark-on-surface) !important;
  --s-color-surface-variant: var(--s-color-dark-surface-variant) !important;
  --s-color-on-surface-variant: var(--s-color-dark-on-surface-variant) !important;
  --s-color-inverse-surface: var(--s-color-dark-inverse-surface) !important;
  --s-color-inverse-on-surface: var(--s-color-dark-inverse-on-surface) !important;
  --s-color-inverse-primary: var(--s-color-dark-inverse-primary) !important;
  --s-color-surface-container: var(--s-color-dark-surface-container) !important;
  --s-color-surface-container-high: var(--s-color-dark-surface-container-high) !important;
  --s-color-surface-container-highest: var(--s-color-dark-surface-container-highest) !important;
  --s-color-surface-container-low: var(--s-color-dark-surface-container-low) !important;
  --s-color-surface-container-lowest: var(--s-color-dark-surface-container-lowest) !important;
  --s-color-success: var(--s-color-dark-success) !important;
  --s-color-on-success: var(--s-color-dark-on-success) !important;
  --s-color-success-container: var(--s-color-dark-success-container) !important;
  --s-color-on-success-container: var(--s-color-dark-on-success-container) !important;
  --s-color-warning: var(--s-color-dark-warning) !important;
  --s-color-on-warning: var(--s-color-dark-on-warning) !important;
  --s-color-warning-container: var(--s-color-dark-warning-container) !important;
  --s-color-on-warning-container: var(--s-color-dark-on-warning-container) !important;
}
`;
const template = /*html*/ `<slot></slot>`;
const viewTransitionStyle = document.createElement('style');
viewTransitionStyle.textContent = `::view-transition-old(root),::view-transition-new(root) { animation: none; mix-blend-mode: normal}`;
export class Page extends useElement({
    style, template, props,
    setup() {
        const computedStyle = getComputedStyle(this);
        const darker = matchMedia('(prefers-color-scheme: dark)');
        const getAnimateOptions = () => {
            const easing = computedStyle.getPropertyValue('--s-motion-easing-standard-accelerate') || "cubic-bezier(0.3, 0, 1, 1)" /* Theme.motionEasingStandardAccelerate */;
            const duration = computedStyle.getPropertyValue('--s-motion-duration-long4') || "600ms" /* Theme.motionDurationLong4 */;
            return { easing: easing, duration: convertCSSDuration(duration) };
        };
        const isDark = () => {
            if (this.theme === 'auto')
                return darker.matches;
            if (this.theme === 'dark')
                return true;
            return false;
        };
        const toggle = (theme, trigger) => {
            return new Promise((resolve) => {
                if (this.theme === theme)
                    return;
                const isDark = darker.matches;
                const getTheme = (theme) => theme === 'auto' ? (isDark ? 'dark' : 'light') : theme;
                const oldTheme = getTheme(this.theme);
                const newTheme = getTheme(theme);
                if (oldTheme === newTheme || !document.startViewTransition) {
                    this.theme = theme;
                    return resolve();
                }
                const width = innerWidth;
                const height = innerHeight;
                const keyframes = { clipPath: [`circle(0px at 50% ${height / 2}px)`, `circle(${Math.sqrt(width ** 2 + height ** 2) / 2}px at 50% ${height / 2}px)`] };
                if (trigger && trigger.isConnected) {
                    const { left, top } = trigger.getBoundingClientRect();
                    const x = left + trigger.offsetWidth / 2;
                    const y = top + trigger.offsetHeight / 2;
                    const twoW = Math.max(width - x, x);
                    const twoH = Math.max(height - y, y);
                    const size = Math.sqrt(twoW ** 2 + twoH ** 2);
                    keyframes.clipPath[0] = `circle(0px at ${x}px ${y}px)`;
                    keyframes.clipPath[1] = `circle(${size}px at ${x}px ${y}px)`;
                }
                const transition = document.startViewTransition(() => {
                    this.theme = theme;
                    document.head.appendChild(viewTransitionStyle);
                });
                transition.ready.then(async () => {
                    const animation = document.documentElement.animate(keyframes, { ...getAnimateOptions(), pseudoElement: '::view-transition-new(root)' });
                    resolve(animation);
                    await transition.finished;
                    viewTransitionStyle.remove();
                });
            });
        };
        return {
            expose: {
                toggle,
                get isDark() {
                    return isDark();
                },
            },
            theme: (value) => {
                if (value === 'light')
                    return this.removeAttribute('dark');
                if (value === 'dark')
                    return this.setAttribute('dark', '');
                const change = () => {
                    darker.matches ? this.setAttribute('dark', '') : this.removeAttribute('dark');
                    this.dispatchEvent(new Event('change'));
                };
                darker.onchange = change;
                change();
            }
        };
    }
}) {
}
Page.define(name);
