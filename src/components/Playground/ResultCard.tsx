import { useStudioStore } from "../../store/useStudioStore";
import type { RunResult } from "../../types";
import { TraitReadout } from "./TraitReadout";

export function ResultCard({ result }: { result: RunResult }) {
  const setRating = useStudioStore((s) => s.setRating);

  return (
    <div className="flex flex-col rounded-sm border border-(--color-border) bg-(--color-surface) min-w-0">
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-(--color-border)">
        <span className="font-display uppercase tracking-wide text-[13px] font-semibold truncate">
          {result.trackName}
        </span>
        <span className="ml-auto text-[10px] font-mono text-(--color-text-low) shrink-0">
          {result.model}
          {result.latencyMs != null ? ` (${(result.latencyMs / 1000).toFixed(1)}s)` : ""}
        </span>
      </div>

      <div className="px-3.5 py-3 min-h-24">
        {result.status === "pending" && (
          <p className="text-[13px] text-(--color-text-low) animate-pulse">Recording take</p>
        )}
        {result.status === "error" && (
          <p className="text-[13px] text-(--color-text)">{result.error}</p>
        )}
        {result.status === "done" && (
          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap text-(--color-text)">
            {result.text}
          </p>
        )}
      </div>

      {result.status === "done" && result.text && (
        <div className="px-3.5 py-3 border-t border-(--color-border)">
          {result.manualOverride ? (
            <p className="text-[11px] text-(--color-text-low)">
              Hand-edited prompt, no dial readout to compare against.
            </p>
          ) : (
            <TraitReadout traits={result.traits} text={result.text} />
          )}
        </div>
      )}

      {result.status === "done" && (
        <div className="flex items-center gap-3 px-3.5 py-2.5 border-t border-(--color-border)">
          <button
            onClick={() =>
              setRating(result.trackId, { vote: result.rating.vote === "up" ? null : "up" })
            }
            className={`cursor-pointer text-[11px] px-2 py-0.5 rounded-sm border ${
              result.rating.vote === "up"
                ? "border-(--color-text) text-(--color-text) font-semibold"
                : "border-(--color-border) text-(--color-text-low) hover:border-(--color-border-strong)"
            }`}
          >
            Good
          </button>
          <button
            onClick={() =>
              setRating(result.trackId, { vote: result.rating.vote === "down" ? null : "down" })
            }
            className={`cursor-pointer text-[11px] px-2 py-0.5 rounded-sm border ${
              result.rating.vote === "down"
                ? "border-(--color-text) text-(--color-text) font-semibold"
                : "border-(--color-border) text-(--color-text-low) hover:border-(--color-border-strong)"
            }`}
          >
            Bad
          </button>
          <input
            value={result.rating.note}
            onChange={(e) => setRating(result.trackId, { note: e.target.value })}
            placeholder="Note this take"
            className="flex-1 min-w-0 bg-transparent text-[11px] text-(--color-text-mid) placeholder:text-(--color-text-low) outline-none border-b border-transparent focus:border-(--color-border-strong)"
          />
        </div>
      )}
    </div>
  );
}
