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
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-(--color-hairline)">
        <span className="label-eyebrow text-[11px] text-(--color-text-low)">Tracks</span>
      </div>
      <div className="flex-1 overflow-auto">
        {tracks.map((t) => {
          const active = t.id === activeTrackId;
          const inComparison = comparisonTrackIds.includes(t.id);
          return (
            <div
              key={t.id}
              onClick={() => setActiveTrack(t.id)}
              className={`group flex items-center gap-2 px-4 py-2.5 border-b border-(--color-hairline) cursor-pointer ${
                active ? "bg-(--color-panel)" : "hover:bg-(--color-console-raised)"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: t.color, boxShadow: active ? `0 0 6px ${t.color}` : "none" }}
              />
              <span className={`flex-1 truncate text-[13px] ${active ? "text-(--color-text-hi)" : "text-(--color-text-mid)"}`}>
                {t.name}
              </span>
              <button
                title="Add to A/B comparison"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComparisonTrack(t.id);
                }}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border shrink-0 cursor-pointer ${
                  inComparison
                    ? "border-(--color-teal) text-(--color-teal)"
                    : "border-(--color-hairline) text-(--color-text-low) opacity-0 group-hover:opacity-100"
                }`}
              >
                AB
              </button>
              <button
                title="Duplicate track"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateTrack(t.id);
                }}
                className="text-(--color-text-low) hover:text-(--color-amber) opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer text-[13px] leading-none"
              >
                ⎘
              </button>
              <button
                title="Delete track"
                onClick={(e) => {
                  e.stopPropagation();
                  if (tracks.length > 1) deleteTrack(t.id);
                }}
                className="text-(--color-text-low) hover:text-(--color-red) opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer text-[13px] leading-none"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <button
        onClick={addTrack}
        className="px-4 py-3 border-t border-(--color-hairline) text-left label-eyebrow text-[11px] text-(--color-text-low) hover:text-(--color-amber) cursor-pointer"
      >
        + New track
      </button>
    </div>
  );
}
