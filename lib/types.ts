export type Role = "owner" | "editor" | "viewer";
export type Priority = "must" | "want" | "maybe";
export type PlaceStatus = "active" | "archived" | "deleted";
export type PurchaseType = "group" | "personal";
export type ShoppingStatus = "pending" | "purchased" | "out_of_stock" | "cancelled";
export type BucketListStatus = "pending" | "booked" | "done" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          email: string;
          profile_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          nickname: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      trips: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          destination_city: string | null;
          start_date: string | null;
          end_date: string | null;
          invite_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["trips"]["Row"]> & {
          owner_id: string;
          title: string;
          invite_code: string;
        };
        Update: Partial<Database["public"]["Tables"]["trips"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "trips_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_members: {
        Row: {
          trip_id: string;
          user_id: string;
          role: Role;
          joined_at: string;
        };
        Insert: Database["public"]["Tables"]["trip_members"]["Row"];
        Update: Partial<Database["public"]["Tables"]["trip_members"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      places: {
        Row: {
          id: string;
          trip_id: string;
          created_by: string;
          amap_poi_id: string | null;
          name_zh: string;
          name_ko: string | null;
          address_zh: string | null;
          latitude: number | null;
          longitude: number | null;
          coordinate_system: string;
          category: string | null;
          priority: Priority;
          stay_minutes: number | null;
          opening_hours: string | null;
          memo: string | null;
          status: PlaceStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["places"]["Row"]> & {
          trip_id: string;
          created_by: string;
          name_zh: string;
        };
        Update: Partial<Database["public"]["Tables"]["places"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "places_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "places_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      place_votes: {
        Row: {
          place_id: string;
          user_id: string;
          vote_type: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["place_votes"]["Row"]> & {
          place_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["place_votes"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "place_votes_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "place_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      itineraries: {
        Row: {
          id: string;
          trip_id: string;
          itinerary_date: string;
          transport_type: string | null;
          start_place: string | null;
          end_place: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["itineraries"]["Row"]> & {
          trip_id: string;
          itinerary_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["itineraries"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "itineraries_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      itinerary_places: {
        Row: {
          id: string;
          itinerary_id: string;
          place_id: string;
          visit_order: number;
          planned_arrival: string | null;
          planned_departure: string | null;
          is_time_fixed: boolean;
          is_meal: boolean;
          reservation_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["itinerary_places"]["Row"]> & {
          itinerary_id: string;
          place_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["itinerary_places"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "itinerary_places_itinerary_id_fkey";
            columns: ["itinerary_id"];
            isOneToOne: false;
            referencedRelation: "itineraries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "itinerary_places_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_lists: {
        Row: {
          id: string;
          trip_id: string;
          title: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["shopping_lists"]["Row"]> & {
          trip_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["shopping_lists"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "shopping_lists_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_items: {
        Row: {
          id: string;
          shopping_list_id: string;
          created_by: string;
          assigned_to: string | null;
          place_id: string | null;
          product_name: string;
          product_name_zh: string | null;
          quantity: number;
          expected_price_cny: number | null;
          actual_price_cny: number | null;
          image_url: string | null;
          reference_url: string | null;
          purchase_type: PurchaseType;
          status: ShoppingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["shopping_items"]["Row"]> & {
          shopping_list_id: string;
          created_by: string;
          product_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["shopping_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "shopping_items_shopping_list_id_fkey";
            columns: ["shopping_list_id"];
            isOneToOne: false;
            referencedRelation: "shopping_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_items_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_items_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_items_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
        ];
      };
      bucket_lists: {
        Row: {
          id: string;
          trip_id: string;
          title: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bucket_lists"]["Row"]> & {
          trip_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["bucket_lists"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "bucket_lists_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      bucket_list_items: {
        Row: {
          id: string;
          bucket_list_id: string;
          created_by: string;
          assigned_to: string | null;
          place_id: string | null;
          title: string;
          contact_method: string | null;
          contact_info: string | null;
          expected_price_cny: number | null;
          actual_price_cny: number | null;
          scheduled_at: string | null;
          memo: string | null;
          image_url: string | null;
          status: BucketListStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bucket_list_items"]["Row"]> & {
          bucket_list_id: string;
          created_by: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["bucket_list_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "bucket_list_items_bucket_list_id_fkey";
            columns: ["bucket_list_id"];
            isOneToOne: false;
            referencedRelation: "bucket_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bucket_list_items_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bucket_list_items_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bucket_list_items_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
        ];
      };
      info_notes: {
        Row: {
          id: string;
          trip_id: string;
          created_by: string;
          title: string;
          url: string | null;
          content: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["info_notes"]["Row"]> & {
          trip_id: string;
          created_by: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["info_notes"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "info_notes_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "info_notes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_logs: {
        Row: {
          id: string;
          trip_id: string | null;
          user_id: string | null;
          action_type: string;
          entity_type: string;
          entity_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["activity_logs"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["activity_logs"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "activity_logs_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_trip_preview: {
        Args: { p_invite_code: string };
        Returns: {
          id: string;
          title: string;
          destination_city: string | null;
          start_date: string | null;
          end_date: string | null;
        }[];
      };
      join_trip: {
        Args: { p_invite_code: string };
        Returns: string;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type TripMember = Database["public"]["Tables"]["trip_members"]["Row"];
export type Place = Database["public"]["Tables"]["places"]["Row"];
export type PlaceVote = Database["public"]["Tables"]["place_votes"]["Row"];
export type Itinerary = Database["public"]["Tables"]["itineraries"]["Row"];
export type ItineraryPlace = Database["public"]["Tables"]["itinerary_places"]["Row"];
export type ShoppingList = Database["public"]["Tables"]["shopping_lists"]["Row"];
export type ShoppingItem = Database["public"]["Tables"]["shopping_items"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type BucketList = Database["public"]["Tables"]["bucket_lists"]["Row"];
export type BucketListItem = Database["public"]["Tables"]["bucket_list_items"]["Row"];
export type InfoNote = Database["public"]["Tables"]["info_notes"]["Row"];
