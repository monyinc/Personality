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
          openness: 35, conscientiousness: 78, extraversion: 42,
          agreeableness: 55, neuroticism: 25,
        },
      },
      0,
    ),
    makeTrack(
      {
        name: "Efficient",
        traits: {
          openness: 25, conscientiousness: 80, extraversion: 35,
          agreeableness: 35, neuroticism: 20,
        },
      },
      1,
    ),
    makeTrack(
      {
        name: "Fact-Based",
        traits: {
          openness: 45, conscientiousness: 75, extraversion: 30,
          agreeableness: 35, neuroticism: 35,
        },
      },
      2,
    ),
    makeTrack(
      {
        name: "Exploratory",
        traits: {
          openness: 78, conscientiousness: 35, extraversion: 72,
          agreeableness: 68, neuroticism: 40,
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
  toggleManualOverride: (id: string, seedPrompt?: string) => void;
  setManualPrompt: (id: string, text: string) => void;
  applyOptimizedPrompt: (id: string, text: string) => void;

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
              ? {
                  ...t,
                  traits: { ...t.traits, [trait]: value },
                  // A dial move makes any saved hand-edit stale (it was a draft of the
                  // *old* generated prompt) — clear it so re-entering text mode seeds
                  // fresh from the current dials instead of resurrecting old text.
                  manualPrompt: "",
                  updatedAt: Date.now(),
                }
              : t,
          ),
        });
      },
      resetTraits: (id) => {
        set({
          tracks: get().tracks.map((t) =>
            t.id === id
              ? { ...t, traits: defaultTraitValues(), manualPrompt: "", updatedAt: Date.now() }
              : t,
          ),
        });
      },
      toggleManualOverride: (id, seedPrompt) => {
        set({
          tracks: get().tracks.map((t) => {
            if (t.id !== id) return t;
            const turningOn = !t.manualOverride;
            return {
              ...t,
              manualOverride: turningOn,
              // Seed with the current generated prompt so the stored text always
              // matches what's on screen, rather than staying "" until the next keystroke.
              manualPrompt: turningOn && !t.manualPrompt ? (seedPrompt ?? "") : t.manualPrompt,
            };
          }),
        });
      },
      setManualPrompt: (id, text) => {
        set({
          tracks: get().tracks.map((t) =>
            t.id === id ? { ...t, manualPrompt: text, updatedAt: Date.now() } : t,
          ),
        });
      },
      // An optimized prompt rides the existing manual-override rails: the
      // notepad becomes editable, the playground picks it up through
      // effectiveSystemPrompt, and a later dial move marks it stale exactly
      // like a hand-edit.
      applyOptimizedPrompt: (id, text) => {
        set({
          tracks: get().tracks.map((t) =>
            t.id === id
              ? { ...t, manualOverride: true, manualPrompt: text, updatedAt: Date.now() }
              : t,
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
      version: 1,
      // v0 -> v1: manual-edit drafts used to be preserved forever, even after
      // the dials that generated them had since changed, so a track's saved
      // manualPrompt could silently disagree with its current dial positions.
      // One-time cleanup so anyone's existing browser storage self-heals
      // instead of requiring them to nudge a dial to notice the fix.
      migrate: (persisted, version) => {
        const state = persisted as Partial<StudioState> & { tracks?: Track[] };
        if (version < 1 && state.tracks) {
          state.tracks = state.tracks.map((t) => ({ ...t, manualOverride: false, manualPrompt: "" }));
        }
        return state as StudioState;
      },
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
