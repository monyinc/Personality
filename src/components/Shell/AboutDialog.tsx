import { Icon } from "./Icon";

export function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="win-panel w-full max-w-md"
        style={{ boxShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
      >
        <div
          className="flex items-center gap-1.5 justify-between h-[26px] px-1.5"
          style={{
            background: "linear-gradient(90deg, var(--color-title-from), var(--color-title-to))",
          }}
        >
          <span className="flex items-center gap-1.5 text-white text-[12px] font-bold">
            <Icon name="help" size={14} />
            About Personality
          </span>
          <button onClick={onClose} className="win-raised w-[18px] h-[16px] text-[10px] leading-none font-bold cursor-pointer">
            &#10005;
          </button>
        </div>

        <div className="p-4 space-y-3 text-[12px] leading-relaxed">
          <div className="flex justify-center mb-1">
            <Icon name="app" size={32} />
          </div>
          <p>
            Personality mixes an AI's system-prompt behavior on five dials taken
            from the Big Five (Five-Factor Model), the personality-psychology
            taxonomy validated across decades of factor-analytic research
            (Costa &amp; McCrae, NEO-PI-R, 1992).
          </p>
          <p>
            Each dial's instructions are written from two of that trait's real
            NEO-PI-R facets, not invented adjectives. For example, high
            Agreeableness pulls from the Altruism and Straightforwardness
            facets; high Neuroticism pulls from Anxiety and
            Self-Consciousness.
          </p>
          <p>
            After a take, the trait readout estimates where the response
            actually landed using a small LIWC-style word-category count.
            The direction each category is combined in follows published
            language-personality findings: Pennebaker &amp; King (1999),
            Yarkoni (2010), and Park et al. (2015). It is a heuristic
            estimate, not a validated psychometric score.
          </p>
          <div className="flex justify-end pt-1">
            <button onClick={onClose} className="win-raised px-4 py-1 cursor-pointer">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
