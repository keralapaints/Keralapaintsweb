import { transitions } from "@/lib/story/scene-data";
import { phoneCameraX } from "@/lib/media/phone-camera";
import { storyFilmSample } from "@/lib/story/story-timeline";
import { createFramePainter, painterTuning } from "@/lib/media/frame-painter";
import { bindFilm, prefetchFilms } from "@/lib/media/film-cache";
import { journeyFilms, storyFilmNeed } from "@/lib/media/media-window";
import { NARROW_QUERY } from "@/lib/viewport";
import { files, packSources } from "./story-layout";

/**
 * The scroll-scrubbed films: frame packs from the bounded film cache (lib/media/film-cache), drawn on one canvas
 * (lib/media/frame-painter). The hero loop's videos are separate and are never drawn here.
 */
export function createStoryFilms(container: HTMLElement) {
  const canvas = container.querySelector<HTMLCanvasElement>(".story-canvas")!;
  const painter = createFramePainter(canvas);
  const films = files.map((file) => bindFilm(packSources[file]));
  // The whole journey is fetched ahead, five films at a time, from the film on show onwards (then the ones
  // before it), behind whatever is on show. It starts once the opening position is known (a reload restores
  // the reader mid-way; a hash lands elsewhere).
  let stopPrefetch: (() => void) | null = null;
  let lastFile = -1;
  let canvasOpacity = -1;
  let active = true;
  // Narrow screens follow each film's camera path (lib/media/phone-camera), which starts and ends on its scenes' stills.
  const narrow = window.matchMedia(NARROW_QUERY);

  return {
    painter, canvas,
    startPrefetch() {
      if (stopPrefetch || !active) return;
      const from = Math.max(0, lastFile);
      stopPrefetch = prefetchFilms([...journeyFilms.slice(from), ...journeyFilms.slice(0, from)]);
    },
    /** Marks how much each film is needed around scene `index` (lib/media/media-window storyFilmNeed). */
    prepareAround(index: number) {
      const fileIndex = files.indexOf(transitions[Math.min(index, transitions.length - 1)].file);
      films.forEach((film, filmIndex) => film.need(storyFilmNeed(filmIndex, fileIndex)));
    },
    /** Puts the opening film's first frame on the canvas ahead of the reader's first scroll. */
    prewarm() { painter.seek(films[0], transitions[0].start); },
    /** The opening film's frame at `time` is drawn and settled (hero debug overlay). */
    atOpeningFrame(time: number) {
      return painter.settled && painter.film === films[0].film && Math.abs(painter.frameTime - time) < 1 / 24;
    },
    /** Aims the canvas for this point of the timeline and returns the horizontal focal point (0..1). */
    focus(index: number, progress: number) {
      const film = transitions[Math.min(index, transitions.length - 1)];
      // After the last film the story rests on its final frame.
      const cameraX = narrow.matches ? phoneCameraX(film.file, index < transitions.length ? progress : 1) : .5;
      painter.setFocal(cameraX, .5);
      return cameraX;
    },
    /** Draws the film for this point of the timeline and shows the canvas while its picture belongs here. */
    show(index: number, inTransition: boolean, progress: number, heroAmbientOpacity: number) {
      // Keep a decoded film on screen during reading holds as well as travel.
      // The final scene holds the last film's endpoint; it has no outgoing film.
      const filmSample = storyFilmSample(transitions, index, inTransition, progress);
      const transition = transitions[filmSample.filmIndex];
      const filmIndex = files.indexOf(transition.file);
      painter.seek(films[filmIndex], filmSample.time);
      // The film on show, for the curtain (Preloader waits for its pack) and for inspection.
      if (filmIndex !== lastFile) { lastFile = filmIndex; container.dataset.film = transition.file; }
      const pack = films[filmIndex].url;
      if (container.dataset.pack !== pack) container.dataset.pack = pack;

      // Do not reveal a poster between films while the next frame decodes: the picture on the canvas stays as
      // long as it is this film's, close to the scroll, or a neighbour's (they meet on the same still). A film
      // that has fallen behind the scroll gives way to a single still until it catches up.
      const drawnFilm = painter.film;
      const drawn = drawnFilm ? films.findIndex((film) => film.url === drawnFilm.url) : -1;
      const neighbour = drawn !== -1 && drawn !== filmIndex && Math.abs(drawn - filmIndex) === 1;
      const shown = drawn === filmIndex ? !painter.stalled
        : neighbour && (drawn < filmIndex ? painter.frameIndex >= drawnFilm!.count - 1 - painterTuning.stall : painter.frameIndex <= painterTuning.stall);
      const wanted = shown ? (index === 0 ? 1 - heroAmbientOpacity : 1) : 0;
      // The canvas is either fully shown or hidden (the hero only cross-fades with its idle loop): fading it over an
      // unrelated poster would double the furniture while decoding stalls.
      if (wanted !== canvasOpacity) { canvasOpacity = wanted; canvas.style.opacity = wanted.toFixed(3); }
    },
    destroy() {
      active = false;
      painter.destroy();
      stopPrefetch?.();
      delete container.dataset.film;
      delete container.dataset.pack;
      films.forEach((film) => film.destroy());
      canvas.style.opacity = "0";
    },
  };
}
