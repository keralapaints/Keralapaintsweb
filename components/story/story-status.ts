import type { RefObject } from "react";
import { pad } from "@/lib/media/media";

/** The story footer's live parts (StoryStatus). */
export type StatusRefs = {
  number: RefObject<HTMLSpanElement | null>;
  title: RefObject<HTMLSpanElement | null>;
  progress: RefObject<HTMLSpanElement | null>;
};

export function showChapter(status: StatusRefs, number: number, title: string) {
  if (status.number.current) status.number.current.textContent = pad(number);
  if (status.title.current) status.title.current.textContent = title;
}

/** `fraction` of the whole journey's progress line. */
export function showProgress(status: StatusRefs, fraction: number) {
  if (status.progress.current) status.progress.current.style.transform = `scaleX(${fraction})`;
}
