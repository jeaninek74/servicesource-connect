/**
 * useHaptic — lightweight wrapper around the Vibration API.
 * Falls back silently on browsers/devices that don't support it.
 *
 * Usage:
 *   const haptic = useHaptic();
 *   <Button onClick={() => { haptic.light(); doSomething(); }}>Click</Button>
 */

const isSupported = typeof navigator !== "undefined" && "vibrate" in navigator;

function vibrate(pattern: number | number[]) {
  if (isSupported) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // silently ignore
    }
  }
}

export function useHaptic() {
  return {
    /** 10ms — subtle tap, ideal for toggles and checkboxes */
    light: () => vibrate(10),
    /** 20ms — standard tap, ideal for buttons and links */
    medium: () => vibrate(20),
    /** 40ms — strong tap, ideal for confirmations and CTAs */
    heavy: () => vibrate(40),
    /** Short double-tap — ideal for success / save actions */
    success: () => vibrate([15, 50, 15]),
    /** Triple-tap — ideal for errors or destructive actions */
    error: () => vibrate([30, 40, 30, 40, 30]),
    /** Custom pattern */
    custom: (pattern: number | number[]) => vibrate(pattern),
  };
}
