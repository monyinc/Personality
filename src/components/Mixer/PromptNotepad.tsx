import { useMemo, useState } from "react";
import { useStudioStore } from "../../store/useStudioStore";
import { effectiveSystemPrompt, generateSystemPrompt, TRAITS } from "../../lib/traits";
import { optimizeTrackPrompt, type OptimizeProgress } from "../../lib/optimizer";
import { PROVIDER_META } from "../../lib/providers";
import type { Track } from "../../types";
import { Icon } from "../Shell/Icon";

const PHASE_LABELS: Record<OptimizeProgress["phase"], string> = {
  drafting: "drafting prompt",
  auditioning: "auditioning take",
  scoring: "scoring traits",
};

export function PromptNotepad({ track }: { track: Track }) {
  const toggleManualOverride = useStudioStore((s) => s.toggleManualOverride);
  const setManualPrompt = useStudioStore((s) => s.setManualPrompt);
  const applyOptimizedPrompt = useStudioStore((s) => s.applyOptimizedPrompt);
  const selectedProvider = useStudioStore((s) => s.selectedProvider);
  const providerSettings = useStudioStore((s) => s.providerSettings);
  const results = useStudioStore((s) => s.results);
  const [copied, setCopied] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeStatus, setOptimizeStatus] = useState("");
  const [optimizeError, setOptimizeError] = useState("");

  const generated = useMemo(
    () => generateSystemPrompt(track.name, track.traits),
    [track.name, track.traits],
  );
  const effectivePrompt = effectiveSystemPrompt(track);

  function handleCopy() {
    navigator.clipboard.writeText(effectivePrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  async function handleOptimize() {
    if (optimizing) return;
    setOptimizing(true);
    setOptimizeError("");
    setOptimizeStatus("Starting…");
    try {
      const outcome = await optimizeTrackPrompt({
        provider: selectedProvider,
        config: providerSettings[selectedProvider],
        track,
        ratedTakes: results.filter((r) => r.trackId === track.id && r.status === "done"),
        onProgress: (p) =>
          setOptimizeStatus(`Round ${p.round}/${p.maxRounds} · ${PHASE_LABELS[p.phase]}…`),
      });
      applyOptimizedPrompt(track.id, outcome.prompt);
      const drift = outcome.readings
        .map((r) => `${TRAITS[r.id].tag} ${r.delta > 0 ? "+" : ""}${r.delta}`)
        .join("  ");
      setOptimizeStatus(
        `${outcome.converged ? "Converged" : "Best of"} ${outcome.rounds} round${outcome.rounds > 1 ? "s" : ""} · drift ${drift}`,
      );
    } catch (err) {
      setOptimizeStatus("");
      setOptimizeError(err instanceof Error ? err.message : String(err));
    } finally {
      setOptimizing(false);
    }
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
          <input
            type="checkbox"
            checked={track.manualOverride}
            onChange={() => toggleManualOverride(track.id, generated)}
          />
          Edit as text
        </label>
        <button
          onClick={handleOptimize}
          disabled={optimizing}
          title={`Have ${PROVIDER_META[selectedProvider].label} write, audition, and refine this prompt against the dial targets`}
          className="win-raised px-2 py-0.5 ml-auto cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Icon name="run" size={12} />
          {optimizing ? "Optimizing…" : "Optimize"}
        </button>
        <button onClick={handleCopy} className="win-raised px-2 py-0.5 cursor-pointer">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {(optimizeStatus || optimizeError) && (
        <div
          className="px-2 py-1 shrink-0 text-[10px]"
          style={{ borderBottom: "1px solid var(--color-shadow)", color: optimizeError ? "var(--color-error, #a00)" : undefined }}
        >
          {optimizeError || optimizeStatus}
        </div>
      )}

      {track.manualOverride ? (
        <textarea
          value={effectivePrompt}
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
