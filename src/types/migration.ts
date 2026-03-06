
export type MigrationSource = 
  | 'hubspot' | 'zoho' | 'pipedrive' | 'odoo' | 'salesforce' 
  | 'freshsales' | 'bitrix24' | 'csv' | 'excel' | 'json';

export type MigrationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type DuplicateStrategy = 'ignore' | 'overwrite' | 'merge';

export interface MigrationJob {
  id: string;
  workspaceId: string;
  userId: string;
  source: MigrationSource;
  status: MigrationStatus;
  config: {
    fileUrl?: string;
    accessToken?: string;
    apiKey?: string;
    fieldMapping: Record<string, string>;
    duplicateStrategy: DuplicateStrategy;
    incremental: boolean;
  };
  stats: {
    total: number;
    processed: number;
    succeeded: number;
    failed: number;
    warnings: number;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface NoctraRecord {
  type: 'contact' | 'company' | 'deal' | 'activity' | 'pipeline' | 'tag';
  data: Record<string, any>;
  metadata?: {
    externalId?: string;
    source?: MigrationSource;
  };
}

export interface MigrationLog {
  id: string;
  migrationId: string;
  level: 'info' | 'warning' | 'error';
  rowNumber?: number;
  externalId?: string;
  message: string;
  details?: any;
  createdAt: string;
}
