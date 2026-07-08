import { useMemo, useState } from "react";
import { useStudioStore } from "../../store/useStudioStore";
import { generateSystemPrompt } from "../../lib/traits";
import type { Track } from "../../types";
import { Icon } from "../Shell/Icon";

export function PromptNotepad({ track }: { track: Track }) {
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
    <div className="win-panel h-full flex flex-col">
      <div
        className="flex items-center gap-1.5 h-[24px] px-1.5 shrink-0"
        style={{ background: "linear-gradient(90deg, var(--color-title-from), var(--color-title-to))" }}
      >
        <Icon name="notepad" size={14} />
        <span className="text-white text-[11px] font-bold truncate">
          {track.name.toLowerCase().replace(/\s+/g, "-") || "prompt"}.txt - Notepad
        </span>
      </div>

      <div
        className="flex items-center gap-3 px-2 py-1 shrink-0 text-[11px]"
        style={{ borderBottom: "1px solid var(--color-shadow)" }}
      >
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input type="checkbox" checked={track.manualOverride} onChange={() => toggleManualOverride(track.id)} />
          Edit as text
        </label>
        <button onClick={handleCopy} className="win-raised px-2 py-0.5 ml-auto cursor-pointer">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {track.manualOverride ? (
        <textarea
          value={track.manualPrompt || generated}
          onChange={(e) => setManualPrompt(track.id, e.target.value)}
          className="win-sunken flex-1 m-1.5 resize-none px-2 py-1.5 font-mono text-[12px] leading-relaxed"
        />
      ) : (
        <pre className="win-sunken flex-1 m-1.5 overflow-auto px-2 py-1.5 font-mono text-[12px] leading-relaxed whitespace-pre-wrap">
          {generated}
        </pre>
      )}

      {track.manualOverride && (
        <p className="text-[10px] px-2 pb-1.5">
          Dials are disengaged while editing as text, like typing over a recorded automation pass.
        </p>
      )}
    </div>
  );
}
