import { useState } from "react";
import { useStudioStore, emptyRunResult } from "../../store/useStudioStore";
import { effectiveSystemPrompt } from "../../lib/traits";
import { callProvider, PROVIDER_META } from "../../lib/providers";
import type { ProviderId, Track } from "../../types";
import { ResultCard } from "./ResultCard";
import { ComparisonPicker } from "./ComparisonPicker";
import { GroupBox } from "../Shell/GroupBox";
import { Icon } from "../Shell/Icon";

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
      emptyRunResult(t, effectiveSystemPrompt(t), selectedProvider, cfg.model),
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
    <div className="flex flex-col h-full overflow-auto p-3">
      <GroupBox label="Playground" className="mt-0">
        <div className="flex items-center gap-3 flex-wrap pt-2 pb-2">
          <div className="flex win-sunken p-0.5">
            {(["single", "multitrack"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-2.5 py-1 text-[11px] cursor-pointer"
                style={mode === m ? { background: "var(--color-selection)", color: "#fff" } : undefined}
              >
                {m === "single" ? "Single" : "Multitrack A/B"}
              </button>
            ))}
          </div>

          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as ProviderId)}
            className="win-sunken text-[11px] px-1 py-1"
          >
            {(Object.keys(PROVIDER_META) as ProviderId[]).map((p) => (
              <option key={p} value={p}>
                {PROVIDER_META[p].label}
              </option>
            ))}
          </select>
          <button onClick={openSettings} className="win-raised px-2.5 py-1 text-[11px] cursor-pointer flex items-center gap-1.5">
            <Icon name="keys" />
            Provider keys
          </button>
        </div>

        {mode === "multitrack" && (
          <div className="pb-2">
            <ComparisonPicker />
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 pb-2">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setScenarioId(s.id);
                setCustomMessage("");
              }}
              className="win-raised px-2 py-1 text-[11px] cursor-pointer"
              style={
                scenarioId === s.id && !customMessage ? { borderStyle: "inset" } : undefined
              }
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-start">
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Or write your own test message"
            rows={2}
            className="win-sunken flex-1 resize-none px-2 py-1.5 text-[12px]"
          />
          <div className="flex flex-col gap-1.5">
            <button
              onClick={run}
              disabled={isRunning || !message.trim() || targetTracks.length === 0}
              className="win-raised px-4 py-1.5 text-[12px] font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <Icon name="run" />
              {isRunning ? "Running" : "Run"}
            </button>
            {customMessage.trim() && (
              <button onClick={saveAsScenario} className="text-[10px] underline cursor-pointer">
                {savingScenario ? "Saved" : "Save as scenario"}
              </button>
            )}
          </div>
        </div>
      </GroupBox>

      <GroupBox label="Takes" className="flex-1">
        {results.length === 0 ? (
          <p className="text-[12px] pt-2">No takes yet. Pick a scenario or write a message, then hit Run.</p>
        ) : (
          <div
            className="grid gap-3 pt-2"
            style={{ gridTemplateColumns: `repeat(${Math.min(results.length, 2)}, minmax(0, 1fr))` }}
          >
            {results.map((r) => (
              <ResultCard key={r.trackId} result={r} />
            ))}
          </div>
        )}
      </GroupBox>
    </div>
  );
}
