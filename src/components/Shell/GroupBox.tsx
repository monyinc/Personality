import type { ReactNode } from "react";

export function GroupBox({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`win-groovebox mt-2.5 px-3 pb-3 pt-2 ${className}`}>
      <span className="win-groovebox-label">{label}</span>
      {children}
    </div>
  );
}
