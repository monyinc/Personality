import { useMemo, useState } from "react";
import { useStudioStore } from "../../store/useStudioStore";
import { TRAIT_ORDER, TRAITS, generateSystemPrompt } from "../../lib/traits";
import type { Track } from "../../types";
import { Fader } from "./Fader";
import { GroupBox } from "../Shell/GroupBox";

export function MixerPanel({ track }: { track: Track }) {
  const updateTrait = useStudioStore((s) => s.updateTrait);
  const resetTraits = useStudioStore((s) => s.resetTraits);
  const renameTrack = useStudioStore((s) => s.renameTrack);
  const toggleManualOverride = useStudioStore((s) => s.toggleManualOverride);
  const setManualPrompt = useStudioStore((s) => s.setManualPrompt);
  const [copied, setCopied] = useState(false);

  const generated = useMemo(
    () => generateSystemPrompt(track.name, track.traits),
    [track.name, track.traits],
  );
  const effectivePrompt = track.manualOverride ? track.manualPrompt : generated;

  function handleCopy() {
    navigator.clipboard.writeText(effectivePrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex flex-col h-full win-scroll">
      <div className="flex items-center gap-2 px-2 py-1.5" style={{ borderBottom: "1px solid var(--color-shadow)" }}>
        <span className="text-[11px] font-bold shrink-0">Track name:</span>
        <input
          value={track.name}
          onChange={(e) => renameTrack(track.id, e.target.value)}
          className="win-sunken px-1.5 py-0.5 text-[12px] flex-1 min-w-0"
        />
        <button onClick={() => resetTraits(track.id)} className="win-raised px-2.5 py-1 text-[11px] cursor-pointer shrink-0">
          Reset dials
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <GroupBox label="Personality mixer (Big Five)">
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

        <GroupBox label="System prompt">
          <div className="flex items-center justify-between mt-1 mb-1.5">
            <label className="flex items-center gap-1.5 text-[11px] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={track.manualOverride}
                onChange={() => toggleManualOverride(track.id)}
              />
              Edit as text
            </label>
            <button onClick={handleCopy} className="win-raised px-2.5 py-1 text-[11px] cursor-pointer">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          {track.manualOverride ? (
            <textarea
              value={track.manualPrompt || generated}
              onChange={(e) => setManualPrompt(track.id, e.target.value)}
              rows={7}
              className="win-sunken w-full resize-y px-2 py-1.5 font-mono text-[12px] leading-relaxed"
            />
          ) : (
            <pre className="win-sunken w-full max-h-44 overflow-auto px-2 py-1.5 font-mono text-[12px] leading-relaxed whitespace-pre-wrap">
              {generated}
            </pre>
          )}
          {track.manualOverride && (
            <p className="mt-1.5 text-[11px]">
              Dials are disengaged while editing as text, like typing over a recorded automation pass.
            </p>
          )}
        </GroupBox>
      </div>
    </div>
  );
}
