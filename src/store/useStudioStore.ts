import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ProviderId,
  ProviderSettings,
  Rating,
  RunResult,
  Scenario,
  Track,
  TraitId,
} from "../types";
import { defaultTraitValues } from "../lib/traits";
import { PROVIDER_META } from "../lib/providers";

const TALLY_COLORS = ["#E8A23D", "#4FB0A5", "#E5484D", "#7C9CDB", "#C77DFF", "#8FBF5F"];

function uid(): string {
  return crypto.randomUUID();
}

function makeTrack(partial: Partial<Track> & { name: string }, index: number): Track {
  const now = Date.now();
  return {
    id: uid(),
    color: TALLY_COLORS[index % TALLY_COLORS.length],
    traits: defaultTraitValues(),
    manualOverride: false,
    manualPrompt: "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

function seedTracks(): Track[] {
  return [
    makeTrack(
      {
        name: "Professional",
        traits: {
          warmth: 35, formality: 78, verbosity: 55, directness: 65,
          structure: 72, proactivity: 50, playfulness: 15, confidence: 68,
        },
      },
      0,
    ),
    makeTrack(
      {
        name: "Efficient",
        traits: {
          warmth: 30, formality: 50, verbosity: 8, directness: 82,
          structure: 48, proactivity: 28, playfulness: 15, confidence: 75,
        },
      },
      1,
    ),
    makeTrack(
      {
        name: "Fact-Based",
        traits: {
          warmth: 28, formality: 65, verbosity: 62, directness: 70,
          structure: 66, proactivity: 48, playfulness: 8, confidence: 55,
        },
      },
      2,
    ),
    makeTrack(
      {
        name: "Exploratory",
        traits: {
          warmth: 66, formality: 28, verbosity: 70, directness: 45,
          structure: 40, proactivity: 70, playfulness: 68, confidence: 50,
        },
      },
      3,
    ),
  ];
}

export const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: "reimbursement",
    label: "Reimbursement policy announcement",
    prompt: "Write a short company-wide announcement about a new travel reimbursement policy: receipts required over $25, submitted within 30 days.",
  },
  {
    id: "grocery",
    label: "Weekly grocery list",
    prompt: "Give me a grocery list for a week of high-protein dinners for two people.",
  },
  {
    id: "holidays",
    label: "Upcoming holidays",
    prompt: "What US federal holidays are coming up in the next two months?",
  },
  {
    id: "weather",
    label: "Explain the weather",
    prompt: "Explain why it's raining today in simple terms.",
  },
  {
    id: "bug",
    label: "Deliver bad news",
    prompt: "I just found out the feature we shipped yesterday has a bug that deleted some user data. Help me write a message to my manager.",
  },
];

function emptyRating(): Rating {
  return { vote: null, note: "" };
}

function defaultProviderSettings(): ProviderSettings {
  return {
    anthropic: { apiKey: "", model: PROVIDER_META.anthropic.defaultModel },
    openai: { apiKey: "", model: PROVIDER_META.openai.defaultModel },
    gemini: { apiKey: "", model: PROVIDER_META.gemini.defaultModel },
    openrouter: { apiKey: "", model: PROVIDER_META.openrouter.defaultModel },
  };
}

interface StudioState {
  tracks: Track[];
  activeTrackId: string;
  providerSettings: ProviderSettings;
  selectedProvider: ProviderId;
  scenarios: Scenario[];
  comparisonTrackIds: string[];
  results: RunResult[];
  settingsOpen: boolean;
  isRunning: boolean;

  addTrack: () => void;
  duplicateTrack: (id: string) => void;
  deleteTrack: (id: string) => void;
  renameTrack: (id: string, name: string) => void;
  setActiveTrack: (id: string) => void;
  updateTrait: (id: string, trait: TraitId, value: number) => void;
  resetTraits: (id: string) => void;
  toggleManualOverride: (id: string) => void;
  setManualPrompt: (id: string, text: string) => void;

  setProviderConfig: (provider: ProviderId, patch: Partial<{ apiKey: string; model: string }>) => void;
  setSelectedProvider: (provider: ProviderId) => void;

  addScenario: (label: string, prompt: string) => void;

  toggleComparisonTrack: (id: string) => void;
  setComparisonTracks: (ids: string[]) => void;

  setResults: (results: RunResult[]) => void;
  updateResult: (trackId: string, patch: Partial<RunResult>) => void;
  setRating: (trackId: string, rating: Partial<Rating>) => void;
  setRunning: (running: boolean) => void;

  openSettings: () => void;
  closeSettings: () => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      tracks: seedTracks(),
      activeTrackId: "",
      providerSettings: defaultProviderSettings(),
      selectedProvider: "anthropic",
      scenarios: DEFAULT_SCENARIOS,
      comparisonTrackIds: [],
      results: [],
      settingsOpen: false,
      isRunning: false,

      addTrack: () => {
        const tracks = get().tracks;
        const track = makeTrack({ name: `New Track ${tracks.length + 1}` }, tracks.length);
        set({ tracks: [...tracks, track], activeTrackId: track.id });
      },
      duplicateTrack: (id) => {
        const tracks = get().tracks;
        const src = tracks.find((t) => t.id === id);
        if (!src) return;
        const copy = makeTrack(
          { ...src, id: undefined, name: `${src.name} copy` } as Partial<Track> & { name: string },
          tracks.length,
        );
        set({ tracks: [...tracks, copy], activeTrackId: copy.id });
      },
      deleteTrack: (id) => {
        const tracks = get().tracks.filter((t) => t.id !== id);
        const active = get().activeTrackId === id ? (tracks[0]?.id ?? "") : get().activeTrackId;
        set({
          tracks,
          activeTrackId: active,
          comparisonTrackIds: get().comparisonTrackIds.filter((t) => t !== id),
        });
      },
      renameTrack: (id, name) => {
        set({
          tracks: get().tracks.map((t) => (t.id === id ? { ...t, name, updatedAt: Date.now() } : t)),
        });
      },
      setActiveTrack: (id) => set({ activeTrackId: id }),
      updateTrait: (id, trait, value) => {
        set({
          tracks: get().tracks.map((t) =>
            t.id === id
              ? { ...t, traits: { ...t.traits, [trait]: value }, updatedAt: Date.now() }
              : t,
          ),
        });
      },
      resetTraits: (id) => {
        set({
          tracks: get().tracks.map((t) =>
            t.id === id ? { ...t, traits: defaultTraitValues(), updatedAt: Date.now() } : t,
          ),
        });
      },
      toggleManualOverride: (id) => {
        set({
          tracks: get().tracks.map((t) =>
            t.id === id ? { ...t, manualOverride: !t.manualOverride } : t,
          ),
        });
      },
      setManualPrompt: (id, text) => {
        set({
          tracks: get().tracks.map((t) =>
            t.id === id ? { ...t, manualPrompt: text, updatedAt: Date.now() } : t,
          ),
        });
      },

      setProviderConfig: (provider, patch) => {
        set({
          providerSettings: {
            ...get().providerSettings,
            [provider]: { ...get().providerSettings[provider], ...patch },
          },
        });
      },
      setSelectedProvider: (provider) => set({ selectedProvider: provider }),

      addScenario: (label, prompt) => {
        set({
          scenarios: [...get().scenarios, { id: uid(), label, prompt }],
        });
      },

      toggleComparisonTrack: (id) => {
        const cur = get().comparisonTrackIds;
        set({
          comparisonTrackIds: cur.includes(id)
            ? cur.filter((t) => t !== id)
            : cur.length >= 4
              ? cur
              : [...cur, id],
        });
      },
      setComparisonTracks: (ids) => set({ comparisonTrackIds: ids }),

      setResults: (results) => set({ results }),
      updateResult: (trackId, patch) => {
        set({
          results: get().results.map((r) => (r.trackId === trackId ? { ...r, ...patch } : r)),
        });
      },
      setRating: (trackId, rating) => {
        set({
          results: get().results.map((r) =>
            r.trackId === trackId ? { ...r, rating: { ...r.rating, ...rating } } : r,
          ),
        });
      },
      setRunning: (running) => set({ isRunning: running }),

      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
    }),
    {
      name: "personality-studio",
      partialize: (state) => ({
        tracks: state.tracks,
        activeTrackId: state.activeTrackId,
        providerSettings: state.providerSettings,
        selectedProvider: state.selectedProvider,
        scenarios: state.scenarios,
      }),
    },
  ),
);

export function emptyRunResult(track: Track, systemPrompt: string, provider: ProviderId, model: string): RunResult {
  return {
    trackId: track.id,
    trackName: track.name,
    trackColor: track.color,
    systemPrompt,
    traits: track.traits,
    manualOverride: track.manualOverride,
    provider,
    model,
    status: "pending",
    rating: emptyRating(),
  };
}

// ensure an active track exists on first load
if (!useStudioStore.getState().activeTrackId && useStudioStore.getState().tracks[0]) {
  useStudioStore.getState().setActiveTrack(useStudioStore.getState().tracks[0].id);
}
