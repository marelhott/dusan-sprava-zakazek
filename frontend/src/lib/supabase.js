// Supabase konfigurace a inicializace
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bnffmohurdvkqcnyfgcn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZmZtb2h1cmR2a3FjbnlmZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzI5NjksImV4cCI6MjA2Njc0ODk2OX0.WGEVVRnyvxVLMl7NF0yM6IdCdvOKT5bJmOQu--G_dZo'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZmZtb2h1cmR2a3FjbnlmZ2NuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTE3Mjk2OSwiZXhwIjoyMDY2NzQ4OTY5fQ.6IKUawhHiwOkRSYvFjmS3xbvVjDrk1IhC4h1O5InsyI'

export const supabase = createClient(supabaseUrl, supabaseKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Test připojení
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' })
    if (error && error.code === '42P01') {
      console.log('🔧 Supabase připojeno, ale tabulky ještě neexistují (to je v pořádku)')
      return true
    }
    console.log('✅ Supabase úspěšně připojeno')
    return true
  } catch (error) {
    console.error('❌ Chyba připojení k Supabase:', error)
    return false
  }
}

export default supabase