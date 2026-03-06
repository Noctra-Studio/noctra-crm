import { SupabaseClient } from '@supabase/supabase-js'
import { getTemplateForServiceType } from './task-templates'

export async function populateProjectTasks(
  supabase: SupabaseClient,
  projectId: string,
  serviceType: string | null
) {
  // Check if tasks already exist
  const { count } = await supabase
    .from('project_tasks')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)

  if (count && count > 0) return // already populated

  const template = getTemplateForServiceType(serviceType)
  
  const tasks = template.flatMap((phase, phaseIndex) =>
    phase.tasks.map((title, taskIndex) => ({
      project_id: projectId,
      phase: phase.phase,
      title,
      completed: false,
      sort_order: phaseIndex * 100 + taskIndex,
    }))
  )

  if (tasks.length === 0) return

  const { error } = await supabase
    .from('project_tasks')
    .insert(tasks)

  if (error) {
    console.error('Failed to populate tasks:', error)
  }
}
