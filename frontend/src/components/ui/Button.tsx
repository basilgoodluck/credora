import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { cx } from '../../lib/utils';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }>;

export function Button({ children, className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button className={cx('button', `button-${variant}`, className)} {...props}>
      {children}
    </button>
  );
}
