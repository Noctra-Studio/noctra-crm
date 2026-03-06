
import { NoctraRecord, MigrationSource } from "@/types/migration";

export interface ConnectorCredentials {
  accessToken?: string;
  apiKey?: string;
  portalId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  total?: number;
}

export interface MigrationConnector {
  name: string;
  source: MigrationSource;
  authenticate(credentials: ConnectorCredentials): Promise<boolean>;
  fetchContacts(cursor?: string): Promise<PaginatedResult<any>>;
  fetchCompanies(cursor?: string): Promise<PaginatedResult<any>>;
  fetchDeals(cursor?: string): Promise<PaginatedResult<any>>;
  fetchActivities(cursor?: string): Promise<PaginatedResult<any>>;
  transformToNoctraFormat(raw: any, type: NoctraRecord['type']): NoctraRecord;
}
