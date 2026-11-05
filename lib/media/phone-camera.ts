import { clamp, smootherstep } from "@/lib/math";

/** A camera key: [film progress 0..1, horizontal focal point 0..1 of the frame's width]. */
type CameraKey = readonly [number, number];

/**
 * Where narrow screens frame each film, read from the footage frame by frame (2 October 2026). Each film rests on its
 * first scene's subject, makes one eased move while the picture is busiest (a zoom, a splash, a dolly) so the move
 * reads as part of the shot, and settles on the next scene's subject before its copy arrives. A film starts exactly
 * where the one before it ends (the scenes' mobileFocalPoint), so the joins never jump.
 */
export const phoneCameraPaths: Record<string, readonly CameraKey[]> = {
  // The child stays in frame until the push into the wall has left them, then the light on the wall.
  "01-to-02": [[0, .75], [.4, .75], [.85, .42], [1, .42]],
  // Moves inside the blurred dive into the texture, where a sideways move cannot be seen.
  "02-to-03": [[0, .42], [.3, .42], [.65, .58], [1, .58]],
  // Grains, pigment, the cave, the pour: each subject sits mid-frame throughout, so the camera barely moves.
  "03-to-04": [[0, .58], [1, .57]],
  "04-to-05": [[0, .57], [1, .56]],
  "05-to-06": [[0, .56], [1, .54]],
  "06-to-07": [[0, .54], [1, .5]],
  // The stream stays centred until the drop forms to its right.
  "07-to-08": [[0, .5], [.6, .5], [.95, .62], [1, .62]],
  "08-to-09": [[0, .62], [.4, .62], [.8, .58], [1, .58]],
  // The move to the bedside rides the zoom from the network out to the wall.
  "09-to-10": [[0, .58], [.3, .58], [.8, .92], [1, .92]],
  // The bucket and its splash stay centred.
  "12-to-13": [[0, .5], [1, .5]],
  // The move to the armchair happens inside the full-frame swirl.
  "13-to-14": [[0, .5], [.45, .5], [.85, .85], [1, .85]],
  // The armchair leaves as the camera dollies to the red wall's window light.
  "14-to-15": [[0, .85], [.3, .85], [.8, .75], [1, .75]],
  // Through the doorway to the child on the rug.
  "15-to-16": [[0, .75], [.35, .75], [.75, .85], [1, .85]],
};

/** The ending's held family-room frame: the camera glides from the child to the wall as it zooms in. */
export const endingCameraPath: readonly CameraKey[] = [[0, .85], [1, .5]];

/** The focal point on a camera path at `progress`, easing in and out of every key so moves never start or stop abruptly. */
export function cameraX(path: readonly CameraKey[], progress: number) {
  const p = clamp(progress);
  const next = path.findIndex(([at]) => at >= p);
  if (next <= 0) return path[Math.max(0, next)][1];
  const [fromAt, from] = path[next - 1];
  const [toAt, to] = path[next];
  return from + (to - from) * smootherstep((p - fromAt) / (toAt - fromAt));
}

/** The focal point narrow screens use for `film` at `progress`; films without a path stay centred. */
export function phoneCameraX(film: string, progress: number) {
  const path = phoneCameraPaths[film];
  return path ? cameraX(path, progress) : .5;
}
