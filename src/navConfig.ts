import type { PageId } from './lib/types';

export const DASHBOARD_NAV: { id: PageId; path: string; label: string }[] = [
  { id: 'executive', path: '/executive', label: 'Executive overview' },
  { id: 'ministry', path: '/ministry', label: 'Ministry drill-down' },
  { id: 'recruitment', path: '/recruitment', label: 'Recruitment tracker' },
];
