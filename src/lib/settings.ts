/** Player settings: sound, theme and performance. Stored on this device only. */

export type ThemePref = 'auto' | 'dark' | 'light';

export interface Settings {
  /** Sound effects loudness, 0–100. */
  volume: number;
  muted: boolean;
  theme: ThemePref;
  /** Draws the world less often and leaves out the supporting scenery. */
  lowCpu: boolean;
  /** No animated transitions, camera moves or shaking. */
  reduceMotion: boolean;
}

export const DEFAULT_SETTINGS: Settings = { volume: 70, muted: false, theme: 'dark', lowCpu: false, reduceMotion: false };

const KEY = 'obscura:v1:settings';

export function loadSettings(): Settings {
  const base: Settings = { ...DEFAULT_SETTINGS };
  try {
    if (typeof window === 'undefined') return base;
    // first visit: follow the system's motion preference
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) base.reduceMotion = true;
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<Settings>;
    return {
      volume: typeof p.volume === 'number' ? Math.min(100, Math.max(0, Math.round(p.volume))) : base.volume,
      muted: typeof p.muted === 'boolean' ? p.muted : base.muted,
      theme: p.theme === 'auto' || p.theme === 'light' || p.theme === 'dark' ? p.theme : base.theme,
      lowCpu: typeof p.lowCpu === 'boolean' ? p.lowCpu : base.lowCpu,
      reduceMotion: typeof p.reduceMotion === 'boolean' ? p.reduceMotion : base.reduceMotion,
    };
  } catch {
    return base;
  }
}

export function saveSettings(s: Settings) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: settings last for this visit */
  }
}

/** The theme actually shown, resolving 'auto' with the system preference. */
export function resolveTheme(pref: ThemePref): 'dark' | 'light' {
  if (pref !== 'auto') return pref;
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}
