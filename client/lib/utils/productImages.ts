export function getProductImageUrls(slug: string, name: string): string[] {
  void slug;
  void name;
  return [];
}

export function getProductPlaceholderImage() {
  return "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='900' viewBox='0 0 1200 900'%3E%3Crect width='1200' height='900' fill='%23f4efe9'/%3E%3Crect x='170' y='140' width='860' height='620' rx='44' fill='%23ffffff' stroke='%23e8d8cc' stroke-width='8'/%3E%3Cpath d='M430 560l120-150 100 120 70-80 150 190H360z' fill='%23f0d7c9'/%3E%3Ccircle cx='500' cy='360' r='58' fill='%23ffd2c2'/%3E%3Ctext x='600' y='690' text-anchor='middle' font-family='Arial, sans-serif' font-size='42' font-weight='700' fill='%23a36a4f'%3EProduct image available after upload%3C/text%3E%3C/svg%3E";
}
