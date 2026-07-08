export function TitleBar() {
  return (
    <div
      className="flex items-center justify-between h-[28px] pl-1.5 pr-1 shrink-0 select-none"
      style={{
        background: "linear-gradient(90deg, var(--color-title-from), var(--color-title-to))",
        borderBottom: "1px solid #14306f",
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="inline-block w-[14px] h-[14px]"
          style={{ background: "var(--color-face)", border: "2px outset var(--color-face)" }}
        />
        <span className="text-white text-[13px] font-bold tracking-tight">Personality</span>
      </div>
      <div className="flex gap-[2px]">
        <button type="button" aria-label="Minimize" className="win-raised w-[20px] h-[18px] text-[11px] leading-none font-bold cursor-pointer">
          _
        </button>
        <button type="button" aria-label="Restore" className="win-raised w-[20px] h-[18px] text-[11px] leading-none font-bold cursor-pointer">
          &#9633;
        </button>
        <button type="button" aria-label="Close" className="win-raised w-[20px] h-[18px] text-[11px] leading-none font-bold cursor-pointer">
          &#10005;
        </button>
      </div>
    </div>
  );
}
