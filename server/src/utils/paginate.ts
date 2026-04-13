export function paginate<T>(items: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
