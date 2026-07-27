export type DurationFilter = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Resolves a predefined or custom duration filter into a concrete
 * start/end Date range (inclusive of the full end day).
 */
export function resolveDateRange(
  duration?: DurationFilter,
  startDate?: string,
  endDate?: string,
): DateRange | null {
  const now = new Date();

  if (!duration) return null;

  if (duration === 'custom') {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);

  switch (duration) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week': {
      const day = start.getDay();
      const diffToMonday = (day + 6) % 7;
      start.setDate(start.getDate() - diffToMonday);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
}
