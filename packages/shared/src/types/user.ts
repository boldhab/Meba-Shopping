export type UserRole = "CUSTOMER" | "ADMIN";

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  dob?: string | null;
  gender?: string | null;
  role: UserRole;
  createdAt: string | Date;
}

export interface AddressDTO {
  id: string;
  label: string;
  line1: string;
  city: string;
  isDefault: boolean;
  userId: string;
}

export interface UserPreferenceDTO {
  id: string;
  emailOrderUpdates: boolean;
  emailWishlistAlerts: boolean;
  emailPromotions: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  newsletter: boolean;
  currency: string;
  language: string;
  userId: string;
}
