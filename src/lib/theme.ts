export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'fengbro:ui-theme';

const isBrowser = typeof window !== 'undefined';

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'system') return mode;
  if (!isBrowser) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function readTheme(): ThemeMode {
  if (!isBrowser) return 'system';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

export function applyTheme(mode: ThemeMode) {
  if (!isBrowser) return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolveTheme(mode));
  root.dataset.themeMode = mode;
  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
}

export function nextTheme(mode: ThemeMode): ThemeMode {
  if (mode === 'light') return 'dark';
  if (mode === 'dark') return 'system';
  return 'light';
}

export function themeGlyph(mode: ThemeMode) {
  if (mode === 'light') return '☀';
  if (mode === 'dark') return '☾';
  return '◐';
}

export function themeLabel(mode: ThemeMode) {
  if (mode === 'light') return '亮色模式';
  if (mode === 'dark') return '深色模式';
  return '跟隨系統';
}
