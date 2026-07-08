import { useStudioStore } from "../../store/useStudioStore";
import type { RunResult } from "../../types";
import { TraitReadout } from "./TraitReadout";

export function ResultCard({ result }: { result: RunResult }) {
  const setRating = useStudioStore((s) => s.setRating);

  return (
    <div className="win-panel flex flex-col min-w-0">
      <div
        className="flex items-center gap-2 px-2 py-1"
        style={{
          background: "linear-gradient(90deg, var(--color-title-from), var(--color-title-to))",
        }}
      >
        <span className="text-white text-[11px] font-bold truncate">{result.trackName}</span>
        <span className="ml-auto text-white text-[10px] font-mono shrink-0">
          {result.model}
          {result.latencyMs != null ? ` (${(result.latencyMs / 1000).toFixed(1)}s)` : ""}
        </span>
      </div>

      <div className="win-sunken m-1.5 px-2 py-1.5 min-h-24">
        {result.status === "pending" && <p className="text-[12px] animate-pulse">Recording take</p>}
        {result.status === "error" && <p className="text-[12px]">{result.error}</p>}
        {result.status === "done" && (
          <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap">{result.text}</p>
        )}
      </div>

      {result.status === "done" && result.text && (
        <div className="px-2 pb-2">
          {result.manualOverride ? (
            <p className="text-[11px]">Hand-edited prompt, no dial readout to compare against.</p>
          ) : (
            <TraitReadout traits={result.traits} text={result.text} />
          )}
        </div>
      )}

      {result.status === "done" && (
        <div className="flex items-center gap-2 px-2 pb-2">
          <button
            onClick={() => setRating(result.trackId, { vote: result.rating.vote === "up" ? null : "up" })}
            className="win-raised px-2 py-0.5 text-[11px] cursor-pointer"
            style={result.rating.vote === "up" ? { borderStyle: "inset" } : undefined}
          >
            Good
          </button>
          <button
            onClick={() => setRating(result.trackId, { vote: result.rating.vote === "down" ? null : "down" })}
            className="win-raised px-2 py-0.5 text-[11px] cursor-pointer"
            style={result.rating.vote === "down" ? { borderStyle: "inset" } : undefined}
          >
            Bad
          </button>
          <input
            value={result.rating.note}
            onChange={(e) => setRating(result.trackId, { note: e.target.value })}
            placeholder="Note this take"
            className="win-sunken flex-1 min-w-0 px-1.5 py-1 text-[11px]"
          />
        </div>
      )}
    </div>
  );
}
