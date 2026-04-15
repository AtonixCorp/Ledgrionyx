export type MobileUser = {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
    account_type?: string;
    country?: string;
    phone?: string;
};

export type Organization = {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    logo_url?: string;
    industry?: string;
    employee_count?: number;
    primary_currency?: string;
    primary_country?: string;
    email?: string;
    address?: string;
    service_time?: string;
    website?: string;
    owner_name?: string;
    owner_email?: string;
    created_at?: string;
    updated_at?: string;
};

export type Entity = {
    id: number;
    name: string;
    country?: string;
    entity_type?: string;
    status?: string;
    local_currency?: string;
    registration_number?: string;
    next_filing_date?: string;
    workspace_mode?: string;
};

export type PlatformTask = {
    id: number;
    title: string;
    summary?: string;
    state?: string;
    priority?: string;
    due_date?: string;
    department_name?: string;
    cost_center?: string;
};

export type AuditEvent = {
    id: number;
    action?: string;
    summary?: string;
    created_at?: string;
};

export type ComplianceDeadline = {
    id: number;
    title: string;
    deadline_date?: string;
    entity_name?: string;
    status?: string;
};

export type OrgOverview = {
    total_assets: string;
    total_liabilities: string;
    net_position: string;
    total_cash_by_currency: Record<string, string>;
    total_tax_exposure: string;
    active_jurisdictions: number;
    active_entities: number;
    pending_tax_returns: number;
    missing_data_entities: number;
    tax_exposure_by_country: Record<string, string>;
};

export type LoginResult = {
    success: boolean;
    error?: string;
    user?: MobileUser;
};