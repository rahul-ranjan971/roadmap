import { createClient } from '@supabase/supabase-js'

const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined
const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (typeof import.meta !== 'undefined' && import.meta.env?.DEV && !isSupabaseConfigured) {
  console.warn(
    '[CareerCompass] Supabase credentials missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set.'
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null