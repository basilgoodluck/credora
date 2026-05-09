import type { PropsWithChildren } from 'react';

import { cx } from '../../lib/utils';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={cx('card', className)}>{children}</section>;
}
