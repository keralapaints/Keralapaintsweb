export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
/** Cubic ease over 0..1 (input clamped). */
export const smoothstep = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
/** Quintic ease over 0..1 (input clamped): flatter at both ends than smoothstep. */
export const smootherstep = (value: number) => { const t = clamp(value); return t * t * t * (t * (t * 6 - 15) + 10); };
