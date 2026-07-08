import { TRAIT_ORDER, TRAITS } from "../../lib/traits";
import { compareTraits } from "../../lib/scoring";
import type { TraitValues } from "../../types";

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 68;
const GRID_LEVELS = [25, 50, 75, 100];

function pointFor(index: number, value: number) {
  const angle = (Math.PI / 180) * (-90 + index * (360 / TRAIT_ORDER.length));
  const r = (value / 100) * RADIUS;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)] as const;
}

function polygonPoints(values: number[]) {
  return values.map((v, i) => pointFor(i, v).join(",")).join(" ");
}

export function TraitRadar({ traits, text }: { traits: TraitValues; text: string }) {
  const readings = compareTraits(traits, text);
  const intended = TRAIT_ORDER.map((id) => readings.find((r) => r.id === id)!.intended);
  const measured = TRAIT_ORDER.map((id) => readings.find((r) => r.id === id)!.measured);

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE + 14} viewBox={`0 0 ${SIZE} ${SIZE + 14}`}>
        {/* grid pentagons */}
        {GRID_LEVELS.map((level) => (
          <polygon
            key={level}
            points={polygonPoints(TRAIT_ORDER.map(() => level))}
            fill="none"
            stroke="var(--color-shadow)"
            strokeWidth={1}
          />
        ))}
        {/* spokes */}
        {TRAIT_ORDER.map((_, i) => {
          const [x, y] = pointFor(i, 100);
          return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="var(--color-shadow)" strokeWidth={1} />;
        })}
        {/* measured: filled grey */}
        <polygon points={polygonPoints(measured)} fill="var(--color-shadow)" fillOpacity={0.35} stroke="#000" strokeWidth={1.5} />
        {/* intended: dashed black outline */}
        <polygon points={polygonPoints(intended)} fill="none" stroke="#000" strokeWidth={1.5} strokeDasharray="4,3" />
        {/* axis labels */}
        {TRAIT_ORDER.map((id, i) => {
          const [x, y] = pointFor(i, 122);
          return (
            <text
              key={id}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontFamily="var(--font-ui)"
              fontWeight="bold"
              fill="#000"
            >
              {TRAITS[id].tag}
            </text>
          );
        })}
      </svg>
      <p className="text-[10px] flex items-center gap-3">
        <span className="flex items-center gap-1">
          <svg width={10} height={10}><rect x={0} y={0} width={10} height={10} fill="none" stroke="#000" strokeWidth={1.5} strokeDasharray="3,2" /></svg>
          Dialed
        </span>
        <span className="flex items-center gap-1">
          <svg width={10} height={10}><rect x={0} y={0} width={10} height={10} fill="var(--color-shadow)" fillOpacity={0.35} stroke="#000" /></svg>
          Measured
        </span>
      </p>
    </div>
  );
}
