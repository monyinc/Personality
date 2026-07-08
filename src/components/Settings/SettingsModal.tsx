import { useStudioStore } from "../../store/useStudioStore";
import { PROVIDER_META } from "../../lib/providers";
import type { ProviderId } from "../../types";

export function SettingsModal() {
  const open = useStudioStore((s) => s.settingsOpen);
  const close = useStudioStore((s) => s.closeSettings);
  const providerSettings = useStudioStore((s) => s.providerSettings);
  const setProviderConfig = useStudioStore((s) => s.setProviderConfig);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-(--color-bg) border border-(--color-border-strong) rounded-sm shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--color-border)">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Provider keys
          </h2>
          <button onClick={close} className="text-(--color-text-low) hover:text-(--color-text) cursor-pointer text-[11px] underline underline-offset-2">
            Close
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-auto">
          <p className="text-[12px] text-(--color-text-mid) leading-relaxed">
            Keys are stored only in this browser's local storage and sent directly from your
            browser to each provider's API, never through any server of ours (this app has none,
            it's static).
          </p>

          {(Object.keys(PROVIDER_META) as ProviderId[]).map((p) => {
            const meta = PROVIDER_META[p];
            const cfg = providerSettings[p];
            return (
              <div key={p} className="border border-(--color-border) rounded-sm p-3.5">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-display font-semibold uppercase tracking-wide text-[13px]">
                    {meta.label}
                  </span>
                </div>
                <p className="text-[11px] text-(--color-text-low) mb-2.5">{meta.corsNote}</p>
                <label className="block mb-2">
                  <span className="block text-[10px] label-eyebrow text-(--color-text-low) mb-1">
                    API key
                  </span>
                  <input
                    type="password"
                    value={cfg.apiKey}
                    onChange={(e) => setProviderConfig(p, { apiKey: e.target.value })}
                    placeholder={meta.keyPlaceholder}
                    className="w-full bg-(--color-bg) border border-(--color-border) rounded-sm px-2.5 py-1.5 text-[12.5px] font-mono outline-none focus:border-(--color-text)"
                  />
                </label>
                <label className="block">
                  <span className="block text-[10px] label-eyebrow text-(--color-text-low) mb-1">
                    Model
                  </span>
                  <input
                    value={cfg.model}
                    onChange={(e) => setProviderConfig(p, { model: e.target.value })}
                    placeholder={meta.modelHint}
                    className="w-full bg-(--color-bg) border border-(--color-border) rounded-sm px-2.5 py-1.5 text-[12.5px] font-mono outline-none focus:border-(--color-text)"
                  />
                </label>
                <p className="text-[10px] text-(--color-text-low) mt-1">{meta.modelHint}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
