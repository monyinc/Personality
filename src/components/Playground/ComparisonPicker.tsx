import { useStudioStore } from "../../store/useStudioStore";
import { Icon } from "../Shell/Icon";

const MAX_TRACKS = 4;

export function ComparisonPicker() {
  const tracks = useStudioStore((s) => s.tracks);
  const comparisonTrackIds = useStudioStore((s) => s.comparisonTrackIds);
  const toggleComparisonTrack = useStudioStore((s) => s.toggleComparisonTrack);

  const selected = comparisonTrackIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => !!t);
  const available = tracks.filter((t) => !comparisonTrackIds.includes(t.id));

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="win-sunken">
        <div className="px-2 py-1 text-[10px] font-bold" style={{ borderBottom: "1px solid var(--color-shadow)" }}>
          Available tracks
        </div>
        <div className="max-h-28 overflow-auto">
          {available.length === 0 && <p className="px-2 py-1.5 text-[11px]">All tracks are in the comparison.</p>}
          {available.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleComparisonTrack(t.id)}
              disabled={comparisonTrackIds.length >= MAX_TRACKS}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-[12px] text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 hover:bg-black/10"
            >
              <Icon name="track" size={12} />
              <span className="flex-1 truncate">{t.name}</span>
              <span aria-hidden>&#8594;</span>
            </button>
          ))}
        </div>
      </div>

      <div className="win-sunken">
        <div className="px-2 py-1 text-[10px] font-bold" style={{ borderBottom: "1px solid var(--color-shadow)" }}>
          Comparing ({selected.length} of {MAX_TRACKS})
        </div>
        <div className="max-h-28 overflow-auto">
          {selected.length === 0 && <p className="px-2 py-1.5 text-[11px]">Add tracks from the left to compare them.</p>}
          {selected.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleComparisonTrack(t.id)}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-[12px] text-left cursor-pointer hover:bg-black/10"
            >
              <span aria-hidden>&#8592;</span>
              <Icon name="track" size={12} />
              <span className="flex-1 truncate">{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
