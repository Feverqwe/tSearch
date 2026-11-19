export type ThemeMode = 'light' | 'dark' | 'system';

export function parseTheme(value: string | null | undefined): ThemeMode | undefined {
  return value === 'light' || value === 'dark' || value === 'system' ? value : undefined;
}

export function themeInSearch(search: string) {
  return parseTheme(new URLSearchParams(search).get('theme'));
}

export function resolveTheme(search: string, saved?: string | null): ThemeMode {
  return themeInSearch(search) ?? parseTheme(saved) ?? 'system';
}

export function themedSearch(search: string, mode?: ThemeMode) {
  if (!mode) return search;
  const params = new URLSearchParams(search);
  if (!themeInSearch(search)) params.set('theme', mode);
  return `?${params}`;
}

const storageKey = 'tsearch.theme';
const colorPreference = '(prefers-color-scheme: dark)';

export function currentTheme() {
  const search = location.hash.slice(1).split('?')[1] ?? '';
  return resolveTheme(search, localStorage.getItem(storageKey));
}

export function saveTheme(mode: ThemeMode) {
  localStorage.setItem(storageKey, mode);
}

export function setDocumentTheme(mode: ThemeMode) {
  const appearance =
    mode === 'system' ? (matchMedia(colorPreference).matches ? 'dark' : 'light') : mode;
  document.documentElement.dataset.theme = appearance;
  document.documentElement.style.colorScheme = appearance;
}

export function initTheme(onChange?: (mode: ThemeMode) => void) {
  const media = matchMedia(colorPreference);
  const apply = () => {
    const mode = currentTheme();
    setDocumentTheme(mode);
    onChange?.(mode);
  };
  apply();
  media.addEventListener('change', apply);
  window.addEventListener('hashchange', apply);
  window.addEventListener('popstate', apply);
  window.addEventListener('storage', apply);
  return () => {
    media.removeEventListener('change', apply);
    window.removeEventListener('hashchange', apply);
    window.removeEventListener('popstate', apply);
    window.removeEventListener('storage', apply);
  };
}
