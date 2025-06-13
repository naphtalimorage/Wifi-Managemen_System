import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  users: {
    id: string
    full_name: string
    phone_number: string
    email: string
    created_at: string
    updated_at: string
  }
  data_plans: {
    id: string
    name: string
    duration_hours: number
    price_ksh: number
    description: string
    is_active: boolean
    created_at: string
  }
  user_sessions: {
    id: string
    user_id: string
    plan_id: string
    mac_address: string
    ip_address: string
    start_time: string
    end_time: string
    is_active: boolean
    created_at: string
  }
  payments: {
    id: string
    user_id: string
    session_id: string
    amount_ksh: number
    mpesa_transaction_id: string
    phone_number: string
    status: 'pending' | 'completed' | 'failed'
    created_at: string
    updated_at: string
  }
}