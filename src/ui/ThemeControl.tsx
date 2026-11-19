import {useEffect, useLayoutEffect, useState} from 'react';

import {useLocation, useNavigate} from 'react-router-dom';

import {currentTheme, initTheme, parseTheme, saveTheme, setDocumentTheme} from './theme';

export function RouteTheme() {
  const {search} = useLocation();
  useLayoutEffect(() => {
    setDocumentTheme(currentTheme());
  }, [search]);
  return null;
}

export default function ThemeControl() {
  const [mode, setMode] = useState(currentTheme);
  const {pathname, search, hash, key, state} = useLocation();
  const navigate = useNavigate();
  useEffect(() => initTheme(setMode), [search]);

  return (
    <label className="theme-control">
      {chrome.i18n.getMessage('theme')}
      <select
        className="ts-control"
        value={mode}
        onChange={(event) => {
          const next = parseTheme(event.currentTarget.value);
          if (!next) return;
          const params = new URLSearchParams(search);
          params.set('theme', next);
          saveTheme(next);
          setMode(next);
          setDocumentTheme(next);
          void navigate(
            {pathname, search: `?${params}`, hash},
            {replace: true, state: {...state, searchSessionKey: state?.searchSessionKey ?? key}},
          );
        }}
      >
        {(['system', 'light', 'dark'] as const).map((theme) => (
          <option key={theme} value={theme}>
            {chrome.i18n.getMessage(`theme_${theme}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
