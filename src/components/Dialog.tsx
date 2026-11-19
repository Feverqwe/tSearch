import {type ComponentPropsWithoutRef, type RefObject, useLayoutEffect, useRef} from 'react';

import {createPortal} from 'react-dom';

import '../assets/css/dialog.less';

interface DialogProps extends Omit<ComponentPropsWithoutRef<'dialog'>, 'onClose' | 'open'> {
  onClose: () => void;
  returnFocus?: RefObject<HTMLElement | null>;
}

export default function Dialog({
  onClose,
  returnFocus,
  className,
  children,
  onPointerDown,
  onClick,
  onKeyDown,
  ...props
}: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const startedOutside = useRef(false);

  useLayoutEffect(() => {
    const element = dialog.current!;
    const opener = returnFocus?.current ?? document.activeElement;
    element.showModal();
    return () => {
      element.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [returnFocus]);

  return createPortal(
    <dialog
      {...props}
      ref={dialog}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        startedOutside.current = !event.defaultPrevented && outside(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        const close = startedOutside.current && outside(event) && !event.defaultPrevented;
        startedOutside.current = false;
        if (close) onClose();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === 'Escape') event.stopPropagation();
      }}
      onCancel={(event) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        onClose();
      }}
      className={className ? `dialog__body ${className}` : 'dialog__body'}
    >
      {children}
    </dialog>,
    document.body,
  );
}

function outside(event: React.MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;
  const {left, right, top, bottom} = event.currentTarget.getBoundingClientRect();
  return (
    event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom
  );
}
