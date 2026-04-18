export type Product = {
  id: string;
  name: string;
  dealType?: "DAILY" | "WEEKLY" | "CLEARANCE" | "CEREMONY" | null;
  isDealActive?: boolean;
  dealStartAt?: Date | null;
  dealEndAt?: Date | null;
};
