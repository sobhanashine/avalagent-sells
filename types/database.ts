export type ServiceType = "ai" | "website" | "ai+website";
export type StatusType = "not_contacted" | "pending" | "accepted" | "rejected";
export type ActivityType =
  | "created"
  | "status_changed"
  | "note_added"
  | "updated"
  | "deleted";

export interface Customer {
  id: string;
  user_id: string;
  instagram_username: string;
  phone: string | null;
  service: ServiceType;
  status: StatusType;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerInsert {
  user_id?: string;
  instagram_username: string;
  phone?: string | null;
  service: ServiceType;
  status?: StatusType;
  note?: string | null;
}

export interface CustomerUpdate {
  instagram_username?: string;
  phone?: string | null;
  service?: ServiceType;
  status?: StatusType;
  note?: string | null;
}

export interface Activity {
  id: string;
  customer_id: string;
  type: ActivityType;
  from_status: StatusType | null;
  to_status: StatusType | null;
  message: string | null;
  created_at: string;
}

export const SERVICES: ServiceType[] = ["ai", "website", "ai+website"];
export const STATUSES: StatusType[] = [
  "not_contacted",
  "pending",
  "accepted",
  "rejected",
];
