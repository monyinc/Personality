import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

export interface MenuItem {
  label: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export interface Menu {
  label: string;
  items: MenuItem[];
}

export function MenuBar({ menus }: { menus: Menu[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex h-[22px] items-center px-1 shrink-0 text-[12px]"
      style={{ background: "var(--color-face)", borderBottom: "1px solid var(--color-shadow)" }}
    >
      {menus.map((menu) => (
        <div key={menu.label} className="relative h-full">
          <button
            type="button"
            onClick={() => setOpen(open === menu.label ? null : menu.label)}
            className="h-full px-2 cursor-default"
            style={open === menu.label ? { background: "var(--color-selection)", color: "#fff" } : undefined}
          >
            {menu.label}
          </button>
          {open === menu.label && (
            <div
              className="absolute left-0 top-full z-50 py-1"
              style={{
                background: "var(--color-face)",
                border: "1px solid var(--color-shadow-dark)",
                boxShadow: "2px 2px 4px rgba(0,0,0,0.4)",
                minWidth: 200,
              }}
            >
              {menu.items.map((item, i) =>
                item.separator ? (
                  <div key={i} className="my-1 mx-1" style={{ borderTop: "1px solid var(--color-shadow)" }} />
                ) : (
                  <button
                    key={i}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      item.onClick?.();
                      setOpen(null);
                    }}
                    className="w-full text-left pl-2 pr-4 py-1 text-[12px] cursor-default flex items-center gap-2"
                    style={item.disabled ? { color: "rgba(0,0,0,0.35)" } : undefined}
                    onMouseEnter={(e) => {
                      if (!item.disabled) {
                        e.currentTarget.style.background = "var(--color-selection)";
                        e.currentTarget.style.color = "#fff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "";
                      e.currentTarget.style.color = item.disabled ? "rgba(0,0,0,0.35)" : "";
                    }}
                  >
                    <span className="w-4 shrink-0 flex justify-center">
                      {item.icon && <Icon name={item.icon} size={14} />}
                    </span>
                    {item.label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
