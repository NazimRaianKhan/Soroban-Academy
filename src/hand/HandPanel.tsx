import { useRef, type RefObject } from "react";
import { useApp } from "../ctx";
import { useHand } from "./useHand";

export function HandPanel({ targetRef, onClose }: { targetRef: RefObject<HTMLElement>; onClose: () => void }) {
  const { t } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const status = useHand(videoRef, cursorRef, targetRef);
  return (
    <>
      <div ref={cursorRef} className="hcur" />
      <div className="hpanel">
        <button className="hx" onClick={onClose} aria-label="close">✕</button>
        <video ref={videoRef} muted playsInline />
        <div className="sm">{t(status)}</div>
      </div>
    </>
  );
}
