"use client";

import type { RefObject } from "react";
import { BRAND_LOGO } from "@/lib/preload";
import { site } from "@/data/site";

/** The page's closing footer; the ending reveals it through `footerRef`. */
export function EnquiryFooter({ footerRef }: { footerRef: RefObject<HTMLElement | null> }) {
  return <footer ref={footerRef} className="home-footer" data-scene="18">
    <div className="home-sign" data-copy-detail>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="home-sign-logo" src={BRAND_LOGO} srcSet={`${BRAND_LOGO} 820w`} sizes="(max-width: 840px) 210px, (max-width: 1560px) 25vw, 390px" alt={site.logoAlt} width={820} height={500} loading="lazy" />
    </div>
    <p className="home-heading">{site.footerLines.map((line) => <span className="line-mask" key={line}><span className="headline-line">{line}<em>.</em></span></span>)}</p>
    <p className="home-copyright" data-copy-detail>{site.copyright}</p>
  </footer>;
}
