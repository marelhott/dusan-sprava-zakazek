import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bnffmohurdvkqcnyfgcn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZmZtb2h1cmR2a3FjbnlmZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzI5NjksImV4cCI6MjA2Njc0ODk2OX0.WGEVVRnyvxVLMl7NF0yM6IdCdvOKT5bJmOQu--G_dZo'

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase