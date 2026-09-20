export function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
export function idSet<T extends { id: string }>(
  items: readonly T[],
  label: string,
) {
  const ids = new Set(items.map((item) => item.id));
  ensure(ids.size === items.length, `Duplicate ${label} IDs`);
  return ids;
}
