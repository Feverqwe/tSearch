import {useState} from 'react';

import highlight from '../tools/highlight';
import type {Bracket, TitlePresentation, TitleTone} from '../tools/titlePresentation';
import ResultTitle from './ResultTitle';
import Field from './ui/Field';

const brackets: readonly [Bracket, string, string][] = [
  ['(', 'titles_round', '(2010)'],
  ['[', 'titles_square', '[1080p · Blu-ray]'],
  ['{', 'titles_curly', '{Blender Foundation}'],
  ['<', 'titles_angle', '<Remux>'],
];
const tones: readonly TitleTone[] = ['muted', 'normal', 'accent'];
const query = 'Sintel';
const example = [query, ...brackets.map(([, , sample]) => sample)].join(' ');
const matches = highlight.getMatches(example, highlight.getMap(query));
const message = (key: string) => chrome.i18n.getMessage(key);

export default function TitleOptions({
  value,
  update,
}: {
  value: TitlePresentation;
  update: (change: (previous: TitlePresentation) => TitlePresentation) => Promise<unknown>;
}) {
  const [draft, setDraft] = useState<TitlePresentation>();
  const [error, setError] = useState(false);

  async function save(change: (previous: TitlePresentation) => TitlePresentation) {
    setDraft(change(value));
    setError(false);
    try {
      await update(change);
    } catch {
      setError(true);
    } finally {
      setDraft(undefined);
    }
  }

  const presentation = draft ?? value;
  return (
    <>
      <section className="settings-group" aria-label={message('settings_titles')}>
        <h2>{message('settings_titles')}</h2>
        <label className="option">
          <input
            type="checkbox"
            checked={presentation.highlight}
            disabled={Boolean(draft)}
            onChange={(event) => {
              const highlight = event.currentTarget.checked;
              void save((previous) => ({...previous, highlight}));
            }}
          />
          {message('titles_highlight')}
        </label>
        <div className="title-options">
          {brackets.map(([key, label, sample]) => (
            <Field
              key={key}
              label={
                <>
                  {message(label)}{' '}
                  <small className="title-option-example" aria-hidden="true">
                    {sample}
                  </small>
                </>
              }
            >
              {(props) => (
                <select
                  {...props}
                  value={presentation.brackets[key]}
                  className="ts-control"
                  disabled={Boolean(draft)}
                  onChange={(event) => {
                    const tone = event.currentTarget.value as TitleTone;
                    void save((previous) => ({
                      ...previous,
                      brackets: {...previous.brackets, [key]: tone},
                    }));
                  }}
                >
                  {tones.map((tone) => (
                    <option key={tone} value={tone}>
                      {message(`titles_${tone}`)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          ))}
        </div>
        {error && <p role="alert">{message('settings_save_error')}</p>}
      </section>
      <section className="settings-group">
        <h2>{message('settings_preview')}</h2>
        <p className="title-preview-query">
          {chrome.i18n.getMessage('titles_preview_query', [query])}
        </p>
        <p className="title-preview">
          <ResultTitle title={example} matches={matches} presentation={presentation} />
        </p>
      </section>
    </>
  );
}
