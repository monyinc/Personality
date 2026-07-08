interface FaderProps {
  label: string;
  tag: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const TRACK_HEIGHT = 176;

export function Fader({ label, tag, leftLabel, rightLabel, value, onChange, disabled }: FaderProps) {
  const deviated = Math.abs(value - 50) > 6;
  const intensity = Math.min(1, Math.abs(value - 50) / 50);
  const posFromBottom = (value / 100) * TRACK_HEIGHT;
  const center = TRACK_HEIGHT / 2;
  const fillBottom = value >= 50 ? center : posFromBottom;
  const fillHeight = Math.abs(posFromBottom - center);

  return (
    <div
      className={`flex flex-col items-center gap-2 ${disabled ? "opacity-40" : ""}`}
      style={{ width: 68 }}
    >
      <div className="font-mono text-xs tabular-nums text-(--color-text-mid)">
        {value}
      </div>

      <div className="flex flex-col items-center" style={{ height: TRACK_HEIGHT + 34 }}>
        <div className="text-[9px] uppercase tracking-wide text-(--color-text-low) mb-1 h-6 text-center leading-tight">
          {rightLabel}
        </div>

        <div className="relative" style={{ height: TRACK_HEIGHT, width: 34 }}>
          {/* groove */}
          <div
            className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 rounded-full"
            style={{ width: 6, background: "var(--color-surface)", boxShadow: "inset 0 0 0 1px var(--color-border-strong)" }}
          />
          {/* center detent */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{ top: center - 1, width: 14, height: 2, background: "var(--color-border-strong)" }}
          />
          {/* fill from center toward current value */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              bottom: fillBottom,
              height: Math.max(2, fillHeight),
              width: 6,
              background: "var(--color-fill)",
              opacity: 0.3 + intensity * 0.7,
            }}
          />
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={label}
            className="fader-input"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: TRACK_HEIGHT,
              height: 30,
              transform: "translate(-50%, -50%) rotate(-90deg)",
            }}
          />
        </div>

        <div className="text-[9px] uppercase tracking-wide text-(--color-text-low) mt-1 h-6 text-center leading-tight">
          {leftLabel}
        </div>
      </div>

      <div
        className={`label-eyebrow text-[11px] text-(--color-text) ${deviated ? "" : "opacity-40"}`}
      >
        {tag}
      </div>
    </div>
  );
}
