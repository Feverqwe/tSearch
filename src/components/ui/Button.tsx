import type {ComponentPropsWithRef} from 'react';

import LoadingIndicator from './LoadingIndicator';

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'outline' | 'quiet';
  busy?: boolean;
  icon?: string;
  busyIndicator?: 'replace' | 'inline';
}

export default function Button({
  type = 'button',
  variant = 'outline',
  busy,
  icon,
  busyIndicator = 'replace',
  disabled,
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[
        'ts-button',
        `ts-button--${variant}`,
        `ts-button--${busyIndicator}`,
        icon && `ts-button--with-icon ts-glyph--${icon}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-busy={busy || undefined}
      aria-disabled={busy || props['aria-disabled']}
      disabled={disabled && !busy}
      onClick={(event) => {
        if (busy) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
    >
      {children != null && <span className="ts-button-label">{children}</span>}
      {busy && <LoadingIndicator />}
    </button>
  );
}
