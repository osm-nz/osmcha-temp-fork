/** native HTML datetime pickers uses local time */
export function formatDateForPicker(date: Date) {
  const yyyy = date.getFullYear();
  const MM = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

export type RelativeUnit = 'days' | 'hours' | 'minutes' | 'seconds';

export function relativeDateToDate(relative: string): Date {
  const number = +relative.split(',')[0]!;
  const unit = relative.split(',')[1] as RelativeUnit;

  const offset: Record<RelativeUnit, number> = {
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
  };

  return new Date(Date.now() - offset[unit] * number);
}
