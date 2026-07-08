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
            <div className="relative flex-1 h-2 rounded-full bg-(--color-console) border border-(--color-hairline) overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-(--color-teal) opacity-70"
                style={{ width: `${r.measured}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-(--color-amber)"
                style={{ left: `${r.intended}%` }}
                title={`dialed to ${r.intended}`}
              />
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-(--color-text-low) pt-1">
        <span className="text-(--color-amber)">▮</span> dialed position &nbsp;
        <span className="text-(--color-teal)">▮</span> measured in this response (heuristic estimate)
      </p>
    </div>
  );
}
