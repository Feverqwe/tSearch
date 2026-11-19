import {type ReactNode, type RefCallback, useRef} from 'react';

import {arrow, autoUpdate, flip, offset, shift, size, useFloating} from '@floating-ui/react-dom';

interface AnchoredPanelProps {
  open: boolean;
  matchWidth?: boolean;
  maxHeight?: number;
  tabIndex?: number;
  showArrow?: boolean;
  className?: string;
  children: ReactNode;
  anchor: (ref: RefCallback<HTMLElement>) => ReactNode;
}

export default function AnchoredPanel({
  open,
  matchWidth = false,
  maxHeight = Infinity,
  tabIndex,
  showArrow = false,
  className,
  children,
  anchor,
}: AnchoredPanelProps) {
  const arrowRef = useRef<HTMLSpanElement>(null);
  const {refs, floatingStyles, isPositioned, middlewareData, placement} = useFloating({
    open,
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(showArrow ? 8 : 2),
      flip({padding: 4}),
      shift({padding: 4}),
      size({
        padding: 4,
        apply({availableWidth, availableHeight, rects, elements}) {
          Object.assign(elements.floating.style, {
            maxWidth: `${Math.max(0, availableWidth)}px`,
            maxHeight: `${Math.max(0, Math.min(maxHeight, availableHeight))}px`,
            width: matchWidth ? `${rects.reference.width}px` : '',
          });
        },
      }),
      showArrow && arrow({element: arrowRef, padding: 6}),
    ],
  });

  return (
    <>
      {anchor(refs.setReference)}
      {open && (
        <div
          className={[className, showArrow && 'ts-floating--arrow'].filter(Boolean).join(' ')}
          ref={refs.setFloating}
          tabIndex={tabIndex}
          style={{...floatingStyles, visibility: isPositioned ? undefined : 'hidden'}}
        >
          {showArrow && (
            <span
              ref={arrowRef}
              className="ts-floating-arrow"
              data-side={placement.split('-')[0]}
              style={{left: middlewareData.arrow?.x}}
              aria-hidden="true"
            />
          )}
          {children}
        </div>
      )}
    </>
  );
}
