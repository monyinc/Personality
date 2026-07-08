import { useMemo, useState } from "react";
import { useStudioStore } from "../../store/useStudioStore";
import { TRAIT_ORDER, TRAITS, generateSystemPrompt } from "../../lib/traits";
import type { Track } from "../../types";
import { Fader } from "./Fader";

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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-(--color-border)">
        <input
          value={track.name}
          onChange={(e) => renameTrack(track.id, e.target.value)}
          className="bg-transparent font-display text-lg font-semibold tracking-wide uppercase outline-none text-(--color-text) min-w-0 w-full"
        />
        <button
          onClick={() => resetTraits(track.id)}
          className="label-eyebrow text-[10px] text-(--color-text-low) hover:text-(--color-text) shrink-0 cursor-pointer"
        >
          Reset
        </button>
      </div>

      <div className="flex-1 overflow-auto px-5 py-6">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
          {TRAIT_ORDER.map((id) => {
            const def = TRAITS[id];
            return (
              <Fader
                key={id}
                label={def.label}
                tag={def.tag}
                leftLabel={def.leftLabel}
                rightLabel={def.rightLabel}
                value={track.traits[id]}
                disabled={track.manualOverride}
                onChange={(v) => updateTrait(track.id, id, v)}
              />
            );
          })}
        </div>
      </div>

      <div className="border-t border-(--color-border) bg-(--color-surface) px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="label-eyebrow text-[10px] text-(--color-text-low)">
            System prompt readout
          </span>
          <div className="flex items-center gap-4">
            <button onClick={handleCopy} className="text-[11px] text-(--color-text) underline underline-offset-2 hover:no-underline cursor-pointer font-mono">
              {copied ? "copied" : "copy"}
            </button>
            <label className="flex items-center gap-2 text-[11px] text-(--color-text-mid) cursor-pointer select-none">
              <input
                type="checkbox"
                checked={track.manualOverride}
                onChange={() => toggleManualOverride(track.id)}
                className="accent-(--color-fill)"
              />
              hand-edit override
            </label>
          </div>
        </div>
        {track.manualOverride ? (
          <textarea
            value={track.manualPrompt || generated}
            onChange={(e) => setManualPrompt(track.id, e.target.value)}
            rows={6}
            className="w-full resize-y rounded-sm bg-(--color-bg) border border-(--color-border) px-3 py-2 font-mono text-[12.5px] leading-relaxed text-(--color-text) outline-none focus:border-(--color-text)"
          />
        ) : (
          <pre className="w-full max-h-40 overflow-auto rounded-sm bg-(--color-bg) border border-(--color-border) px-3 py-2 font-mono text-[12.5px] leading-relaxed text-(--color-text-mid) whitespace-pre-wrap">
            {generated}
          </pre>
        )}
        {track.manualOverride && (
          <p className="mt-1.5 text-[11px] text-(--color-text-low)">
            Faders are disengaged while hand-editing, like disabling automation on a channel strip.
          </p>
        )}
      </div>
    </div>
  );
}
