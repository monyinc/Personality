import { useStudioStore } from "./store/useStudioStore";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { MixerPanel } from "./components/Mixer/MixerPanel";
import { PlaygroundPanel } from "./components/Playground/PlaygroundPanel";
import { SettingsModal } from "./components/Settings/SettingsModal";

export default function App() {
  const tracks = useStudioStore((s) => s.tracks);
  const activeTrackId = useStudioStore((s) => s.activeTrackId);
  const openSettings = useStudioStore((s) => s.openSettings);
  const activeTrack = tracks.find((t) => t.id === activeTrackId) ?? tracks[0];

  return (
    <div className="h-screen w-screen flex flex-col bg-(--color-console) text-(--color-text-hi)">
      <header className="flex items-center gap-3 px-4 h-12 border-b border-(--color-hairline-bright) bg-(--color-console-raised) shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-6 rounded-full bg-(--color-amber)" />
          <span className="w-2 h-4 rounded-full bg-(--color-teal) self-center" />
          <span className="w-2 h-5 rounded-full bg-(--color-amber) self-center" />
        </div>
        <h1 className="font-display text-[17px] font-semibold uppercase tracking-[0.12em]">
          Personality Studio
        </h1>
        <span className="text-[11px] text-(--color-text-low) font-mono ml-1 hidden sm:inline">
          tune, audition &amp; A/B test AI system prompts
        </span>
        <button
          onClick={openSettings}
          className="ml-auto label-eyebrow text-[11px] text-(--color-text-mid) hover:text-(--color-amber) cursor-pointer"
        >
          ⚙ Settings
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-56 border-r border-(--color-hairline) shrink-0 bg-(--color-console-raised) hidden md:block">
          <Sidebar />
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          <section className="basis-[46%] min-h-0 border-b border-(--color-hairline-bright)">
            {activeTrack && <MixerPanel track={activeTrack} />}
          </section>
          <section className="flex-1 min-h-0">
            <PlaygroundPanel />
          </section>
        </main>
      </div>

      <SettingsModal />
    </div>
  );
}
