export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          consent_to_processing: boolean
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          duration_minutes: number
          id: string
          note: string | null
          service_type: string
          starts_at: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          consent_to_processing: boolean
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          duration_minutes?: number
          id?: string
          note?: string | null
          service_type: string
          starts_at: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          consent_to_processing?: boolean
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          duration_minutes?: number
          id?: string
          note?: string | null
          service_type?: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          city: string
          company: string | null
          country_code: string
          created_at: string
          first_name: string
          id: string
          is_default_billing: boolean
          is_default_shipping: boolean
          label: string | null
          last_name: string
          phone: string | null
          postal_code: string
          street: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          company?: string | null
          country_code?: string
          created_at?: string
          first_name: string
          id?: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          label?: string | null
          last_name: string
          phone?: string | null
          postal_code: string
          street: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          company?: string | null
          country_code?: string
          created_at?: string
          first_name?: string
          id?: string
          is_default_billing?: boolean
          is_default_shipping?: boolean
          label?: string | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          street?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          created_at: string
          first_name: string | null
          last_name: string | null
          marketing_consent: boolean
          marketing_consent_at: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          sku: string
          unit_price: number
          variant_id: string | null
          variant_name: string | null
          vat_rate: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          sku: string
          unit_price: number
          variant_id?: string | null
          variant_name?: string | null
          vat_rate: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sku?: string
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json
          comgate_last_status_response: Json | null
          comgate_redirect_url: string | null
          comgate_trans_id: string | null
          created_at: string
          currency: string
          customer_note: string | null
          discount_total: number
          email: string
          grand_total: number
          id: string
          order_number: string
          payment_access_token_hash: string | null
          payment_method: string
          payment_paid_at: string | null
          payment_status: string
          payment_status_updated_at: string | null
          placed_at: string | null
          shipping_address: Json
          shipping_total: number
          status: string
          subtotal: number
          tax_total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address: Json
          comgate_last_status_response?: Json | null
          comgate_redirect_url?: string | null
          comgate_trans_id?: string | null
          created_at?: string
          currency?: string
          customer_note?: string | null
          discount_total?: number
          email: string
          grand_total: number
          id?: string
          order_number: string
          payment_access_token_hash?: string | null
          payment_method?: string
          payment_paid_at?: string | null
          payment_status?: string
          payment_status_updated_at?: string | null
          placed_at?: string | null
          shipping_address: Json
          shipping_total?: number
          status?: string
          subtotal: number
          tax_total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json
          comgate_last_status_response?: Json | null
          comgate_redirect_url?: string | null
          comgate_trans_id?: string | null
          created_at?: string
          currency?: string
          customer_note?: string | null
          discount_total?: number
          email?: string
          grand_total?: number
          id?: string
          order_number?: string
          payment_access_token_hash?: string | null
          payment_method?: string
          payment_paid_at?: string | null
          payment_status?: string
          payment_status_updated_at?: string | null
          placed_at?: string | null
          shipping_address?: Json
          shipping_total?: number
          status?: string
          subtotal?: number
          tax_total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          category_id: string
          is_primary: boolean
          product_id: string
        }
        Insert: {
          category_id: string
          is_primary?: boolean
          product_id: string
        }
        Update: {
          category_id?: string
          is_primary?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          product_id: string
          sort_order: number
          storage_path: string
          variant_id: string | null
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          storage_path: string
          variant_id?: string | null
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          storage_path?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          color: string | null
          compare_at_price: number | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          price: number
          product_id: string
          size: string | null
          sku: string
          stock_quantity: number
          updated_at: string
          vat_rate: number
        }
        Insert: {
          barcode?: string | null
          color?: string | null
          compare_at_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price: number
          product_id: string
          size?: string | null
          sku: string
          stock_quantity?: number
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          barcode?: string | null
          color?: string | null
          compare_at_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          product_id?: string
          size?: string | null
          sku?: string
          stock_quantity?: number
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          product_type: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          product_type?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          product_type?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
