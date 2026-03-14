import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

export const DEFAULT_SERVICE_TYPES = [
  { key: 'web_presence', label: 'Presencia Web',
    base_price: 20000, weeks: 5 },
  { key: 'ecommerce', label: 'E-Commerce',
    base_price: 35000, weeks: 7 },
  { key: 'custom_system', label: 'Sistema Personalizado',
    base_price: 50000, weeks: 12 },
  { key: 'seo', label: 'SEO & Crecimiento',
    base_price: 8000, weeks: null },
  { key: 'ongoing', label: 'Gestión Continua',
    base_price: 5500, weeks: null },
]

export const DEFAULT_PIPELINE_STAGES = [
  'NUEVO', 'CONTACTADO', 'PROPUESTA ENVIADA',
  'EN NEGOCIACIÓN', 'CERRADO', 'PERDIDO',
]

export const getWorkspaceConfig = cache(
  async (workspaceId: string) => {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
        },
      }
    )

    const { data, error } = await supabase
      .from('workspace_config')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle()

    if (error) {
      console.error('[getWorkspaceConfig] lookup failed:', error)
    }

    // Return config with safe defaults
    return {
      serviceTypes: data?.service_types ?? DEFAULT_SERVICE_TYPES,
      pipelineStages: data?.pipeline_stages ?? DEFAULT_PIPELINE_STAGES,
      contractClauses: data?.contract_clauses ?? [],
      proposalFooter: data?.proposal_footer ?? null,
      defaultHourlyRate: data?.default_hourly_rate ?? 800,
    }
  }
)
