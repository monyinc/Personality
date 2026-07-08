interface FaderProps {
  label: string;
  tag: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const TRACK_HEIGHT = 168;
const TICKS = [0, 25, 50, 75, 100];

export function Fader({ label, tag, leftLabel, rightLabel, value, onChange, disabled }: FaderProps) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${disabled ? "opacity-50" : ""}`} style={{ width: 76 }}>
      <div className="text-[10px] text-center leading-tight h-7">{rightLabel}</div>

      <div className="flex items-center gap-1">
        {/* tick marks, like a volume-control channel strip */}
        <div className="flex flex-col justify-between" style={{ height: TRACK_HEIGHT }}>
          {TICKS.map((t) => (
            <div key={t} style={{ width: 5, height: 1, background: "var(--color-shadow)" }} />
          ))}
        </div>

        <div className="win-sunken relative" style={{ height: TRACK_HEIGHT, width: 20 }}>
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
              height: 20,
              transform: "translate(-50%, -50%) rotate(-90deg)",
            }}
          />
        </div>
      </div>

      <div className="text-[10px] text-center leading-tight h-7">{leftLabel}</div>

      <div className="font-mono text-[11px] tabular-nums">{value}</div>
      <div className="text-[11px] font-bold">{tag}</div>
    </div>
  );
}
