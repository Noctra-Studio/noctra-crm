
import { Client } from "@hubspot/api-client";
import { 
  MigrationConnector, 
  ConnectorCredentials, 
  PaginatedResult 
} from "./base";
import { NoctraRecord } from "@/types/migration";

export class HubSpotConnector implements MigrationConnector {
  name = "HubSpot";
  source = "hubspot" as const;
  private client: Client | null = null;

  async authenticate(credentials: ConnectorCredentials): Promise<boolean> {
    if (!credentials.accessToken) return false;
    try {
      this.client = new Client({ accessToken: credentials.accessToken });
      // Simple call to verify token
      await this.client.crm.contacts.basicApi.getPage(1);
      return true;
    } catch (error) {
      console.error("[HubSpotConnector] Auth failed:", error);
      return false;
    }
  }

  async fetchContacts(cursor?: string): Promise<PaginatedResult<any>> {
    if (!this.client) throw new Error("Not authenticated");
    const response = await this.client.crm.contacts.basicApi.getPage(100, cursor);
    return {
      data: response.results,
      nextCursor: response.paging?.next?.after,
    };
  }

  async fetchCompanies(cursor?: string): Promise<PaginatedResult<any>> {
    if (!this.client) throw new Error("Not authenticated");
    const response = await this.client.crm.companies.basicApi.getPage(100, cursor);
    return {
      data: response.results,
      nextCursor: response.paging?.next?.after,
    };
  }

  async fetchDeals(cursor?: string): Promise<PaginatedResult<any>> {
    if (!this.client) throw new Error("Not authenticated");
    const response = await this.client.crm.deals.basicApi.getPage(100, cursor);
    return {
      data: response.results,
      nextCursor: response.paging?.next?.after,
    };
  }

  async fetchActivities(cursor?: string): Promise<PaginatedResult<any>> {
    if (!this.client) throw new Error("Not authenticated");
    // HubSpot activities are in the Communication or Notes API
    const response = await this.client.crm.objects.notes.basicApi.getPage(100, cursor);
    return {
      data: response.results,
      nextCursor: response.paging?.next?.after,
    };
  }

  transformToNoctraFormat(raw: any, type: NoctraRecord['type']): NoctraRecord {
    const props = raw.properties || {};
    
    // Mapping HubSpot properties to Noctra internal format
    const mapping: Record<string, any> = {};
    
    if (type === 'contact') {
      mapping.name = `${props.firstname || ''} ${props.lastname || ''}`.trim();
      mapping.email = props.email;
      mapping.phone = props.phone;
      mapping.job_title = props.jobtitle;
    } else if (type === 'company') {
      mapping.name = props.name;
      mapping.domain = props.domain;
      mapping.industry = props.industry;
    } else if (type === 'deal') {
      mapping.title = props.dealname;
      mapping.amount = parseFloat(props.amount || '0');
      mapping.stage = props.dealstage;
      mapping.close_date = props.closedate;
    }

    return {
      type,
      data: mapping,
      metadata: {
        externalId: raw.id,
        source: this.source,
      },
    };
  }
}
