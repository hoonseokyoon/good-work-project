import 'server-only'

import { createClient } from '@supabase/supabase-js'

export function sb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false }
  })
}
