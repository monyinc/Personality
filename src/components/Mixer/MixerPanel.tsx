import { useStudioStore } from "../../store/useStudioStore";
import { TRAIT_ORDER, TRAITS } from "../../lib/traits";
import type { Track } from "../../types";
import { Fader } from "./Fader";
import { GroupBox } from "../Shell/GroupBox";
import { Icon } from "../Shell/Icon";

export function MixerPanel({ track }: { track: Track }) {
  const updateTrait = useStudioStore((s) => s.updateTrait);
  const resetTraits = useStudioStore((s) => s.resetTraits);
  const renameTrack = useStudioStore((s) => s.renameTrack);

  return (
    <div className="flex flex-col h-full win-scroll">
      <div className="flex items-center gap-2 px-2 py-1.5" style={{ borderBottom: "1px solid var(--color-shadow)" }}>
        <span className="text-[11px] font-bold shrink-0">Track name:</span>
        <input
          value={track.name}
          onChange={(e) => renameTrack(track.id, e.target.value)}
          className="win-sunken px-1.5 py-0.5 text-[12px] flex-1 min-w-0"
        />
        <button onClick={() => resetTraits(track.id)} className="win-raised px-2.5 py-1 text-[11px] cursor-pointer shrink-0 flex items-center gap-1.5">
          <Icon name="reset" />
          Reset dials
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <GroupBox label="Personality mixer (Big Five)" className="mt-0">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-4 pt-2">
            {TRAIT_ORDER.map((id) => {
              const def = TRAITS[id];
              return (
                <div key={id} title={`Facets: ${def.facets.join(", ")}`}>
                  <Fader
                    label={def.label}
                    tag={def.tag}
                    leftLabel={def.leftLabel}
                    rightLabel={def.rightLabel}
                    value={track.traits[id]}
                    disabled={track.manualOverride}
                    onChange={(v) => updateTrait(track.id, id, v)}
                  />
                </div>
              );
            })}
          </div>
        </GroupBox>
      </div>
    </div>
  );
}
