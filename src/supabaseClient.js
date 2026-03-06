import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qjlsifjtwudzlgbipvco.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbHNpZmp0d3VkemxnYmlwdmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3Njc2MjMsImV4cCI6MjA4ODM0MzYyM30.uhcs5sYmrnUwoxy16jQbxRS3zqQwtdXNJ2JFQWH1HOA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
