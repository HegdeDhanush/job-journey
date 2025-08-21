import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are configured
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
  console.error('You can get these values from your Supabase project dashboard.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Database types
export interface Profile {
  id: string
  full_name?: string
  email?: string
  college?: string
  course?: string
  graduation_year?: number
  created_at: string
  updated_at: string
}

export interface Placement {
  id: string
  user_id: string
  s_no?: number
  company_name: string
  eligibility?: string
  registration_deadline?: string
  registration_deadline_time?: string
  registration_link?: string
  test_1?: string
  test_1_date?: string
  test_1_time?: string
  result_1?: string
  test_2?: string
  test_2_date?: string
  test_2_time?: string
  result_2?: string
  test_3?: string
  test_3_date?: string
  test_3_time?: string
  result_3?: string
  test_4?: string
  test_4_date?: string
  test_4_time?: string
  result_4?: string
  test_5?: string
  test_5_date?: string
  test_5_time?: string
  result_5?: string
  interview_1?: string
  interview_1_date?: string
  interview_1_time?: string
  interview_result_1?: string
  interview_2?: string
  interview_2_date?: string
  interview_2_time?: string
  interview_result_2?: string
  interview_3?: string
  interview_3_date?: string
  interview_3_time?: string
  interview_result_3?: string
  are_you_eligible?: boolean
  ctc?: number
  role?: string
  location?: string
  status: 'Applied' | 'In Progress' | 'Selected' | 'Rejected' | 'Withdrawn' | 'Not Eligible'
  created_at: string
  updated_at: string
}