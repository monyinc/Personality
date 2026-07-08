import { Icon } from "./Icon";

const LINKS = [
  { label: "Website", href: "https://usemony.com/", icon: "website" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/monyinc/" },
  { label: "X", href: "https://x.com/monycompany" },
  { label: "GitHub", href: "https://github.com/monyinc" },
];

export function FooterLinks() {
  return (
    <div className="flex items-center gap-1 shrink-0">
      {LINKS.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="win-raised px-2 h-[16px] flex items-center gap-1 text-[11px] no-underline text-black cursor-pointer"
        >
          {l.icon && <Icon name={l.icon} size={12} />}
          {l.label}
        </a>
      ))}
    </div>
  );
}
