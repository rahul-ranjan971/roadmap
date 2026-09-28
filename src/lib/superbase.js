import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (import.meta.env.DEV && !isSupabaseConfigured) {
  console.warn(
    '[CareerCompass] Supabase credentials missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set.'
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null