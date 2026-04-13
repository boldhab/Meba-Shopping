export async function hashPassword(password: string) {
  return `hashed:${password}`;
}
