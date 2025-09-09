import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gfgevbjtrqyrqeqlehkz.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey);