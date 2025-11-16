import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ ICARUS: Supabase credentials not found in environment variables.\n' +
    'Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'x-application-name': 'ICARUS-v5.0'
      }
    }
  }
);

// Export configuration for debugging
export const supabaseConfig = {
  url: supabaseUrl,
  hasCredentials: !!(supabaseUrl && supabaseAnonKey),
  isConfigured: !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co')
};

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return supabaseConfig.isConfigured;
}

// Type definitions for database tables
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          cnpj: string;
          address: string | null;
          city: string | null;
          state: string | null;
          phone: string | null;
          email: string | null;
          status: 'active' | 'inactive' | 'suspended';
          created_at: string;
          updated_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          company_id: string;
          category_id: string | null;
          manufacturer_id: string | null;
          name: string;
          code: string;
          anvisa_code: string | null;
          product_type: 'ortese' | 'protese' | 'material_especial' | 'implante' | null;
          specialty: string | null;
          description: string | null;
          cost_price: number | null;
          sale_price: number | null;
          stock_quantity: number;
          min_stock: number;
          max_stock: number | null;
          unit: string;
          status: 'active' | 'inactive' | 'discontinued';
          created_at: string;
          updated_at: string;
        };
      };
      // Add other table types as needed
    };
  };
};
