import { createClient } from "@/utils/supabase/server"

export type Project = {
  id: string
  slug: string
  name: string
  tagline: string
  industry: string
  status: 'discovery' | 'design' | 'development' | 'launch' | 'completed'
  launch_date: string
  case_study_enabled: boolean
  challenge: string | null
  solution: string | null
  results: string | null
  metrics: { label: string; value: string; delta?: string }[]
  gallery: { url: string; caption: string }[]
  has_ai_form: boolean
  form_description: string | null
  sort_order: number
  visible: boolean
  start_date: string | null
  deadline: string | null
  internal_notes: string | null
  budget: number
  hourly_rate: number
  total_hours: number
  total_expenses: number
  service_type?: 'web_presence' | 'ecommerce' | 'custom_system'
  report_token?: string
  report_config?: {
    custom_message: string
    include_tasks: boolean
    include_deliverables: boolean
  }
  report_generated_at?: string
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Project[]
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Project
}
