import { useStudioStore } from "../../store/useStudioStore";

export function Sidebar() {
  const tracks = useStudioStore((s) => s.tracks);
  const activeTrackId = useStudioStore((s) => s.activeTrackId);
  const setActiveTrack = useStudioStore((s) => s.setActiveTrack);
  const addTrack = useStudioStore((s) => s.addTrack);
  const duplicateTrack = useStudioStore((s) => s.duplicateTrack);
  const deleteTrack = useStudioStore((s) => s.deleteTrack);
  const comparisonTrackIds = useStudioStore((s) => s.comparisonTrackIds);
  const toggleComparisonTrack = useStudioStore((s) => s.toggleComparisonTrack);

  return (
    <div className="flex flex-col h-full p-2">
      <div className="text-[11px] font-bold mb-1">Tracks</div>
      <div className="win-sunken flex-1 overflow-auto">
        {tracks.map((t) => {
          const active = t.id === activeTrackId;
          const inComparison = comparisonTrackIds.includes(t.id);
          return (
            <div
              key={t.id}
              onClick={() => setActiveTrack(t.id)}
              className="group flex items-center gap-1.5 px-1.5 py-1 cursor-default text-[12px]"
              style={active ? { background: "var(--color-selection)", color: "#fff" } : undefined}
            >
              <span className="flex-1 truncate">{t.name}</span>
              <button
                title="Add to comparison"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComparisonTrack(t.id);
                }}
                className="win-raised text-[10px] px-1 leading-tight shrink-0 cursor-pointer"
                style={inComparison ? { borderStyle: "inset" } : undefined}
              >
                AB
              </button>
              <button
                title="Duplicate track"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateTrack(t.id);
                }}
                className="win-raised text-[10px] px-1 leading-tight shrink-0 cursor-pointer opacity-0 group-hover:opacity-100"
              >
                Dup
              </button>
              <button
                title="Delete track"
                onClick={(e) => {
                  e.stopPropagation();
                  if (tracks.length > 1) deleteTrack(t.id);
                }}
                className="win-raised text-[10px] px-1 leading-tight shrink-0 cursor-pointer opacity-0 group-hover:opacity-100"
              >
                Del
              </button>
            </div>
          );
        })}
      </div>
      <button onClick={addTrack} className="win-raised mt-2 py-1 text-[11px] cursor-pointer">
        Add track
      </button>
    </div>
  );
}
