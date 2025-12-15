import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey)

if (import.meta.env.DEV) {
  console.warn(
    "Supabase Storage: убедитесь, что существует bucket 'case-images' и для роли anon разрешён INSERT (RLS Policy)."
  )
}
