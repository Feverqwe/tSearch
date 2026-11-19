import {type ReactNode, type RefCallback, useEffect, useId, useState} from 'react';

import AnchoredPanel from './AnchoredPanel';

interface TooltipProps {
  text: string;
  children: (props: {ref: RefCallback<HTMLElement>; 'aria-describedby'?: string}) => ReactNode;
}

export default function Tooltip({text, children}: TooltipProps) {
  const id = useId();
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const open = (hover || focus) && !dismissed;

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setDismissed(true);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <span
      className="ts-tooltip-anchor"
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') return;
        if (!focus) setDismissed(false);
        setHover(true);
      }}
      onPointerLeave={() => setHover(false)}
      onFocus={() => {
        setDismissed(false);
        setFocus(true);
      }}
      onBlur={() => setFocus(false)}
    >
      <AnchoredPanel
        className="ts-floating ts-tooltip"
        open={open}
        anchor={(ref) => children({ref, 'aria-describedby': open ? id : undefined})}
      >
        <span id={id} role="tooltip">
          {text}
        </span>
      </AnchoredPanel>
    </span>
  );
}
