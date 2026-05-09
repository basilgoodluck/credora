import type { PropsWithChildren } from 'react';

import { cx } from '../../lib/utils';

export function Badge({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'good' | 'warn' | 'bad' }>) {
  return <span className={cx('badge', `badge-${tone}`)}>{children}</span>;
}
