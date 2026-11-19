import {useEffect, useId, useRef, useState} from 'react';

import AnchoredPanel from './ui/AnchoredPanel';
import Button from './ui/Button';

interface TrackerStatusPanelProps {
  label: string;
  login?: {url?: string};
  errorMessage?: string;
  onRetry?: () => void;
}

export default function TrackerStatusPanel({
  label,
  login,
  errorMessage,
  onRetry,
}: TrackerStatusPanelProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (container.current?.contains(document.activeElement)) {
        trigger.current?.focus();
        event.stopPropagation();
      }
      setOpen(false);
    }
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [open]);

  return (
    <div
      ref={container}
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') return;
        window.clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      onPointerLeave={() => {
        closeTimer.current = window.setTimeout(() => {
          if (!container.current?.contains(document.activeElement)) setOpen(false);
        }, 150);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <AnchoredPanel
        className="ts-floating tracker-status-panel"
        open={open}
        anchor={(ref) => (
          <button
            ref={(element) => {
              trigger.current = element;
              ref(element);
            }}
            className={`tracker__status-button ${login ? 'tracker__login' : 'tracker__icon tracker__icon-error'}`}
            type="button"
            aria-label={label}
            aria-expanded={open}
            aria-controls={open ? id : undefined}
            onClick={() => setOpen(true)}
          />
        )}
      >
        <div className="tracker-status-panel__content" id={id}>
          {login?.url ? (
            <a href={login.url} target="_blank" rel="noopener">
              {label}
            </a>
          ) : (
            <span>{errorMessage || label}</span>
          )}
          {onRetry && <Button onClick={onRetry}>{chrome.i18n.getMessage('tracker_retry')}</Button>}
        </div>
      </AnchoredPanel>
    </div>
  );
}
