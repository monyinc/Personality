import { useState } from "react";
import { useStudioStore } from "./store/useStudioStore";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { MixerPanel } from "./components/Mixer/MixerPanel";
import { PromptNotepad } from "./components/Mixer/PromptNotepad";
import { PlaygroundPanel } from "./components/Playground/PlaygroundPanel";
import { SettingsModal } from "./components/Settings/SettingsModal";
import { TitleBar } from "./components/Shell/TitleBar";
import { MenuBar, type Menu } from "./components/Shell/MenuBar";
import { StatusBar } from "./components/Shell/StatusBar";
import { AboutDialog } from "./components/Shell/AboutDialog";
import { FooterLinks } from "./components/Shell/FooterLinks";

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
        { label: "New track", icon: "new-track", onClick: addTrack },
        { label: "Duplicate track", icon: "duplicate", onClick: () => activeTrack && duplicateTrack(activeTrack.id) },
        { label: "Delete track", icon: "delete", onClick: () => activeTrack && deleteTrack(activeTrack.id), disabled: tracks.length <= 1 },
        { label: "", separator: true },
        { label: "Provider keys", icon: "keys", onClick: openSettings },
      ],
    },
    {
      label: "Track",
      items: [
        { label: "Reset dials", icon: "reset", onClick: () => activeTrack && resetTraits(activeTrack.id) },
      ],
    },
    {
      label: "Help",
      items: [{ label: "About Personality", icon: "help", onClick: () => setAboutOpen(true) }],
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
          <section
            className="basis-[52%] min-h-0 flex flex-col md:flex-row gap-0"
            style={{ borderBottom: "1px solid var(--color-shadow)" }}
          >
            <div className="flex-[1.3] min-w-0 min-h-0" style={{ borderRight: "1px solid var(--color-shadow)" }}>
              {activeTrack && <MixerPanel track={activeTrack} />}
            </div>
            <div className="flex-1 min-w-0 min-h-0 p-2">
              {activeTrack && <PromptNotepad track={activeTrack} />}
            </div>
          </section>
          <section className="flex-1 min-h-0">
            <PlaygroundPanel />
          </section>
        </main>
      </div>

      <StatusBar
        left={activeTrack ? `Track: ${activeTrack.name}` : "No track selected"}
        right={<FooterLinks />}
      />

      <SettingsModal />
      {aboutOpen && <AboutDialog onClose={() => setAboutOpen(false)} />}
    </div>
  );
}
