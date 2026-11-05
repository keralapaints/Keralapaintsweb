import type { RefObject } from "react";
import { JOURNEY_CHAPTERS } from "@/lib/story/scene-data";

type SpanRef = RefObject<HTMLSpanElement | null>;

/** The footer caption and progress line; the story and the Product Range write into it as the reader scrolls. */
export function StoryStatus({ numberRef, titleRef, progressRef }: { numberRef: SpanRef; titleRef: SpanRef; progressRef: SpanRef }) {
  return <aside className="story-status" aria-label="Story progress">
    <div className="story-caption">
      <span ref={numberRef}>01</span>
      <span className="caption-rule" />
      <span ref={titleRef}>Beyond beautiful walls</span>
    </div>
    <span className="scroll-invitation">Scroll to explore{" "}<span aria-hidden="true">↓</span></span>
    <span className="story-total">/ {JOURNEY_CHAPTERS}</span>
    <span className="progress-track"><span ref={progressRef} /></span>
  </aside>;
}
