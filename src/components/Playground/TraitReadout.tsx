import { TRAIT_ORDER, TRAITS } from "../../lib/traits";
import { compareTraits } from "../../lib/scoring";
import type { TraitValues } from "../../types";

export function TraitReadout({ traits, text }: { traits: TraitValues; text: string }) {
  const readings = compareTraits(traits, text);
  return (
    <div className="space-y-1.5">
      {TRAIT_ORDER.map((id) => {
        const r = readings.find((x) => x.id === id)!;
        return (
          <div key={id} className="flex items-center gap-2">
            <span className="w-9 shrink-0 text-[9px] font-mono text-(--color-text-low)">
              {TRAITS[id].tag}
            </span>
            <div className="relative flex-1 h-2 rounded-full bg-(--color-bg) border border-(--color-border) overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-(--color-fill-muted)"
                style={{ width: `${r.measured}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-(--color-text)"
                style={{ left: `${r.intended}%` }}
                title={`dialed to ${r.intended}`}
              />
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-(--color-text-low) pt-1">
        Black mark: dialed position. Grey fill: measured in this response (heuristic estimate).
      </p>
    </div>
  );
}
