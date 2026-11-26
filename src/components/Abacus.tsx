import { forwardRef } from "react";
import { value, type Rod } from "../lib/abacus";

type Props = { rods: Rod[]; onTap: (rod: number, bead: "u" | number) => void; label: string };

/**
 * Renders the abacus. Every bead carries data-r (rod index) and data-k ("u" or 1-4);
 * the camera hand-control finds beads through these attributes and clicks them,
 * so mouse, touch and hand control all share one code path (onTap).
 */
export const Abacus = forwardRef<HTMLDivElement, Props>(({ rods, onTap, label }, ref) => (
  <div className="abw">
    <div className="ab" ref={ref}>
      <div className="rods">
        {rods.map((r, i) => (
          <div className="rod" key={i}>
            <div className="bar" />
            <div className="bd up" data-r={i} data-k="u" style={{ top: r.u ? 38 : 4 }} onClick={() => onTap(i, "u")} />
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="bd" data-r={i} data-k={k}
                style={{ top: r.l >= k ? 78 + (k - 1) * 30 : 126 + (k - 1) * 30 }} onClick={() => onTap(i, k)} />
            ))}
            <div className="lb">{r.u * 5 + r.l}</div>
          </div>
        ))}
      </div>
      <div className="rd">{label} <b>{value(rods)}</b></div>
    </div>
  </div>
));
