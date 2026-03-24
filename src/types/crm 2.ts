// ============================================
// CRM Type Definitions
// ============================================

// Enum types matching database constraints
export type ProspectSource = 'website' | 'referral' | 'linkedin' | 'cold_outreach' | 'other';
export type ProspectStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost';
export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
export type DiscountType = 'percentage' | 'fixed';
export type SignatureType = 'drawn' | 'typed';
export type ProposalActivityAction =
  | 'created'
  | 'updated'
  | 'sent'
  | 'viewed'
  | 'downloaded'
  | 'signed'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'comment';

// ============================================
// Database Row Types
// ============================================

export type Prospect = {
  id: string;
  email: string;
  name: string;
  company_name: string | null;
  phone: string | null;
  source: ProspectSource;
  status: ProspectStatus;
  notes: string | null;
  tags: string[];
  converted_to_profile_id: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Proposal = {
  id: string;
  prospect_id: string;
  title: string;
  description: string | null;
  status: ProposalStatus;
  valid_until: string | null;
  currency: string;
  subtotal: number;
  discount_type: DiscountType;
  discount_value: number;
  tax_percentage: number;
  total: number;
  payment_terms: string | null;
  estimated_duration: string | null;
  public_uuid: string;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  created_project_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProposalItem = {
  id: string;
  proposal_id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total: number; // Computed column
  category: string | null;
  sort_order: number;
  created_at: string;
};

export type ProposalSignature = {
  id: string;
  proposal_id: string;
  signer_name: string;
  signer_email: string;
  signer_title: string | null;
  signature_type: SignatureType;
  signature_data: string;
  ip_address: string | null;
  user_agent: string | null;
  terms_accepted: boolean;
  signed_at: string;
};

export type ProposalActivity = {
  id: string;
  proposal_id: string;
  action: ProposalActivityAction;
  performed_by: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
};

// ============================================
// Insert Types (for creating new records)
// ============================================

export type ProspectInsert = Omit<Prospect, 'id' | 'created_at' | 'updated_at' | 'converted_at' | 'converted_to_profile_id'> & {
  id?: string;
  tags?: string[];
};

export type ProposalInsert = Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'public_uuid' | 'subtotal' | 'total'> & {
  id?: string;
};

export type ProposalItemInsert = Omit<ProposalItem, 'id' | 'created_at' | 'total'> & {
  id?: string;
};

export type ProposalSignatureInsert = Omit<ProposalSignature, 'id' | 'signed_at'> & {
  id?: string;
};

// ============================================
// Update Types (for partial updates)
// ============================================

export type ProspectUpdate = Partial<Omit<Prospect, 'id' | 'created_at'>>;
export type ProposalUpdate = Partial<Omit<Proposal, 'id' | 'created_at' | 'public_uuid'>>;
export type ProposalItemUpdate = Partial<Omit<ProposalItem, 'id' | 'created_at' | 'total'>>;

// ============================================
// Joined/Expanded Types (for queries with relations)
// ============================================

export type ProposalWithProspect = Proposal & {
  prospect: Prospect;
};

export type ProposalWithItems = Proposal & {
  items: ProposalItem[];
};

export type ProposalWithSignature = Proposal & {
  signature: ProposalSignature | null;
};

export type ProposalFull = Proposal & {
  prospect: Prospect;
  items: ProposalItem[];
  signature: ProposalSignature | null;
  activities: ProposalActivity[];
};

// Public portal view (limited data for /p/[uuid])
export type PublicProposalView = {
  id: string;
  title: string;
  description: string | null;
  status: ProposalStatus;
  valid_until: string | null;
  currency: string;
  subtotal: number;
  discount_type: DiscountType;
  discount_value: number;
  tax_percentage: number;
  total: number;
  payment_terms: string | null;
  estimated_duration: string | null;
  items: ProposalItem[];
  prospect: {
    name: string;
    company_name: string | null;
  };
  is_signed: boolean;
  signature?: {
    signer_name: string;
    signed_at: string;
  };
};

// ============================================
// CRM Dashboard/List Types
// ============================================

export type ProspectListItem = Pick<Prospect, 'id' | 'email' | 'name' | 'company_name' | 'status' | 'source' | 'created_at'> & {
  proposals_count: number;
  last_proposal_date: string | null;
};

export type ProposalListItem = Pick<Proposal, 'id' | 'title' | 'status' | 'total' | 'created_at' | 'sent_at' | 'valid_until'> & {
  prospect_name: string;
  prospect_company: string | null;
};

// ============================================
// Form Types (for React Hook Form)
// ============================================

export type ProspectFormData = {
  email: string;
  name: string;
  company_name?: string;
  phone?: string;
  source: ProspectSource;
  notes?: string;
  tags?: string[];
};

export type ProposalFormData = {
  prospect_id: string;
  title: string;
  description?: string;
  valid_until?: string;
  currency: string;
  discount_type: DiscountType;
  discount_value: number;
  tax_percentage: number;
  payment_terms?: string;
  estimated_duration?: string;
  items: {
    name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    category?: string;
  }[];
};

export type SignatureFormData = {
  signer_name: string;
  signer_email: string;
  signer_title?: string;
  signature_type: SignatureType;
  signature_data: string;
  terms_accepted: boolean;
};

// ============================================
// API Response Types
// ============================================

export type ConvertProspectResult = {
  success: boolean;
  error?: string;
  project_id?: string;
  profile_id?: string;
  prospect_email?: string;
  prospect_name?: string;
};

// ============================================
// Filter/Query Types
// ============================================

export type ProspectFilters = {
  status?: ProspectStatus[];
  source?: ProspectSource[];
  search?: string;
  dateRange?: {
    from: string;
    to: string;
  };
};

export type ProposalFilters = {
  status?: ProposalStatus[];
  prospect_id?: string;
  search?: string;
  dateRange?: {
    from: string;
    to: string;
  };
};

// ============================================
// Stats/Analytics Types
// ============================================

export type CRMStats = {
  total_prospects: number;
  prospects_by_status: Record<ProspectStatus, number>;
  total_proposals: number;
  proposals_by_status: Record<ProposalStatus, number>;
  total_revenue: number; // Sum of accepted proposals
  conversion_rate: number; // won prospects / total prospects
  avg_proposal_value: number;
};

export type ProspectStats = {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  proposal_sent: number;
  negotiating: number;
  won: number;
  lost: number;
};

export type ProposalStats = {
  total: number;
  draft: number;
  sent: number;
  viewed: number;
  accepted: number;
  rejected: number;
  expired: number;
  total_value: number;
  accepted_value: number;
};
