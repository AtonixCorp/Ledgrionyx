const BASE_MODULES = ['overview', 'members', 'groups', 'meetings', 'calendar', 'files', 'permissions', 'settings', 'email', 'marketing'];

const withBaseModules = (...modules) => Array.from(new Set([...BASE_MODULES, ...modules]));

export const WORKSPACE_TYPE_REGISTRY = {
  technology: {
    label: 'Technology',
    industryLabel: 'Technology',
    description: 'Provisions engineering-focused dashboards for project delivery, code collaboration, and system monitoring.',
    branches: [
      { key: 'software_development', label: 'Software Development', children: ['Frontend', 'Backend', 'QA'] },
      { key: 'hardware_engineering', label: 'Hardware Engineering', children: ['Embedded Systems', 'Firmware', 'Testing'] },
      { key: 'it_services', label: 'IT Services', children: ['Infrastructure', 'Security', 'Support'] },
    ],
    dashboards: ['Project Tracking', 'Code Repositories', 'System Monitoring'],
    modules: withBaseModules('project_tracking', 'code_repositories', 'system_monitoring', 'incident_management'),
    rbac: { admin: ['overview', 'projects', 'repos', 'monitoring'], manager: ['overview', 'projects', 'monitoring'], contributor: ['projects', 'repos'], viewer: ['overview'] },
  },
  retail_commerce: {
    label: 'Retail/Commerce',
    industryLabel: 'Retail/Commerce',
    description: 'Sets up commerce operations for product catalogs, order flows, inventory control, and customer support.',
    branches: [
      { key: 'ecommerce', label: 'E-commerce', children: ['Inventory', 'Sales', 'Customer Service'] },
      { key: 'wholesale', label: 'Wholesale', children: ['Inventory', 'Sales', 'Customer Service'] },
      { key: 'brick_mortar', label: 'Brick & Mortar', children: ['Inventory', 'Sales', 'Customer Service'] },
    ],
    dashboards: ['POS Integration', 'Product Catalogs', 'Order Management'],
    modules: withBaseModules('pos_integration', 'product_catalogs', 'order_management', 'inventory_control'),
    rbac: { admin: ['overview', 'catalog', 'orders', 'inventory'], manager: ['overview', 'orders', 'inventory'], contributor: ['orders', 'catalog'], viewer: ['overview'] },
  },
  manufacturing: {
    label: 'Manufacturing',
    industryLabel: 'Manufacturing',
    description: 'Configures manufacturing workflows for production planning, quality control, and supply chain visibility.',
    branches: [
      { key: 'automotive', label: 'Automotive', children: ['Production Line', 'Quality Control', 'Supply Chain'] },
      { key: 'electronics', label: 'Electronics', children: ['Production Line', 'Quality Control', 'Supply Chain'] },
      { key: 'food_processing', label: 'Food Processing', children: ['Production Line', 'Quality Control', 'Supply Chain'] },
    ],
    dashboards: ['Workflow Automation', 'Resource Planning', 'Compliance Tracking'],
    modules: withBaseModules('workflow_automation', 'resource_planning', 'compliance_tracking', 'shop_floor_ops'),
    rbac: { admin: ['overview', 'resources', 'workflow', 'compliance'], manager: ['overview', 'resources', 'workflow'], contributor: ['workflow', 'resources'], viewer: ['overview'] },
  },
  creative_studio: {
    label: 'Creative Studio',
    industryLabel: 'Creative Studio',
    description: 'Creates a studio workspace for creative production, asset review, collaboration boards, and publishing pipelines.',
    branches: [
      { key: 'design', label: 'Design', children: ['Projects', 'Editing', 'Distribution'] },
      { key: 'film', label: 'Film', children: ['Projects', 'Editing', 'Distribution'] },
      { key: 'music', label: 'Music', children: ['Projects', 'Editing', 'Distribution'] },
      { key: 'publishing', label: 'Publishing', children: ['Projects', 'Editing', 'Distribution'] },
    ],
    dashboards: ['Asset Libraries', 'Collaboration Boards', 'Content Pipelines'],
    modules: withBaseModules('asset_libraries', 'collaboration_boards', 'content_pipelines', 'review_cycles'),
    rbac: { admin: ['overview', 'assets', 'boards', 'pipeline'], manager: ['overview', 'assets', 'pipeline'], contributor: ['assets', 'boards'], viewer: ['overview'] },
  },
  consulting: {
    label: 'Consulting',
    industryLabel: 'Consulting',
    description: 'Builds a client-service workspace for proposals, engagements, deliverables, and advisory analytics.',
    branches: [
      { key: 'business_strategy', label: 'Business Strategy', children: ['Client Engagements', 'Reports', 'Deliverables'] },
      { key: 'it_consulting', label: 'IT Consulting', children: ['Client Engagements', 'Reports', 'Deliverables'] },
      { key: 'hr_advisory', label: 'HR Advisory', children: ['Client Engagements', 'Reports', 'Deliverables'] },
    ],
    dashboards: ['Proposal Management', 'Client Portals', 'Analytics'],
    modules: withBaseModules('proposal_management', 'client_portals', 'analytics', 'deliverable_tracking'),
    rbac: { admin: ['overview', 'proposals', 'clients', 'analytics'], manager: ['overview', 'clients', 'analytics'], contributor: ['proposals', 'clients'], viewer: ['overview'] },
  },
  research: {
    label: 'Research',
    industryLabel: 'Research',
    description: 'Provisions research operations for data repositories, experiment tracking, analysis workflows, and publication management.',
    branches: [
      { key: 'scientific_research', label: 'Scientific Research', children: ['Field Studies', 'Analysis', 'Publications'] },
      { key: 'market_research', label: 'Market Research', children: ['Data Collection', 'Analysis', 'Reporting'] },
      { key: 'r_and_d', label: 'R&D', children: ['Experiments', 'Prototyping', 'Documentation'] },
    ],
    dashboards: ['Research Pipelines', 'Data Repositories', 'Publication Tracking'],
    modules: withBaseModules('research_pipelines', 'data_repositories', 'publication_tracking', 'experiment_management'),
    rbac: { admin: ['overview', 'research', 'data', 'publications'], manager: ['overview', 'research', 'publications'], contributor: ['research', 'data'], viewer: ['overview'] },
  },
  finance: {
    label: 'Finance',
    industryLabel: 'Finance',
    description: 'Enables finance-heavy operations with ledgers, payroll, transaction oversight, and compliance controls.',
    branches: [
      { key: 'banking', label: 'Banking', children: ['Accounts', 'Transactions', 'Risk Management'] },
      { key: 'investment', label: 'Investment', children: ['Accounts', 'Transactions', 'Risk Management'] },
      { key: 'insurance', label: 'Insurance', children: ['Accounts', 'Transactions', 'Risk Management'] },
    ],
    dashboards: ['Ledgers', 'Payroll', 'Compliance Modules'],
    modules: withBaseModules('finance', 'compliance', 'ledgers', 'payroll', 'risk_management'),
    rbac: { admin: ['overview', 'ledgers', 'payroll', 'compliance'], manager: ['overview', 'ledgers', 'compliance'], contributor: ['ledgers', 'payroll'], viewer: ['overview'] },
  },
  healthcare: {
    label: 'Healthcare',
    industryLabel: 'Healthcare',
    description: 'Sets up healthcare administration for patient records, scheduling, billing, and clinical operations.',
    branches: [
      { key: 'hospital', label: 'Hospital', children: ['Cardiology', 'Pediatrics', 'Radiology'] },
      { key: 'clinic', label: 'Clinic', children: ['Cardiology', 'Pediatrics', 'Radiology'] },
      { key: 'pharmacy', label: 'Pharmacy', children: ['Dispensing', 'Inventory', 'Billing'] },
      { key: 'laboratory', label: 'Laboratory', children: ['Diagnostics', 'Radiology', 'Billing'] },
    ],
    dashboards: ['Patient Records', 'Scheduling', 'Billing'],
    modules: withBaseModules('patient_records', 'scheduling', 'billing', 'clinical_operations'),
    rbac: { admin: ['overview', 'patients', 'scheduling', 'billing'], manager: ['overview', 'scheduling', 'billing'], contributor: ['patients', 'scheduling'], viewer: ['overview'] },
  },
  education: {
    label: 'Education',
    industryLabel: 'Education',
    description: 'Creates an academic workspace for courses, student records, faculty administration, and curriculum planning.',
    branches: [
      { key: 'school', label: 'School', children: ['Faculties', 'Departments', 'Offices'] },
      { key: 'college', label: 'College', children: ['Faculties', 'Departments', 'Offices'] },
      { key: 'university', label: 'University', children: ['Faculties', 'Departments', 'Offices'] },
      { key: 'training_center', label: 'Training Center', children: ['Faculties', 'Departments', 'Offices'] },
    ],
    dashboards: ['Course Management', 'Student Records', 'Faculty Administration'],
    modules: withBaseModules('course_management', 'student_records', 'faculty_administration', 'curriculum_planning'),
    rbac: { admin: ['overview', 'courses', 'students', 'faculty'], manager: ['overview', 'courses', 'faculty'], contributor: ['courses', 'students'], viewer: ['overview'] },
  },
  accounting: {
    label: 'Accounting',
    industryLabel: 'Accounting',
    description: 'Configures accounting operations for statements, audit trails, payroll, compliance, and reporting.',
    branches: [
      { key: 'corporate_accounting', label: 'Corporate Accounting', children: ['Ledger', 'Payroll', 'Compliance'] },
      { key: 'sme_accounting', label: 'SME Accounting', children: ['Ledger', 'Payroll', 'Compliance'] },
      { key: 'auditing', label: 'Auditing', children: ['Ledger', 'Payroll', 'Compliance'] },
      { key: 'taxation', label: 'Taxation', children: ['Ledger', 'Payroll', 'Compliance'] },
    ],
    dashboards: ['Financial Statements', 'Audit Trails', 'Reporting Tools'],
    modules: withBaseModules('finance', 'compliance', 'financial_statements', 'audit_trails', 'reporting_tools'),
    rbac: { admin: ['overview', 'statements', 'audit', 'reporting'], manager: ['overview', 'statements', 'reporting'], contributor: ['statements', 'audit'], viewer: ['overview'] },
  },
  media_entertainment: {
    label: 'Media/Entertainment',
    industryLabel: 'Media/Entertainment',
    description: 'Builds media operations for production timelines, asset management, distribution, and marketing workflows.',
    branches: [
      { key: 'film', label: 'Film', children: ['Production', 'Editing', 'Distribution'] },
      { key: 'music', label: 'Music', children: ['Production', 'Editing', 'Distribution'] },
      { key: 'digital_media', label: 'Digital Media', children: ['Production', 'Editing', 'Distribution'] },
      { key: 'publishing', label: 'Publishing', children: ['Production', 'Editing', 'Distribution'] },
    ],
    dashboards: ['Project Timelines', 'Asset Management', 'Marketing Tools'],
    modules: withBaseModules('project_timelines', 'asset_management', 'marketing_tools', 'distribution_ops'),
    rbac: { admin: ['overview', 'projects', 'assets', 'marketing'], manager: ['overview', 'projects', 'marketing'], contributor: ['projects', 'assets'], viewer: ['overview'] },
  },
  construction: {
    label: 'Construction',
    industryLabel: 'Construction',
    description: 'Prepares a construction workspace for projects, sites, safety compliance, and resource allocation.',
    branches: [
      { key: 'residential', label: 'Residential', children: ['Projects', 'Sites', 'Teams'] },
      { key: 'commercial', label: 'Commercial', children: ['Projects', 'Sites', 'Teams'] },
      { key: 'infrastructure', label: 'Infrastructure', children: ['Projects', 'Sites', 'Teams'] },
    ],
    dashboards: ['Resource Allocation', 'Site Management', 'Safety Compliance'],
    modules: withBaseModules('resource_allocation', 'site_management', 'safety_compliance', 'project_controls'),
    rbac: { admin: ['overview', 'resources', 'sites', 'safety'], manager: ['overview', 'resources', 'sites'], contributor: ['sites', 'resources'], viewer: ['overview'] },
  },
  engineering: {
    label: 'Engineering',
    industryLabel: 'Engineering',
    description: 'Sets up engineering delivery for design reviews, project planning, resource coordination, and compliance tracking.',
    branches: [
      { key: 'civil_engineering', label: 'Civil Engineering', children: ['Design', 'Projects', 'Field Ops'] },
      { key: 'mechanical_engineering', label: 'Mechanical Engineering', children: ['Design', 'Projects', 'Field Ops'] },
      { key: 'electrical_engineering', label: 'Electrical Engineering', children: ['Design', 'Projects', 'Field Ops'] },
    ],
    dashboards: ['Project Tracking', 'Resource Planning', 'Compliance Tracking'],
    modules: withBaseModules('project_tracking', 'resource_planning', 'compliance_tracking', 'design_reviews'),
    rbac: { admin: ['overview', 'projects', 'resources', 'compliance'], manager: ['overview', 'projects', 'resources'], contributor: ['projects', 'design_reviews'], viewer: ['overview'] },
  },
};

export const WORKSPACE_TYPE_OPTIONS = Object.entries(WORKSPACE_TYPE_REGISTRY).map(([value, definition]) => ({
  value,
  label: definition.label,
  description: definition.description,
}));

export const getWorkspaceTypeDefinition = (workspaceType) => WORKSPACE_TYPE_REGISTRY[workspaceType] || null;
