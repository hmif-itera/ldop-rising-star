export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'audience' | 'gate_staff' | 'admin';

export interface Database {
  public: {
    Tables: {
      shared_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shared_audit_logs: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          actor_id?: never;
          action?: never;
          entity_type?: never;
          entity_id?: never;
          old_data?: never;
          new_data?: never;
          created_at?: never;
        };
        Relationships: [
          {
            foreignKeyName: "shared_audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "shared_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      catalog_venues: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          map_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          map_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          map_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      catalog_events: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          terms: string | null;
          venue_id: string | null;
          starts_at: string;
          ends_at: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          terms?: string | null;
          venue_id?: string | null;
          starts_at: string;
          ends_at: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          terms?: string | null;
          venue_id?: string | null;
          starts_at?: string;
          ends_at?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ticket_types: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          price_idr: number;
          quota_total: number;
          quota_claimed: number;
          max_per_user: number;
          sale_starts_at: string;
          sale_ends_at: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          price_idr?: number;
          quota_total: number;
          quota_claimed?: number;
          max_per_user?: number;
          sale_starts_at: string;
          sale_ends_at: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          price_idr?: number;
          quota_total?: number;
          quota_claimed?: number;
          max_per_user?: number;
          sale_starts_at?: string;
          sale_ends_at?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ticket_tickets: {
        Row: {
          id: string;
          ticket_type_id: string;
          owner_id: string;
          qr_token: string;
          status: 'ACTIVE' | 'USED' | 'CANCELLED';
          claimed_at: string;
          used_at: string | null;
          cancelled_at: string | null;
          cancel_reason: string | null;
          idempotency_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_type_id: string;
          owner_id: string;
          qr_token?: string;
          status?: 'ACTIVE' | 'USED' | 'CANCELLED';
          claimed_at?: string;
          used_at?: string | null;
          cancelled_at?: string | null;
          cancel_reason?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_type_id?: string;
          owner_id?: string;
          qr_token?: string;
          status?: 'ACTIVE' | 'USED' | 'CANCELLED';
          claimed_at?: string;
          used_at?: string | null;
          cancelled_at?: string | null;
          cancel_reason?: string | null;
          idempotency_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      attendance_gates: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      attendance_checkin_logs: {
        Row: {
          id: number;
          ticket_id: string;
          ticket_type_id: string;
          gate_id: string;
          staff_id: string;
          result: 'SUCCESS' | 'ALREADY_USED' | 'CANCELLED' | 'INVALID_TOKEN' | 'UNAUTHORIZED';
          failure_reason: string | null;
          scanned_at: string;
        };
        Insert: {
          id?: never;
          ticket_id: string;
          ticket_type_id: string;
          gate_id: string;
          staff_id: string;
          result: 'SUCCESS' | 'ALREADY_USED' | 'CANCELLED' | 'INVALID_TOKEN' | 'UNAUTHORIZED';
          failure_reason?: string | null;
          scanned_at?: string;
        };
        Update: {
          id?: never;
          ticket_id?: never;
          ticket_type_id?: never;
          gate_id?: never;
          staff_id?: never;
          result?: never;
          failure_reason?: never;
          scanned_at?: never;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      shared_admin_set_user_role: {
        Args: {
          p_user_id: string;
          p_role: UserRole;
        };
        Returns: Json;
      };
      shared_current_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      shared_is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      shared_is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      shared_is_active_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      shared_write_audit: {
        Args: {
          p_action: string;
          p_entity_type: string;
          p_entity_id: string;
          p_old?: Json;
          p_new?: Json;
        };
        Returns: void;
      };
      claim_ticket: {
        Args: {
          p_ticket_type_id: string;
          p_quantity?: number;
          p_idempotency_key?: string | null;
        };
        Returns: Json;
      };
      verify_and_checkin_ticket: {
        Args: {
          p_qr_token: string;
          p_gate_id: string;
        };
        Returns: Json;
      };
      ticket_admin_cancel_ticket: {
        Args: {
          p_ticket_id: string;
          p_reason?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      shared_user_role: UserRole;
      ticket_status: 'ACTIVE' | 'USED' | 'CANCELLED';
    };
  };
}

export type Profile = Database['public']['Tables']['shared_profiles']['Row'];
export type AuditLog = Database['public']['Tables']['shared_audit_logs']['Row'];
