import {useId, useRef, useState} from 'react';

import Dialog from './Dialog';
import Button from './ui/Button';
import IconButton from './ui/IconButton';

const message = (key: string) => chrome.i18n.getMessage(key);

export default function BuilderHelp({
  label,
  help,
  example,
  literal,
  triggerLabel,
}: {
  label: string;
  help: string;
  example?: string;
  literal?: boolean;
  triggerLabel?: string;
}) {
  const [opened, setOpened] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const id = useId();
  const field = literal ? label : message(label);
  const usage = message(help + '_usage');
  const close = () => setOpened(false);

  return (
    <>
      <IconButton
        ref={opener}
        label={triggerLabel ?? chrome.i18n.getMessage('maker_help_label', [field])}
        className="maker-help-button"
        icon="info"
        variant="quiet"
        aria-haspopup="dialog"
        onClick={() => setOpened(true)}
      />
      {opened && (
        <Dialog
          className="maker-help-dialog"
          aria-labelledby={id}
          aria-describedby={id + '-description'}
          returnFocus={opener}
          onClose={close}
        >
          <h2 id={id}>{field}</h2>
          <div className="maker-help-content">
            <p id={id + '-description'}>{message(help)}</p>
            {usage && (
              <>
                <h3>{message('maker_help_usage')}</h3>
                <p>{usage}</p>
              </>
            )}
            {example && (
              <>
                <h3>{message('maker_help_example')}</h3>
                <code>{example}</code>
              </>
            )}
          </div>
          <div className="dialog__button_box">
            <Button onClick={close}>{message('close')}</Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
