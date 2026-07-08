import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
  Activity,
} from "@/types/database";

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
      };
      activities: {
        Row: Activity;
        Insert: Omit<Activity, "id" | "created_at">;
        Update: Partial<Activity>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
