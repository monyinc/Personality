import { useStudioStore } from "../../store/useStudioStore";
import { PROVIDER_META } from "../../lib/providers";
import type { ProviderId } from "../../types";
import { GroupBox } from "../Shell/GroupBox";
import { Icon } from "../Shell/Icon";

export function SettingsModal() {
  const open = useStudioStore((s) => s.settingsOpen);
  const close = useStudioStore((s) => s.closeSettings);
  const providerSettings = useStudioStore((s) => s.providerSettings);
  const setProviderConfig = useStudioStore((s) => s.setProviderConfig);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={close}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="win-panel w-full max-w-lg"
        style={{ boxShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
      >
        <div
          className="flex items-center justify-between h-[26px] px-1.5"
          style={{ background: "linear-gradient(90deg, var(--color-title-from), var(--color-title-to))" }}
        >
          <span className="flex items-center gap-1.5 text-white text-[12px] font-bold">
            <Icon name="keys" size={14} />
            Provider keys
          </span>
          <button onClick={close} className="win-raised w-[18px] h-[16px] text-[10px] leading-none font-bold cursor-pointer">
            &#10005;
          </button>
        </div>

        <div className="p-3 space-y-3 max-h-[70vh] overflow-auto">
          <p className="text-[11px] leading-relaxed">
            Keys are stored only in this browser's local storage and sent directly from your
            browser to each provider's API, never through any server of ours (this app has none,
            it's static).
          </p>

          {(Object.keys(PROVIDER_META) as ProviderId[]).map((p) => {
            const meta = PROVIDER_META[p];
            const cfg = providerSettings[p];
            return (
              <GroupBox key={p} label={meta.label} className="mt-0">
                <p className="text-[11px] mb-2 mt-1">{meta.corsNote}</p>
                <label className="block mb-2">
                  <span className="block text-[10px] font-bold mb-1">API key</span>
                  <input
                    type="password"
                    value={cfg.apiKey}
                    onChange={(e) => setProviderConfig(p, { apiKey: e.target.value })}
                    placeholder={meta.keyPlaceholder}
                    className="win-sunken w-full px-1.5 py-1 text-[12px] font-mono"
                  />
                </label>
                <label className="block">
                  <span className="block text-[10px] font-bold mb-1">Model</span>
                  <input
                    value={cfg.model}
                    onChange={(e) => setProviderConfig(p, { model: e.target.value })}
                    placeholder={meta.modelHint}
                    className="win-sunken w-full px-1.5 py-1 text-[12px] font-mono"
                  />
                </label>
                <p className="text-[10px] mt-1">{meta.modelHint}</p>
              </GroupBox>
            );
          })}
        </div>
      </div>
    </div>
  );
}
