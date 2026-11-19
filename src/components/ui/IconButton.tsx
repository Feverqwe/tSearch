import type {ComponentProps} from 'react';

import Button from './Button';

interface IconButtonProps extends Omit<
  ComponentProps<typeof Button>,
  'aria-label' | 'children' | 'title' | 'icon'
> {
  label: string;
  icon: string;
}

export default function IconButton({label, icon, className, ...props}: IconButtonProps) {
  return (
    <Button
      {...props}
      icon={icon}
      aria-label={label}
      title={label}
      className={['ts-icon-button', className].filter(Boolean).join(' ')}
    />
  );
}
