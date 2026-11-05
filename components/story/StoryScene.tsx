import type { CSSProperties } from "react";
import type { Scene } from "@/lib/story/scene-data";
import { PHONE_QUERY } from "@/lib/viewport";

export function StoryScene({ scene }: { scene: Scene }) {
  const Heading = scene.number === 1 ? "h1" : "h2";
  return (
    <section
      id={scene.id}
      className={`story-scene scene-${scene.number} scene-${scene.alignment}`}
      aria-labelledby={`${scene.id}-heading`}
      data-scene={scene.number}
      data-pdf-page={scene.pdfPage}
      style={{ "--focal": scene.focalPoint, "--mobile-focal": scene.mobileFocalPoint, "--copy-shade-strength": scene.copyShade ?? 0 } as CSSProperties}
    >
      <div className="scene-visual" aria-hidden="true">
        {/* Phones take the lighter encode of the same frame. The first two stills are the opening the curtain waits
            for; the rest are fallbacks the story reaches later, so they never compete with the hero film. */}
        <picture>
          <source media={PHONE_QUERY} srcSet={scene.smallPoster} />
          <img src={scene.poster} alt="" decoding="async" loading={scene.number <= 2 ? "eager" : "lazy"}
            fetchPriority={scene.number === 1 ? "high" : scene.number === 2 ? "auto" : "low"} />
        </picture>
        <div className="scene-shade" />
      </div>
      {scene.copyShade && <div className="scene-copy-shade" aria-hidden="true" />}
      <div className="scene-content">
        <Heading id={`${scene.id}-heading`} className="scene-heading" aria-label={scene.lines.join(" ")}>
          {scene.lines.map((line) => <span className="line-mask" key={line}><span className="headline-line">{line}</span></span>)}
        </Heading>
        {scene.paragraphs.length > 0 && <div className="scene-body">{scene.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}
        {scene.eyebrow && <p className="question-eyebrow">{scene.eyebrow}</p>}
        {scene.question && <p className="scene-question">{scene.question.map((line) => <span key={line}>{line}</span>)}</p>}
        {scene.actions && <div className="scene-actions">{scene.actions.map((action) => <a className="text-link" href={action.href} key={action.label}>{action.label}</a>)}</div>}
      </div>
    </section>
  );
}
