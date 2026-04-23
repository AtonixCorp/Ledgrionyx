from copy import deepcopy

from .models import DEFAULT_MODULES


def _with_base_modules(*modules):
    seen = []
    for module in [*DEFAULT_MODULES, *modules]:
        if module not in seen:
            seen.append(module)
    return seen


WORKSPACE_TYPE_REGISTRY = {
    'technology': {
        'label': 'Technology',
        'industry_label': 'Technology',
        'template_key': 'technology-core',
        'branches': [
            {'key': 'software_development', 'label': 'Software Development', 'children': ['Frontend', 'Backend', 'QA']},
            {'key': 'hardware_engineering', 'label': 'Hardware Engineering', 'children': ['Embedded Systems', 'Firmware', 'Testing']},
            {'key': 'it_services', 'label': 'IT Services', 'children': ['Infrastructure', 'Security', 'Support']},
        ],
        'dashboards': ['project_tracking', 'code_repositories', 'system_monitoring'],
        'modules': _with_base_modules('project_tracking', 'code_repositories', 'system_monitoring', 'incident_management'),
        'rbac': {'admin': ['overview', 'projects', 'repos', 'monitoring'], 'manager': ['overview', 'projects', 'monitoring'], 'contributor': ['projects', 'repos'], 'viewer': ['overview']},
    },
    'retail_commerce': {
        'label': 'Retail/Commerce',
        'industry_label': 'Retail/Commerce',
        'template_key': 'retail-commerce-core',
        'branches': [
            {'key': 'ecommerce', 'label': 'E-commerce', 'children': ['Inventory', 'Sales', 'Customer Service']},
            {'key': 'wholesale', 'label': 'Wholesale', 'children': ['Inventory', 'Sales', 'Customer Service']},
            {'key': 'brick_mortar', 'label': 'Brick & Mortar', 'children': ['Inventory', 'Sales', 'Customer Service']},
        ],
        'dashboards': ['pos_integration', 'product_catalogs', 'order_management'],
        'modules': _with_base_modules('pos_integration', 'product_catalogs', 'order_management', 'inventory_control'),
        'rbac': {'admin': ['overview', 'catalog', 'orders', 'inventory'], 'manager': ['overview', 'orders', 'inventory'], 'contributor': ['orders', 'catalog'], 'viewer': ['overview']},
    },
    'manufacturing': {
        'label': 'Manufacturing',
        'industry_label': 'Manufacturing',
        'template_key': 'manufacturing-core',
        'branches': [
            {'key': 'automotive', 'label': 'Automotive', 'children': ['Production Line', 'Quality Control', 'Supply Chain']},
            {'key': 'electronics', 'label': 'Electronics', 'children': ['Production Line', 'Quality Control', 'Supply Chain']},
            {'key': 'food_processing', 'label': 'Food Processing', 'children': ['Production Line', 'Quality Control', 'Supply Chain']},
        ],
        'dashboards': ['workflow_automation', 'resource_planning', 'compliance_tracking'],
        'modules': _with_base_modules('workflow_automation', 'resource_planning', 'compliance_tracking', 'shop_floor_ops'),
        'rbac': {'admin': ['overview', 'resources', 'workflow', 'compliance'], 'manager': ['overview', 'resources', 'workflow'], 'contributor': ['workflow', 'resources'], 'viewer': ['overview']},
    },
    'creative_studio': {
        'label': 'Creative Studio',
        'industry_label': 'Creative Studio',
        'template_key': 'creative-studio-core',
        'branches': [
            {'key': 'design', 'label': 'Design', 'children': ['Projects', 'Editing', 'Distribution']},
            {'key': 'film', 'label': 'Film', 'children': ['Projects', 'Editing', 'Distribution']},
            {'key': 'music', 'label': 'Music', 'children': ['Projects', 'Editing', 'Distribution']},
            {'key': 'publishing', 'label': 'Publishing', 'children': ['Projects', 'Editing', 'Distribution']},
        ],
        'dashboards': ['asset_libraries', 'collaboration_boards', 'content_pipelines'],
        'modules': _with_base_modules('asset_libraries', 'collaboration_boards', 'content_pipelines', 'review_cycles'),
        'rbac': {'admin': ['overview', 'assets', 'boards', 'pipeline'], 'manager': ['overview', 'assets', 'pipeline'], 'contributor': ['assets', 'boards'], 'viewer': ['overview']},
    },
    'consulting': {
        'label': 'Consulting',
        'industry_label': 'Consulting',
        'template_key': 'consulting-core',
        'branches': [
            {'key': 'business_strategy', 'label': 'Business Strategy', 'children': ['Client Engagements', 'Reports', 'Deliverables']},
            {'key': 'it_consulting', 'label': 'IT Consulting', 'children': ['Client Engagements', 'Reports', 'Deliverables']},
            {'key': 'hr_advisory', 'label': 'HR Advisory', 'children': ['Client Engagements', 'Reports', 'Deliverables']},
        ],
        'dashboards': ['proposal_management', 'client_portals', 'analytics'],
        'modules': _with_base_modules('proposal_management', 'client_portals', 'analytics', 'deliverable_tracking'),
        'rbac': {'admin': ['overview', 'proposals', 'clients', 'analytics'], 'manager': ['overview', 'clients', 'analytics'], 'contributor': ['proposals', 'clients'], 'viewer': ['overview']},
    },
    'research': {
        'label': 'Research',
        'industry_label': 'Research',
        'template_key': 'research-core',
        'branches': [
            {'key': 'scientific_research', 'label': 'Scientific Research', 'children': ['Field Studies', 'Analysis', 'Publications']},
            {'key': 'market_research', 'label': 'Market Research', 'children': ['Data Collection', 'Analysis', 'Reporting']},
            {'key': 'r_and_d', 'label': 'R&D', 'children': ['Experiments', 'Prototyping', 'Documentation']},
        ],
        'dashboards': ['Research Pipelines', 'Data Repositories', 'Publication Tracking'],
        'modules': _with_base_modules('research_pipelines', 'data_repositories', 'publication_tracking', 'experiment_management'),
        'rbac': {'admin': ['overview', 'research', 'data', 'publications'], 'manager': ['overview', 'research', 'publications'], 'contributor': ['research', 'data'], 'viewer': ['overview']},
    },
    'finance': {
        'label': 'Finance',
        'industry_label': 'Finance',
        'template_key': 'finance-core',
        'branches': [
            {'key': 'banking', 'label': 'Banking', 'children': ['Accounts', 'Transactions', 'Risk Management']},
            {'key': 'investment', 'label': 'Investment', 'children': ['Accounts', 'Transactions', 'Risk Management']},
            {'key': 'insurance', 'label': 'Insurance', 'children': ['Accounts', 'Transactions', 'Risk Management']},
        ],
        'dashboards': ['ledgers', 'payroll', 'compliance_modules'],
        'modules': _with_base_modules('finance', 'compliance', 'ledgers', 'payroll', 'risk_management'),
        'rbac': {'admin': ['overview', 'ledgers', 'payroll', 'compliance'], 'manager': ['overview', 'ledgers', 'compliance'], 'contributor': ['ledgers', 'payroll'], 'viewer': ['overview']},
    },
    'healthcare': {
        'label': 'Healthcare',
        'industry_label': 'Healthcare',
        'template_key': 'healthcare-core',
        'branches': [
            {'key': 'hospital', 'label': 'Hospital', 'children': ['Cardiology', 'Pediatrics', 'Radiology']},
            {'key': 'clinic', 'label': 'Clinic', 'children': ['Cardiology', 'Pediatrics', 'Radiology']},
            {'key': 'pharmacy', 'label': 'Pharmacy', 'children': ['Dispensing', 'Inventory', 'Billing']},
            {'key': 'laboratory', 'label': 'Laboratory', 'children': ['Diagnostics', 'Radiology', 'Billing']},
        ],
        'dashboards': ['patient_records', 'scheduling', 'billing'],
        'modules': _with_base_modules('patient_records', 'scheduling', 'billing', 'clinical_operations'),
        'rbac': {'admin': ['overview', 'patients', 'scheduling', 'billing'], 'manager': ['overview', 'scheduling', 'billing'], 'contributor': ['patients', 'scheduling'], 'viewer': ['overview']},
    },
    'education': {
        'label': 'Education',
        'industry_label': 'Education',
        'template_key': 'education-core',
        'branches': [
            {'key': 'school', 'label': 'School', 'children': ['Faculties', 'Departments', 'Offices']},
            {'key': 'college', 'label': 'College', 'children': ['Faculties', 'Departments', 'Offices']},
            {'key': 'university', 'label': 'University', 'children': ['Faculties', 'Departments', 'Offices']},
            {'key': 'training_center', 'label': 'Training Center', 'children': ['Faculties', 'Departments', 'Offices']},
        ],
        'dashboards': ['course_management', 'student_records', 'faculty_administration'],
        'modules': _with_base_modules('course_management', 'student_records', 'faculty_administration', 'curriculum_planning'),
        'rbac': {'admin': ['overview', 'courses', 'students', 'faculty'], 'manager': ['overview', 'courses', 'faculty'], 'contributor': ['courses', 'students'], 'viewer': ['overview']},
    },
    'accounting': {
        'label': 'Accounting',
        'industry_label': 'Accounting',
        'template_key': 'accounting-core',
        'branches': [
            {'key': 'corporate_accounting', 'label': 'Corporate Accounting', 'children': ['Ledger', 'Payroll', 'Compliance']},
            {'key': 'sme_accounting', 'label': 'SME Accounting', 'children': ['Ledger', 'Payroll', 'Compliance']},
            {'key': 'auditing', 'label': 'Auditing', 'children': ['Ledger', 'Payroll', 'Compliance']},
            {'key': 'taxation', 'label': 'Taxation', 'children': ['Ledger', 'Payroll', 'Compliance']},
        ],
        'dashboards': ['financial_statements', 'audit_trails', 'reporting_tools'],
        'modules': _with_base_modules('finance', 'compliance', 'financial_statements', 'audit_trails', 'reporting_tools'),
        'rbac': {'admin': ['overview', 'statements', 'audit', 'reporting'], 'manager': ['overview', 'statements', 'reporting'], 'contributor': ['statements', 'audit'], 'viewer': ['overview']},
    },
    'media_entertainment': {
        'label': 'Media/Entertainment',
        'industry_label': 'Media/Entertainment',
        'template_key': 'media-entertainment-core',
        'branches': [
            {'key': 'film', 'label': 'Film', 'children': ['Production', 'Editing', 'Distribution']},
            {'key': 'music', 'label': 'Music', 'children': ['Production', 'Editing', 'Distribution']},
            {'key': 'digital_media', 'label': 'Digital Media', 'children': ['Production', 'Editing', 'Distribution']},
            {'key': 'publishing', 'label': 'Publishing', 'children': ['Production', 'Editing', 'Distribution']},
        ],
        'dashboards': ['project_timelines', 'asset_management', 'marketing_tools'],
        'modules': _with_base_modules('project_timelines', 'asset_management', 'marketing_tools', 'distribution_ops'),
        'rbac': {'admin': ['overview', 'projects', 'assets', 'marketing'], 'manager': ['overview', 'projects', 'marketing'], 'contributor': ['projects', 'assets'], 'viewer': ['overview']},
    },
    'construction': {
        'label': 'Construction',
        'industry_label': 'Construction',
        'template_key': 'construction-core',
        'branches': [
            {'key': 'residential', 'label': 'Residential', 'children': ['Projects', 'Sites', 'Teams']},
            {'key': 'commercial', 'label': 'Commercial', 'children': ['Projects', 'Sites', 'Teams']},
            {'key': 'infrastructure', 'label': 'Infrastructure', 'children': ['Projects', 'Sites', 'Teams']},
        ],
        'dashboards': ['resource_allocation', 'site_management', 'safety_compliance'],
        'modules': _with_base_modules('resource_allocation', 'site_management', 'safety_compliance', 'project_controls'),
        'rbac': {'admin': ['overview', 'resources', 'sites', 'safety'], 'manager': ['overview', 'resources', 'sites'], 'contributor': ['sites', 'resources'], 'viewer': ['overview']},
    },
    'engineering': {
        'label': 'Engineering',
        'industry_label': 'Engineering',
        'template_key': 'engineering-core',
        'branches': [
            {'key': 'civil_engineering', 'label': 'Civil Engineering', 'children': ['Design', 'Projects', 'Field Ops']},
            {'key': 'mechanical_engineering', 'label': 'Mechanical Engineering', 'children': ['Design', 'Projects', 'Field Ops']},
            {'key': 'electrical_engineering', 'label': 'Electrical Engineering', 'children': ['Design', 'Projects', 'Field Ops']},
        ],
        'dashboards': ['project_tracking', 'resource_planning', 'compliance_tracking'],
        'modules': _with_base_modules('project_tracking', 'resource_planning', 'compliance_tracking', 'design_reviews'),
        'rbac': {'admin': ['overview', 'projects', 'resources', 'compliance'], 'manager': ['overview', 'projects', 'resources'], 'contributor': ['projects', 'design_reviews'], 'viewer': ['overview']},
    },
}


def get_workspace_type_definition(workspace_type):
    if not workspace_type:
        return None
    definition = WORKSPACE_TYPE_REGISTRY.get(str(workspace_type).strip())
    return deepcopy(definition) if definition else None
