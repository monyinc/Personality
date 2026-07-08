import { useState } from "react";
import { useStudioStore } from "./store/useStudioStore";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { MixerPanel } from "./components/Mixer/MixerPanel";
import { PlaygroundPanel } from "./components/Playground/PlaygroundPanel";
import { SettingsModal } from "./components/Settings/SettingsModal";
import { TitleBar } from "./components/Shell/TitleBar";
import { MenuBar, type Menu } from "./components/Shell/MenuBar";
import { StatusBar } from "./components/Shell/StatusBar";
import { AboutDialog } from "./components/Shell/AboutDialog";

export default function App() {
  const tracks = useStudioStore((s) => s.tracks);
  const activeTrackId = useStudioStore((s) => s.activeTrackId);
  const addTrack = useStudioStore((s) => s.addTrack);
  const duplicateTrack = useStudioStore((s) => s.duplicateTrack);
  const deleteTrack = useStudioStore((s) => s.deleteTrack);
  const resetTraits = useStudioStore((s) => s.resetTraits);
  const openSettings = useStudioStore((s) => s.openSettings);
  const activeTrack = tracks.find((t) => t.id === activeTrackId) ?? tracks[0];
  const [aboutOpen, setAboutOpen] = useState(false);

  const menus: Menu[] = [
    {
      label: "File",
      items: [
        { label: "New track", onClick: addTrack },
        { label: "Duplicate track", onClick: () => activeTrack && duplicateTrack(activeTrack.id) },
        { label: "Delete track", onClick: () => activeTrack && deleteTrack(activeTrack.id), disabled: tracks.length <= 1 },
        { label: "", separator: true },
        { label: "Provider keys", onClick: openSettings },
      ],
    },
    {
      label: "Track",
      items: [
        { label: "Reset dials", onClick: () => activeTrack && resetTraits(activeTrack.id) },
      ],
    },
    {
      label: "Help",
      items: [{ label: "About Personality", onClick: () => setAboutOpen(true) }],
    },
  ];

  return (
    <div className="h-screen w-screen flex flex-col" style={{ background: "var(--color-face)" }}>
      <TitleBar />
      <MenuBar menus={menus} />

      <div className="flex flex-1 min-h-0">
        <aside className="w-52 shrink-0 hidden md:block" style={{ borderRight: "1px solid var(--color-shadow)" }}>
          <Sidebar />
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          <section className="basis-[52%] min-h-0" style={{ borderBottom: "1px solid var(--color-shadow)" }}>
            {activeTrack && <MixerPanel track={activeTrack} />}
          </section>
          <section className="flex-1 min-h-0">
            <PlaygroundPanel />
          </section>
        </main>
      </div>

      <StatusBar left={activeTrack ? `Track: ${activeTrack.name}` : "No track selected"} />

      <SettingsModal />
      {aboutOpen && <AboutDialog onClose={() => setAboutOpen(false)} />}
    </div>
  );
}
