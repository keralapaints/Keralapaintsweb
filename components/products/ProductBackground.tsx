"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/product/product-data";

/** `near`: the range is within its preload margin, so the backdrop loads now rather than when the browser's lazy loader gets to it. */
export function ProductBackground({ product, near, nearby, playing, onReady }: {
  product: Product; near: boolean; nearby: boolean; playing: boolean; onReady: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const [decodedSource, setDecodedSource] = useState<string>();
  // A cached poster can finish before hydration attaches onLoad; without the film (constrained devices) it is the only ready signal.
  useEffect(() => { if (poster.current?.complete && poster.current.naturalWidth) onReady(); }, [onReady, product.poster]);
  useEffect(() => {
    const media = video.current;
    if (!media) return;
    media.playbackRate = 1;
    let disposed = false;
    let pending = false;
    const play = () => {
      if (disposed || !playing || !nearby || document.hidden || pending || !media.paused) return;
      media.muted = true;
      pending = true;
      void media.play().catch(() => { if (!disposed) onReady(); }).finally(() => { pending = false; });
    };
    if (playing && nearby) play();
    else media.pause();
    media.addEventListener("canplay", play);
    document.addEventListener("visibilitychange", play);
    // Retry blocked autoplay on the next real interaction, without swallowing input.
    window.addEventListener("pointerdown", play, { passive: true });
    window.addEventListener("keydown", play);
    return () => {
      disposed = true;
      media.pause();
      media.removeEventListener("canplay", play);
      document.removeEventListener("visibilitychange", play);
      window.removeEventListener("pointerdown", play);
      window.removeEventListener("keydown", play);
    };
  }, [playing, nearby, onReady, product.video]);

  return <div className="pr-background" aria-hidden="true">
    {/* Native DOM media, never uploaded to a WebGL texture. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img key={product.poster} ref={poster} src={product.poster} alt="" loading={near ? "eager" : "lazy"} decoding="async" onLoad={onReady} onError={onReady} />
    {product.video && <video key={product.video} ref={video} src={nearby ? product.video : undefined}
      poster={product.poster} autoPlay={playing} muted playsInline loop
      preload={nearby ? "auto" : "none"} disablePictureInPicture tabIndex={-1}
      className={decodedSource === product.video ? "pr-video-decoded" : ""}
      onPlaying={() => { setDecodedSource(product.video); onReady(); }}
      onError={onReady} />}
    <div className="pr-grade" />
  </div>;
}
