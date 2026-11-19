import {json} from '@codemirror/lang-json';
import {keymap, placeholder} from '@codemirror/view';
import {basicSetup, EditorView} from 'codemirror';
import {useEffect, useRef} from 'react';

const theme = EditorView.theme({
  '&': {color: 'var(--ink)', backgroundColor: 'var(--field)'},
  '.cm-gutters': {
    color: 'var(--muted)',
    backgroundColor: 'var(--subtle)',
    borderColor: 'var(--line)',
  },
  '.cm-activeLine, .cm-activeLineGutter': {backgroundColor: 'var(--hover)'},
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--accent-soft)',
  },
  '.cm-cursor': {borderLeftColor: 'var(--ink)'},
  '.cm-placeholder': {color: 'var(--muted)'},
});

interface TrackerEditorProps {
  initialValue: string;
  labelId: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

export default function TrackerEditor({
  initialValue,
  labelId,
  onChange,
  onSave,
}: TrackerEditorProps) {
  const container = useRef<HTMLDivElement>(null);
  const editorValue = useRef(initialValue);
  const handlers = useRef({onChange, onSave});

  useEffect(() => {
    handlers.current = {onChange, onSave};
  }, [onChange, onSave]);

  useEffect(() => {
    const view = new EditorView({
      doc: editorValue.current,
      parent: container.current!,
      extensions: [
        keymap.of([
          {
            key: 'Mod-s',
            run: () => {
              handlers.current.onSave();
              return true;
            },
          },
        ]),
        basicSetup,
        placeholder(chrome.i18n.getMessage('enterTrackerCode')),
        theme,
        json(),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({'aria-labelledby': labelId}),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            editorValue.current = update.state.doc.toString();
            handlers.current.onChange(editorValue.current);
          }
        }),
      ],
    });

    return () => view.destroy();
  }, [labelId]);

  return <div ref={container} />;
}
