export function Icon({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}icons/${name}.png`}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
