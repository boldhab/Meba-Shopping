export const database = {
  provider: "postgresql",
  connectionString: process.env.DATABASE_URL ?? ""
};
