/** How a step card is marked on the product page: the step that applies this product (gold), or an optional one (dashed). */
export const STEP_TONES = ["product", "optional"] as const;
export type StepTone = (typeof STEP_TONES)[number];

/** A step as the How to Apply section draws it. */
export type ProductStep = { title: string; body: string; items?: readonly string[]; tone?: StepTone };

/** Lines that start with "- " (or "• ") are notes under the step, such as "- **Damp walls:** use Aqua Seal 2K." */
const NOTE_LINE = /^\s*[-•]\s+/;

/** A step's mark, if it has one. Steps saved before marks existed simply have none. */
export function stepTone(step: object): StepTone | undefined {
  return "tone" in step && (STEP_TONES as readonly unknown[]).includes(step.tone) ? step.tone as StepTone : undefined;
}

/**
 * A step from the admin's "How to apply" rows: the text's ordinary lines are the step's paragraph, its "- " lines the
 * notes beneath it.
 */
export function toProductStep(step: { title: string; text: string }): ProductStep {
  const lines = step.text.split("\n").map((line) => line.trim()).filter(Boolean);
  const items = lines.filter((line) => NOTE_LINE.test(line)).map((line) => line.replace(NOTE_LINE, ""));
  const tone = stepTone(step);
  return {
    title: step.title,
    body: lines.filter((line) => !NOTE_LINE.test(line)).join(" "),
    ...(items.length > 0 ? { items } : {}),
    ...(tone ? { tone } : {}),
  };
}