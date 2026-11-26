import { useEffect, useState, type RefObject } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

/**
 * Camera hand control.
 * - Tracks one hand with MediaPipe HandLandmarker (runs fully in the browser; video never leaves the device).
 * - Cursor = midpoint between thumb tip (4) and index tip (8), mapped onto the abacus area.
 * - A "pinch" (thumb + index close together) acts as a click on the nearest bead.
 */
let landmarkerPromise: Promise<HandLandmarker> | null = null;

function getLandmarker() {
  if (!landmarkerPromise) {
    const base = import.meta.env.BASE_URL;
    landmarkerPromise = FilesetResolver.forVisionTasks(`${base}wasm`).then(async (vision) => {
      const make = (delegate: "GPU" | "CPU") =>
        HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: `${base}models/hand_landmarker.task`, delegate },
          runningMode: "VIDEO", numHands: 1,
        });
      try { return await make("GPU"); } catch { return await make("CPU"); }
    });
    landmarkerPromise.catch(() => { landmarkerPromise = null; });
  }
  return landmarkerPromise;
}

export type HandStatus = "hLoad" | "hReady" | "hErr";

export function useHand(
  videoRef: RefObject<HTMLVideoElement>,
  cursorRef: RefObject<HTMLDivElement>,
  targetRef: RefObject<HTMLElement>,
): HandStatus {
  const [status, setStatus] = useState<HandStatus>("hLoad");

  useEffect(() => {
    let stop = false, raf = 0;
    let stream: MediaStream | undefined;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
        const v = videoRef.current!;
        v.srcObject = stream; await v.play();
        const lm = await getLandmarker();
        if (stop) return;
        setStatus("hReady");

        let sx = 0, sy = 0, seen = false, down = false, lastT = -1;
        const norm = (a: number) => Math.min(1, Math.max(0, (a - 0.15) / 0.7)); // use the central 70% of the frame

        const loop = () => {
          if (stop) return;
          raf = requestAnimationFrame(loop);
          if (v.currentTime === lastT) return;
          lastT = v.currentTime;
          const cur = cursorRef.current, target = targetRef.current;
          const hand = lm.detectForVideo(v, performance.now()).landmarks[0];
          if (!cur || !target) return;
          if (!hand) { cur.style.opacity = "0"; seen = false; down = false; return; }

          const thumb = hand[4], index = hand[8];
          const mx = (thumb.x + index.x) / 2, my = (thumb.y + index.y) / 2;
          const rect = target.getBoundingClientRect();
          const x = rect.left + norm(1 - mx) * rect.width; // video is mirrored
          const y = rect.top + norm(my) * rect.height;
          if (!seen) { sx = x; sy = y; seen = true; } else { sx += (x - sx) * 0.5; sy += (y - sy) * 0.5; }
          cur.style.opacity = "1";
          cur.style.transform = `translate(${sx}px, ${sy}px)`;

          // pinch distance relative to hand size, with hysteresis to avoid flicker
          const size = Math.hypot(hand[0].x - hand[9].x, hand[0].y - hand[9].y) || 1;
          const d = Math.hypot(thumb.x - index.x, thumb.y - index.y) / size;
          if (!down && d < 0.25) {
            down = true; cur.classList.add("pinch");
            let best: HTMLElement | null = null, bd = 40;
            target.querySelectorAll<HTMLElement>("[data-r]").forEach((b) => {
              const r = b.getBoundingClientRect();
              const dist = Math.hypot(r.left + r.width / 2 - sx, r.top + r.height / 2 - sy);
              if (dist < bd) { bd = dist; best = b; }
            });
            (best as HTMLElement | null)?.click();
          } else if (down && d > 0.4) { down = false; cur.classList.remove("pinch"); }
        };
        loop();
      } catch { if (!stop) setStatus("hErr"); }
    })();

    return () => { stop = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); };
  }, [videoRef, cursorRef, targetRef]);

  return status;
}
