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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          biweekly_rate: number | null
          company_id: string
          created_at: string | null
          email: string
          first_name: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          last_name: string
          rate_type: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string | null
          weekly_rate: number | null
        }
        Insert: {
          biweekly_rate?: number | null
          company_id: string
          created_at?: string | null
          email: string
          first_name: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          last_name: string
          rate_type?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
          weekly_rate?: number | null
        }
        Update: {
          biweekly_rate?: number | null
          company_id?: string
          created_at?: string | null
          email?: string
          first_name?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          rate_type?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string | null
          weekly_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          frequency: string
          id: string
          name: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          frequency: string
          id?: string
          name: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          frequency?: string
          id?: string
          name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forecasts: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          company_id: string
          created_at: string | null
          forecasted_cost: number
          forecasted_hours: number
          id: string
          notes: string | null
          period_end: string
          period_start: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          company_id: string
          created_at?: string | null
          forecasted_cost: number
          forecasted_hours: number
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          company_id?: string
          created_at?: string | null
          forecasted_cost?: number
          forecasted_hours?: number
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      income_streams: {
        Row: {
          amount: number
          created_at: string
          frequency: string
          id: string
          last_paid_date: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          frequency: string
          id?: string
          last_paid_date: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          frequency?: string
          id?: string
          last_paid_date?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plaid_accounts: {
        Row: {
          account_id: string
          available_balance: number | null
          created_at: string
          currency_code: string
          current_balance: number | null
          id: string
          mask: string | null
          name: string
          official_name: string | null
          plaid_item_id: string
          show_on_dashboard: boolean
          subtype: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          available_balance?: number | null
          created_at?: string
          currency_code?: string
          current_balance?: number | null
          id?: string
          mask?: string | null
          name: string
          official_name?: string | null
          plaid_item_id: string
          show_on_dashboard?: boolean
          subtype?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          available_balance?: number | null
          created_at?: string
          currency_code?: string
          current_balance?: number | null
          id?: string
          mask?: string | null
          name?: string
          official_name?: string | null
          plaid_item_id?: string
          show_on_dashboard?: boolean
          subtype?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plaid_accounts_plaid_item_id_fkey"
            columns: ["plaid_item_id"]
            isOneToOne: false
            referencedRelation: "plaid_items"
            referencedColumns: ["id"]
          },
        ]
      }
      plaid_items: {
        Row: {
          access_token: string
          created_at: string
          id: string
          institution_id: string | null
          institution_name: string | null
          item_id: string
          last_synced_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          item_id: string
          last_synced_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          item_id?: string
          last_synced_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plaid_transactions: {
        Row: {
          amount: number
          app_transaction_id: string | null
          category: string[] | null
          category_id: string | null
          created_at: string
          date: string
          id: string
          imported_to_app: boolean
          merchant_name: string | null
          name: string
          pending: boolean
          plaid_account_id: string
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          app_transaction_id?: string | null
          category?: string[] | null
          category_id?: string | null
          created_at?: string
          date: string
          id?: string
          imported_to_app?: boolean
          merchant_name?: string | null
          name: string
          pending?: boolean
          plaid_account_id: string
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          app_transaction_id?: string | null
          category?: string[] | null
          category_id?: string | null
          created_at?: string
          date?: string
          id?: string
          imported_to_app?: boolean
          merchant_name?: string | null
          name?: string
          pending?: boolean
          plaid_account_id?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plaid_transactions_app_transaction_id_fkey"
            columns: ["app_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plaid_transactions_plaid_account_id_fkey"
            columns: ["plaid_account_id"]
            isOneToOne: false
            referencedRelation: "plaid_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accent_color: string | null
          business_seats: number | null
          company_id: string | null
          created_at: string
          dashboard_expense_color: string | null
          dashboard_income_color: string | null
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          preferred_currency: string | null
          primary_color: string | null
          secondary_color: string | null
          subscription_expires_at: string | null
          subscription_id: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          business_seats?: number | null
          company_id?: string | null
          created_at?: string
          dashboard_expense_color?: string | null
          dashboard_income_color?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          preferred_currency?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          subscription_expires_at?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          business_seats?: number | null
          company_id?: string | null
          created_at?: string
          dashboard_expense_color?: string | null
          dashboard_income_color?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          preferred_currency?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          subscription_expires_at?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_cents: number
          cancelled_at: string | null
          created_at: string | null
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          price_per_seat: number | null
          seats: number | null
          square_customer_id: string | null
          square_subscription_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          price_per_seat?: number | null
          seats?: number | null
          square_customer_id?: string | null
          square_subscription_id?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          price_per_seat?: number | null
          seats?: number | null
          square_customer_id?: string | null
          square_subscription_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          clock_in: string
          clock_out: string | null
          company_id: string
          created_at: string | null
          employee_id: string
          hours_worked: number | null
          id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          clock_in: string
          clock_out?: string | null
          company_id: string
          created_at?: string | null
          employee_id: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          clock_in?: string
          clock_out?: string | null
          company_id?: string
          created_at?: string | null
          employee_id?: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          date: string
          id: string
          name: string
          notes: string | null
          receipt_url: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          date: string
          id?: string
          name: string
          notes?: string | null
          receipt_url?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          id?: string
          name?: string
          notes?: string | null
          receipt_url?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "supervisor" | "employee"
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
    Enums: {
      user_role: ["supervisor", "employee"],
    },
  },
} as const
