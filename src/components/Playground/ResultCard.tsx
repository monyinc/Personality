import { useState } from "react";
import { useStudioStore } from "../../store/useStudioStore";
import type { RunResult } from "../../types";
import { TraitReadout } from "./TraitReadout";
import { TraitRadar } from "./TraitRadar";
import { AffectChart } from "./AffectChart";
import { Icon } from "../Shell/Icon";

export function ResultCard({ result }: { result: RunResult }) {
  const setRating = useStudioStore((s) => s.setRating);
  const [showChart, setShowChart] = useState(false);

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
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold">Trait readout</span>
                <button onClick={() => setShowChart((v) => !v)} className="win-raised px-1.5 py-0.5 text-[10px] cursor-pointer">
                  {showChart ? "Hide chart" : "Show chart"}
                </button>
              </div>
              <TraitReadout traits={result.traits} text={result.text} />
              {showChart && (
                <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: "auto 1fr" }}>
                  <TraitRadar traits={result.traits} text={result.text} />
                  <AffectChart text={result.text} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {result.status === "done" && (
        <div className="flex items-center gap-2 px-2 pb-2">
          <button
            onClick={() => setRating(result.trackId, { vote: result.rating.vote === "up" ? null : "up" })}
            className="win-raised px-2 py-0.5 text-[11px] cursor-pointer flex items-center gap-1"
            style={result.rating.vote === "up" ? { borderStyle: "inset" } : undefined}
          >
            <Icon name="good" size={12} />
            Good
          </button>
          <button
            onClick={() => setRating(result.trackId, { vote: result.rating.vote === "down" ? null : "down" })}
            className="win-raised px-2 py-0.5 text-[11px] cursor-pointer flex items-center gap-1"
            style={result.rating.vote === "down" ? { borderStyle: "inset" } : undefined}
          >
            <Icon name="bad" size={12} />
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
