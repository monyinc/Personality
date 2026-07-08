import { measureAffectCategories } from "../../lib/scoring";

const SCALE_MAX = 6;

export function AffectChart({ text }: { text: string }) {
  const categories = measureAffectCategories(text);

  return (
    <div className="win-sunken p-2 space-y-1.5">
      {categories.map((c) => {
        const pct = Math.min(100, (c.count / SCALE_MAX) * 100);
        return (
          <div key={c.label} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-[10px] text-right">{c.label}</span>
            <div className="relative flex-1 h-3" style={{ background: "repeating-linear-gradient(90deg, #d8d8d8 0, #d8d8d8 1px, transparent 1px, transparent 10px)" }}>
              <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: "var(--color-selection)" }} />
            </div>
            <span className="w-4 shrink-0 text-[10px] font-mono">{c.count}</span>
          </div>
        );
      })}
      <p className="text-[9px] pt-1">Word-category hits (LIWC-style count), scale caps at {SCALE_MAX}+.</p>
    </div>
  );
}
