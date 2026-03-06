
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { createClient } from "@supabase/supabase-js";
import { MigrationJob, MigrationLog } from '../types/migration';
import { validateRow } from '../lib/migration/validators';

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || 'redis://localhost:6379';
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const migrationQueue = new Queue('migration-queue', { connection: connection as any });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const migrationWorker = new Worker(
  'migration-queue',
  async (job: Job<any>) => {
    const { migrationId, workspaceId, source, fieldMapping, duplicateStrategy } = job.data;

    console.log(`[MigrationWorker] Starting job ${job.id} for migration ${migrationId}`);

    try {
      // 1. Update status to processing
      await supabase
        .from('migrations')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', migrationId);

      // 2. Fetch data (simplified for now, logic will depend on source)
      let rawData: any[] = [];
      if (source === 'csv' || source === 'excel') {
        // Fetch file from storage and parse
        // Placeholder for real parsing logic (PapaParse, xlsx)
      } else {
        // Fetch from Tier 1 Connector (HubSpot, etc.)
      }

      const total = rawData.length;
      let processed = 0;
      let succeeded = 0;
      let failed = 0;
      let warnings = 0;

      // 3. Process in batches
      const BATCH_SIZE = 100;
      for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
        const batch = rawData.slice(i, i + BATCH_SIZE);
        
        for (const rawRow of batch) {
          try {
            // Transform and Validate
            // (Real implementation would use validators.ts and connectors.ts)
            
            // Insert into Supabase (contacts/deals/etc)
            
            succeeded++;
          } catch (error: any) {
            failed++;
            await supabase.from('migration_logs').insert({
              migration_id: migrationId,
              level: 'error',
              message: error.message || 'Unknown error',
              details: { row: rawRow }
            });
          }
          
          processed++;
        }

        // Update progress in real-time
        await supabase
          .from('migrations')
          .update({ 
            stats: { total, processed, succeeded, failed, warnings },
            updated_at: new Date().toISOString() 
          })
          .eq('id', migrationId);
      }

      // 4. Finalize
      await supabase
        .from('migrations')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', migrationId);

    } catch (error: any) {
      console.error(`[MigrationWorker] Job ${job.id} failed:`, error);
      await supabase
        .from('migrations')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', migrationId);
      
      await supabase.from('migration_logs').insert({
        migration_id: migrationId,
        level: 'error',
        message: `Critical failure: ${error.message}`
      });
    }
  },
  { connection: connection as any }
);
