import { useState } from "react";
import { useStudioStore, emptyRunResult } from "../../store/useStudioStore";
import { generateSystemPrompt } from "../../lib/traits";
import { callProvider, PROVIDER_META } from "../../lib/providers";
import type { ProviderId, Track } from "../../types";
import { ResultCard } from "./ResultCard";

type Mode = "single" | "multitrack";

export function PlaygroundPanel() {
  const tracks = useStudioStore((s) => s.tracks);
  const activeTrackId = useStudioStore((s) => s.activeTrackId);
  const comparisonTrackIds = useStudioStore((s) => s.comparisonTrackIds);
  const scenarios = useStudioStore((s) => s.scenarios);
  const addScenario = useStudioStore((s) => s.addScenario);
  const providerSettings = useStudioStore((s) => s.providerSettings);
  const selectedProvider = useStudioStore((s) => s.selectedProvider);
  const setSelectedProvider = useStudioStore((s) => s.setSelectedProvider);
  const results = useStudioStore((s) => s.results);
  const setResults = useStudioStore((s) => s.setResults);
  const updateResult = useStudioStore((s) => s.updateResult);
  const isRunning = useStudioStore((s) => s.isRunning);
  const setRunning = useStudioStore((s) => s.setRunning);
  const openSettings = useStudioStore((s) => s.openSettings);

  const [mode, setMode] = useState<Mode>("single");
  const [scenarioId, setScenarioId] = useState<string>(scenarios[0]?.id ?? "");
  const [customMessage, setCustomMessage] = useState("");
  const [savingScenario, setSavingScenario] = useState(false);

  const message = customMessage.trim() || scenarios.find((s) => s.id === scenarioId)?.prompt || "";

  const targetTracks: Track[] =
    mode === "single"
      ? tracks.filter((t) => t.id === activeTrackId)
      : tracks.filter((t) => comparisonTrackIds.includes(t.id));

  async function run() {
    if (!message.trim() || targetTracks.length === 0 || isRunning) return;
    setRunning(true);
    const cfg = providerSettings[selectedProvider];
    const initial = targetTracks.map((t) =>
      emptyRunResult(
        t,
        t.manualOverride ? t.manualPrompt : generateSystemPrompt(t.name, t.traits),
        selectedProvider,
        cfg.model,
      ),
    );
    setResults(initial);

    await Promise.all(
      targetTracks.map(async (t, i) => {
        const started = performance.now();
        try {
          const text = await callProvider(selectedProvider, {
            apiKey: cfg.apiKey,
            model: cfg.model,
            systemPrompt: initial[i].systemPrompt,
            userMessage: message,
          });
          updateResult(t.id, { status: "done", text, latencyMs: performance.now() - started });
        } catch (err) {
          updateResult(t.id, {
            status: "error",
            error: err instanceof Error ? err.message : String(err),
            latencyMs: performance.now() - started,
          });
        }
      }),
    );
    setRunning(false);
  }

  function saveAsScenario() {
    if (!customMessage.trim()) return;
    addScenario(customMessage.trim().slice(0, 40), customMessage.trim());
    setSavingScenario(true);
    setTimeout(() => setSavingScenario(false), 1200);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 px-5 py-3 border-b border-(--color-border) flex-wrap">
        <span className="label-eyebrow text-[11px] text-(--color-text-low)">Playground</span>

        <div className="flex rounded-sm border border-(--color-border) overflow-hidden">
          {(["single", "multitrack"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 text-[11px] font-mono cursor-pointer ${
                mode === m
                  ? "bg-(--color-fill) text-(--color-bg) font-semibold"
                  : "text-(--color-text-mid) hover:bg-(--color-surface)"
              }`}
            >
              {m === "single" ? "Single" : "Multitrack A/B"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as ProviderId)}
            className="bg-(--color-bg) border border-(--color-border) rounded-sm text-[11px] font-mono px-2 py-1 outline-none"
          >
            {(Object.keys(PROVIDER_META) as ProviderId[]).map((p) => (
              <option key={p} value={p}>
                {PROVIDER_META[p].label}
              </option>
            ))}
          </select>
          <button
            onClick={openSettings}
            className="text-[11px] font-mono text-(--color-text-low) hover:text-(--color-text) cursor-pointer underline underline-offset-2"
          >
            Settings
          </button>
        </div>
      </div>

      {mode === "multitrack" && (
        <div className="px-5 py-2 border-b border-(--color-border) text-[11px] text-(--color-text-low)">
          {comparisonTrackIds.length === 0
            ? "Mark tracks with the \"AB\" button in the sidebar to include them here."
            : `Comparing ${comparisonTrackIds.length} track${comparisonTrackIds.length > 1 ? "s" : ""}.`}
        </div>
      )}

      <div className="px-5 py-3 border-b border-(--color-border) flex flex-wrap gap-1.5">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setScenarioId(s.id);
              setCustomMessage("");
            }}
            className={`text-[11px] px-2.5 py-1 rounded-full border cursor-pointer ${
              scenarioId === s.id && !customMessage
                ? "border-(--color-text) text-(--color-text)"
                : "border-(--color-border) text-(--color-text-mid) hover:border-(--color-border-strong)"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-3 border-b border-(--color-border) flex gap-2 items-start">
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Or write your own test message"
          rows={2}
          className="flex-1 resize-none bg-(--color-bg) border border-(--color-border) rounded-sm px-3 py-2 text-[13px] outline-none focus:border-(--color-text) text-(--color-text)"
        />
        <div className="flex flex-col gap-1.5">
          <button
            onClick={run}
            disabled={isRunning || !message.trim() || targetTracks.length === 0}
            className="px-4 py-2 rounded-sm bg-(--color-fill) text-(--color-bg) font-display font-semibold uppercase tracking-wide text-[12px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRunning ? "Running" : "Run"}
          </button>
          {customMessage.trim() && (
            <button
              onClick={saveAsScenario}
              className="text-[10px] text-(--color-text-low) hover:text-(--color-text) cursor-pointer underline underline-offset-2"
            >
              {savingScenario ? "saved" : "save as scenario"}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        {results.length === 0 ? (
          <p className="text-[13px] text-(--color-text-low)">
            No takes yet. Pick a scenario or write a message, then hit Run.
          </p>
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${Math.min(results.length, 2)}, minmax(0, 1fr))` }}
          >
            {results.map((r) => (
              <ResultCard key={r.trackId} result={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
