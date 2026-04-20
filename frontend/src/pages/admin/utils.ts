export function toLocalDatetimeValue(val: string | undefined): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val.slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    || `event-${Date.now().toString(36)}`;
}
