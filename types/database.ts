// -----------------------------------------------------------------------------
// Hand-authored to mirror the output of `supabase gen types typescript`,
// matching the Step 2 + Step 3 migrations. There is no live Supabase project
// yet, so this stands in until you run the real generator and overwrite it:
//
//   npx supabase gen types typescript \
//     --project-id <your-project-ref> --schema public > types/database.ts
//
// Keep the shape — lib/supabase.ts and lib/queries.ts are typed against it.
// -----------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Shared wide row returned by both nearby_deals() and deal_details().
type DealWithStoreRow = {
  id: string;
  store_id: string;
  title: string;
  description: string | null;
  category: Database['public']['Enums']['deal_category'];
  discount_type: Database['public']['Enums']['discount_kind'];
  discount_value: number | null;
  starts_at: string;
  expires_at: string;
  terms: string | null;
  image_url: string | null;
  status: Database['public']['Enums']['deal_status'];
  created_at: string;
  store_name: string;
  store_address: string;
  store_phone: string | null;
  store_logo_url: string | null;
  store_hours: Json | null;
  store_lat: number;
  store_lng: number;
  // Always a number from nearby_deals(); null from deal_details().
  distance_meters: number | null;
};

export type Database = {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          verified?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      stores: {
        Row: {
          id: string;
          merchant_id: string;
          name: string;
          address: string;
          // PostGIS geography — opaque to PostgREST. Reach lat/lng via the
          // nearby_deals() / deal_details() functions instead of selecting this.
          location: unknown;
          phone: string | null;
          hours: Json | null;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          name: string;
          address: string;
          location: unknown;
          phone?: string | null;
          hours?: Json | null;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          name?: string;
          address?: string;
          location?: unknown;
          phone?: string | null;
          hours?: Json | null;
          logo_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          store_id: string;
          title: string;
          description: string | null;
          category: Database['public']['Enums']['deal_category'];
          discount_type: Database['public']['Enums']['discount_kind'];
          discount_value: number | null;
          starts_at: string;
          expires_at: string;
          terms: string | null;
          image_url: string | null;
          status: Database['public']['Enums']['deal_status'];
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          title: string;
          description?: string | null;
          category?: Database['public']['Enums']['deal_category'];
          discount_type?: Database['public']['Enums']['discount_kind'];
          discount_value?: number | null;
          starts_at?: string;
          expires_at: string;
          terms?: string | null;
          image_url?: string | null;
          status?: Database['public']['Enums']['deal_status'];
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          title?: string;
          description?: string | null;
          category?: Database['public']['Enums']['deal_category'];
          discount_type?: Database['public']['Enums']['discount_kind'];
          discount_value?: number | null;
          starts_at?: string;
          expires_at?: string;
          terms?: string | null;
          image_url?: string | null;
          status?: Database['public']['Enums']['deal_status'];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'deals_store_id_fkey';
            columns: ['store_id'];
            referencedRelation: 'stores';
            referencedColumns: ['id'];
          },
        ];
      };
      deal_saves: {
        Row: {
          user_id: string;
          deal_id: string;
          saved_at: string;
        };
        Insert: {
          user_id: string;
          deal_id: string;
          saved_at?: string;
        };
        Update: {
          user_id?: string;
          deal_id?: string;
          saved_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'deal_saves_deal_id_fkey';
            columns: ['deal_id'];
            referencedRelation: 'deals';
            referencedColumns: ['id'];
          },
        ];
      };
      analytics_events: {
        Row: {
          id: string;
          event: string;
          props: Json | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event: string;
          props?: Json | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event?: string;
          props?: Json | null;
          user_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      nearby_deals: {
        Args: {
          user_lat: number;
          user_lng: number;
          radius_meters: number;
          categories?: string[] | null;
        };
        Returns: DealWithStoreRow[];
      };
      deal_details: {
        Args: {
          deal_id: string;
        };
        Returns: DealWithStoreRow[];
      };
      search_deals: {
        Args: {
          term: string;
        };
        Returns: DealWithStoreRow[];
      };
      setup_merchant_store: {
        Args: {
          p_merchant_name: string;
          p_email: string;
          p_store_name: string;
          p_address: string;
          p_lat: number;
          p_lng: number;
          p_phone?: string | null;
          p_hours?: Json | null;
          p_logo_url?: string | null;
        };
        // Returns the store id (uuid).
        Returns: string;
      };
    };
    Enums: {
      deal_category:
        | 'food'
        | 'clothing'
        | 'beauty'
        | 'entertainment'
        | 'electronics'
        | 'other';
      discount_kind: 'percent' | 'bogo' | 'fixed' | 'freebie' | 'other';
      deal_status: 'active' | 'expired' | 'removed';
    };
    CompositeTypes: Record<string, never>;
  };
};
