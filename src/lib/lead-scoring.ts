export interface Lead {
  service_type?: string | null
  message?: string | null
  phone?: string | null
  company?: string | null
  source_cta?: string | null
  created_at?: string
  pipeline_status?: string
}

export interface ScoreBreakdown {
  serviceIntent: number
  messageQuality: number
  dataCompleteness: number
  sourceCta: number
  responseTime: number
  score: number
  label: 'HOT' | 'WARM' | 'COOL' | 'COLD'
}

const HIGH_INTENT_CTAS = [
  'iniciar-proyecto', 'start-project',
  'agendar-llamada', 'schedule-call',
  'quiero-empezar', 'contratar'
]

const MEDIUM_INTENT_CTAS = [
  'cotizar', 'mas-informacion', 
  'ver-precios', 'contactar'
]

export function calculateLeadScore(
  lead: Lead,
  contactedAt?: Date | null
): ScoreBreakdown {
  let score = 0
  const breakdown: any = {}

  // 1. SERVICE INTENT (30 pts)
  const serviceScores: Record<string, number> = {
    custom_system: 30,
    ecommerce: 25,
    web_presence: 20,
    discovery_call: 15,
    general: 10,
  }
  breakdown.serviceIntent = 
    serviceScores[lead.service_type ?? ''] ?? 10
  score += breakdown.serviceIntent

  // 2. MESSAGE QUALITY (20 pts)
  const msgLen = lead.message?.length ?? 0
  if (msgLen > 200)      breakdown.messageQuality = 20
  else if (msgLen > 100) breakdown.messageQuality = 10
  else if (msgLen > 50)  breakdown.messageQuality = 5
  else                   breakdown.messageQuality = 0
  score += breakdown.messageQuality

  // 3. CONTACT COMPLETENESS (20 pts)
  let contact = 0
  if (lead.phone?.trim())   contact += 10
  if (lead.company?.trim()) contact += 10
  breakdown.dataCompleteness = contact
  score += contact

  // 4. SOURCE CTA (15 pts)
  const ctaLower = (lead.source_cta ?? '').toLowerCase()
  if (HIGH_INTENT_CTAS.some(c => ctaLower.includes(c))) {
    breakdown.sourceCta = 15
  } else if (MEDIUM_INTENT_CTAS.some(c => ctaLower.includes(c))) {
    breakdown.sourceCta = 10
  } else if (ctaLower) {
    breakdown.sourceCta = 5
  } else {
    breakdown.sourceCta = 0
  }
  score += breakdown.sourceCta

  // 5. RESPONSE TIME BONUS (15 pts)
  // Only if already contacted
  if (
    contactedAt && 
    lead.created_at &&
    lead.pipeline_status !== 'nuevo'
  ) {
    const created = new Date(lead.created_at)
    const diffHours = 
      (contactedAt.getTime() - created.getTime()) 
      / (1000 * 60 * 60)

    if (diffHours <= 1)       breakdown.responseTime = 15
    else if (diffHours <= 24) breakdown.responseTime = 10
    else if (diffHours <= 48) breakdown.responseTime = 5
    else                      breakdown.responseTime = 0
  } else {
    breakdown.responseTime = 0
  }
  score += breakdown.responseTime

  // LABEL
  let label: ScoreBreakdown['label']
  if (score >= 80)      label = 'HOT'
  else if (score >= 60) label = 'WARM'
  else if (score >= 40) label = 'COOL'
  else                  label = 'COLD'

  return {
    ...breakdown,
    score: score,
    label,
  } as ScoreBreakdown
}
