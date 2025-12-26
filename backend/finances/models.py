from django.db import models
from django.contrib.auth.models import User
from django.core.validators import URLValidator

# Role constants
ROLE_ORG_OWNER = 'ORG_OWNER'
ROLE_CFO = 'CFO'
ROLE_FINANCE_ANALYST = 'FINANCE_ANALYST'
ROLE_VIEWER = 'VIEWER'
ROLE_EXTERNAL_ADVISOR = 'EXTERNAL_ADVISOR'

ROLE_CHOICES = [
    (ROLE_ORG_OWNER, 'Organization Owner'),
    (ROLE_CFO, 'Chief Financial Officer'),
    (ROLE_FINANCE_ANALYST, 'Finance Analyst'),
    (ROLE_VIEWER, 'Viewer'),
    (ROLE_EXTERNAL_ADVISOR, 'External Advisor'),
]

# Account type constants
ACCOUNT_TYPE_PERSONAL = 'personal'
ACCOUNT_TYPE_ENTERPRISE = 'enterprise'

ACCOUNT_TYPE_CHOICES = [
    (ACCOUNT_TYPE_PERSONAL, 'Personal'),
    (ACCOUNT_TYPE_ENTERPRISE, 'Enterprise'),
]


class UserProfile(models.Model):
    """Extended user profile with account type and preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPE_CHOICES,
        default=ACCOUNT_TYPE_PERSONAL
    )
    country = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar_color = models.CharField(max_length=7, default='#667eea')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} ({self.get_account_type_display()})"


class Organization(models.Model):
    """Organization model for enterprise accounts"""
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_organizations')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    employee_count = models.IntegerField(default=1)
    primary_currency = models.CharField(max_length=3, default='USD')
    primary_country = models.CharField(max_length=100)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('owner', 'slug')
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Entity(models.Model):
    """Legal/business entity within an organization"""
    ENTITY_TYPE_CHOICES = [
        ('sole_proprietor', 'Sole Proprietor'),
        ('llc', 'LLC'),
        ('partnership', 'Partnership'),
        ('corporation', 'Corporation'),
        ('nonprofit', 'Nonprofit'),
        ('subsidiary', 'Subsidiary'),
        ('branch', 'Branch'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('dormant', 'Dormant'),
        ('wind_down', 'In Wind-down'),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='entities')
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=50, choices=ENTITY_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    registration_number = models.CharField(max_length=100, blank=True)
    local_currency = models.CharField(max_length=3, default='USD')
    main_bank = models.CharField(max_length=255, blank=True)
    tax_authority_url = models.URLField(blank=True)
    fiscal_year_end = models.DateField(null=True, blank=True)
    next_filing_date = models.DateField(null=True, blank=True)
    parent_entity = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='child_entities'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('organization', 'name', 'country')
        ordering = ['country', 'name']

    def __str__(self):
        return f"{self.name} ({self.country})"

    def create_default_structure(self):
        """Create default departments, roles, and categories for new entity"""
        from django.utils import timezone

        # Default departments
        default_departments = [
            {'name': 'Human Resources', 'code': f'HR_{self.id}', 'description': 'Human Resources and Personnel Management'},
            {'name': 'Finance', 'code': f'FIN_{self.id}', 'description': 'Financial Operations and Accounting'},
            {'name': 'Operations', 'code': f'OPS_{self.id}', 'description': 'Business Operations'},
            {'name': 'IT', 'code': f'IT_{self.id}', 'description': 'Information Technology'},
            {'name': 'Legal', 'code': f'LEGAL_{self.id}', 'description': 'Legal and Compliance'},
        ]

        departments = {}
        for dept_data in default_departments:
            dept, created = EntityDepartment.objects.get_or_create(
                entity=self,
                code=dept_data['code'],
                defaults=dept_data
            )
            departments[dept_data['name']] = dept

        # Default roles
        default_roles = [
            {'name': 'CEO', 'code': f'CEO_{self.id}', 'department': departments.get('Operations'), 'description': 'Chief Executive Officer'},
            {'name': 'CFO', 'code': f'CFO_{self.id}', 'department': departments.get('Finance'), 'description': 'Chief Financial Officer'},
            {'name': 'HR Manager', 'code': f'HRM_{self.id}', 'department': departments.get('Human Resources'), 'description': 'Human Resources Manager'},
            {'name': 'Finance Manager', 'code': f'FM_{self.id}', 'department': departments.get('Finance'), 'description': 'Finance Manager'},
            {'name': 'Operations Manager', 'code': f'OM_{self.id}', 'department': departments.get('Operations'), 'description': 'Operations Manager'},
            {'name': 'IT Manager', 'code': f'ITM_{self.id}', 'department': departments.get('IT'), 'description': 'IT Manager'},
            {'name': 'Accountant', 'code': f'ACC_{self.id}', 'department': departments.get('Finance'), 'description': 'Accountant'},
            {'name': 'HR Assistant', 'code': f'HRA_{self.id}', 'department': departments.get('Human Resources'), 'description': 'HR Assistant'},
        ]

        roles = {}
        for role_data in default_roles:
            role, created = EntityRole.objects.get_or_create(
                entity=self,
                code=role_data['code'],
                defaults=role_data
            )
            roles[role_data['name']] = role

        # Default expense categories
        default_expense_categories = [
            'Office Supplies', 'Travel', 'Marketing', 'Utilities', 'Rent', 'Insurance',
            'Professional Services', 'Equipment', 'Software', 'Training', 'Meals', 'Transportation'
        ]

        # Create empty budgets for each category
        for category in default_expense_categories:
            Budget.objects.get_or_create(
                entity=self,
                category=category,
                defaults={
                    'limit': 0,
                    'currency': self.local_currency,
                }
            )

        # Default income categories/sources
        default_income_sources = [
            'Product Sales', 'Service Revenue', 'Consulting', 'Investment Income', 'Grants', 'Other'
        ]

        # Create sample income records (empty)
        for source in default_income_sources:
            Income.objects.get_or_create(
                entity=self,
                source=source,
                date=timezone.now().date(),
                defaults={
                    'amount': 0,
                    'currency': self.local_currency,
                    'income_type': 'business'
                }
            )

        # Create default bookkeeping categories
        default_income_categories = [
            'Sales Revenue', 'Service Fees', 'Retainers', 'Investment Income',
            'Loan Repayments', 'Miscellaneous Income'
        ]
        
        default_expense_categories_bookkeeping = [
            'Staff Salaries', 'Contractor Payments', 'Rent', 'Utilities',
            'Car/Vehicle Expenses', 'Shipments & Logistics', 'Software Subscriptions',
            'Taxes', 'Insurance', 'Legal Fees', 'Marketing', 'Asset Purchases'
        ]
        
        for cat_name in default_income_categories:
            BookkeepingCategory.objects.get_or_create(
                entity=self,
                name=cat_name,
                type='income',
                defaults={'is_default': True}
            )
        
        for cat_name in default_expense_categories_bookkeeping:
            BookkeepingCategory.objects.get_or_create(
                entity=self,
                name=cat_name,
                type='expense',
                defaults={'is_default': True}
            )
        
        # Create default bookkeeping account
        BookkeepingAccount.objects.get_or_create(
            entity=self,
            name=f"{self.main_bank or 'Main Account'}",
            defaults={
                'type': 'bank',
                'balance': 0,
                'currency': self.local_currency,
                'is_active': True
            }
        )

        return {
            'departments': departments,
            'roles': roles,
            'expense_categories': default_expense_categories,
            'income_sources': default_income_sources,
            'bookkeeping_setup': True
        }


class EntityDepartment(models.Model):
    """Departments within an entity"""
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    head_of_department = models.ForeignKey('EntityStaff', on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments')
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('entity', 'code')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.entity.name}"


class BankAccount(models.Model):
    """Bank accounts for entities"""
    ACCOUNT_TYPE_CHOICES = [
        ('checking', 'Checking'),
        ('savings', 'Savings'),
        ('business', 'Business'),
        ('investment', 'Investment'),
    ]

    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='bank_accounts')
    account_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=100)  # Masked for security
    bank_name = models.CharField(max_length=255)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, default='checking')
    currency = models.CharField(max_length=3, default='USD')
    iban = models.CharField(max_length=34, blank=True)
    swift_code = models.CharField(max_length=11, blank=True)
    routing_number = models.CharField(max_length=9, blank=True)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    available_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    last_synced = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['bank_name', 'account_name']

    def __str__(self):
        return f"{self.account_name} - {self.bank_name} ({self.entity.name})"


class Wallet(models.Model):
    """Digital/cash wallets for entities"""
    WALLET_TYPE_CHOICES = [
        ('cash', 'Cash'),
        ('digital', 'Digital Wallet'),
        ('crypto', 'Cryptocurrency'),
        ('petty_cash', 'Petty Cash'),
    ]

    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='wallets')
    name = models.CharField(max_length=255)
    wallet_type = models.CharField(max_length=20, choices=WALLET_TYPE_CHOICES, default='cash')
    currency = models.CharField(max_length=3, default='USD')
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    provider = models.CharField(max_length=255, blank=True)  # e.g., PayPal, Venmo, Cash App
    account_id = models.CharField(max_length=255, blank=True)  # Masked account/wallet ID
    is_active = models.BooleanField(default=True)
    last_synced = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['wallet_type', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_wallet_type_display()}) - {self.entity.name}"


class ComplianceDocument(models.Model):
    """Legal and compliance documents with expiry tracking"""
    DOCUMENT_TYPE_CHOICES = [
        ('license', 'Business License'),
        ('registration', 'Company Registration'),
        ('tax_certificate', 'Tax Certificate'),
        ('insurance', 'Insurance Policy'),
        ('permit', 'Permit'),
        ('contract', 'Contract'),
        ('certificate', 'Certificate'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('expiring_soon', 'Expiring Soon'),
        ('renewed', 'Renewed'),
    ]

    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='compliance_documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    document_number = models.CharField(max_length=100, blank=True)
    issuing_authority = models.CharField(max_length=255)
    issue_date = models.DateField()
    expiry_date = models.DateField()
    renewal_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    file_path = models.FileField(upload_to='compliance_documents/', null=True, blank=True)
    notes = models.TextField(blank=True)
    reminder_days = models.IntegerField(default=30)  # Days before expiry to send reminder
    responsible_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='compliance_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['expiry_date']

    def __str__(self):
        return f"{self.title} - {self.entity.name} ({self.expiry_date})"

    @property
    def days_until_expiry(self):
        from django.utils import timezone
        if self.expiry_date:
            return (self.expiry_date - timezone.now().date()).days
        return None

    @property
    def is_expiring_soon(self):
        days = self.days_until_expiry
        return days is not None and days <= self.reminder_days


class Permission(models.Model):
    """Define granular permissions for roles"""
    PERMISSION_CHOICES = [
        # Org-level permissions
        ('view_org_overview', 'View Organization Overview'),
        ('manage_org_settings', 'Manage Organization Settings'),
        ('manage_billing', 'Manage Billing'),
        
        # Entity permissions
        ('view_entities', 'View Entities'),
        ('create_entity', 'Create Entity'),
        ('edit_entity', 'Edit Entity'),
        ('delete_entity', 'Delete Entity'),
        
        # Tax & Compliance
        ('view_tax_compliance', 'View Tax Compliance'),
        ('edit_tax_compliance', 'Edit Tax Compliance'),
        ('export_tax_reports', 'Export Tax Reports'),
        
        # Cashflow & Treasury
        ('view_cashflow', 'View Cashflow'),
        ('edit_cashflow', 'Edit Cashflow'),
        
        # Risk & Exposure
        ('view_risk_exposure', 'View Risk Exposure'),
        ('edit_risk_exposure', 'Edit Risk Exposure'),
        
        # Reports
        ('view_reports', 'View Reports'),
        ('generate_reports', 'Generate Reports'),
        ('export_reports', 'Export Reports'),
        
        # Team
        ('view_team', 'View Team Members'),
        ('manage_team', 'Manage Team Members'),
        ('assign_roles', 'Assign Roles'),
    ]

    code = models.CharField(max_length=100, choices=PERMISSION_CHOICES, unique=True)

    def __str__(self):
        return self.get_code_display()


class EntityRole(models.Model):
    """Roles within an entity"""
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='roles')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    department = models.ForeignKey(EntityDepartment, on_delete=models.SET_NULL, null=True, blank=True, related_name='roles')
    description = models.TextField(blank=True)
    salary_range_min = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    salary_range_max = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    permissions = models.ManyToManyField(Permission, blank=True, related_name='entity_roles')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('entity', 'code')
        ordering = ['department__name', 'name']

    def __str__(self):
        return f"{self.name} - {self.entity.name}"


class EntityStaff(models.Model):
    """Staff profiles within an entity"""
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('consultant', 'Consultant'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('terminated', 'Terminated'),
        ('on_leave', 'On Leave'),
    ]

    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='staff')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='entity_staff_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    department = models.ForeignKey(EntityDepartment, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff')
    role = models.ForeignKey(EntityRole, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff')
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='full_time')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    hire_date = models.DateField()
    termination_date = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='direct_reports')
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.entity.name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Role(models.Model):
    """Define roles with bundled permissions"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, related_name='roles')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.get_code_display()

    @staticmethod
    def get_or_create_default_roles():
        """Create or fetch default roles with permissions"""
        permissions_dict = {p[0]: Permission.objects.get_or_create(code=p[0])[0] for p in Permission.PERMISSION_CHOICES}
        
        # ORG_OWNER: All permissions
        owner_role, _ = Role.objects.get_or_create(
            code=ROLE_ORG_OWNER,
            defaults={'name': 'Organization Owner', 'description': 'Full access to organization'}
        )
        owner_role.permissions.set(Permission.objects.all())
        
        # CFO: All except billing
        cfo_role, _ = Role.objects.get_or_create(
            code=ROLE_CFO,
            defaults={'name': 'Chief Financial Officer', 'description': 'Full financial and tax access'}
        )
        cfo_perms = [p for code, p in permissions_dict.items() if 'manage_billing' not in code]
        cfo_role.permissions.set(cfo_perms)
        
        # FINANCE_ANALYST: View and edit data, no org-level settings
        analyst_role, _ = Role.objects.get_or_create(
            code=ROLE_FINANCE_ANALYST,
            defaults={'name': 'Finance Analyst', 'description': 'View and edit financial data'}
        )
        analyst_perms = [
            permissions_dict.get('view_org_overview'),
            permissions_dict.get('view_entities'),
            permissions_dict.get('create_entity'),
            permissions_dict.get('edit_entity'),
            permissions_dict.get('view_tax_compliance'),
            permissions_dict.get('edit_tax_compliance'),
            permissions_dict.get('view_cashflow'),
            permissions_dict.get('edit_cashflow'),
            permissions_dict.get('view_risk_exposure'),
            permissions_dict.get('view_reports'),
            permissions_dict.get('generate_reports'),
        ]
        analyst_role.permissions.set([p for p in analyst_perms if p])
        
        # VIEWER: Read-only access
        viewer_role, _ = Role.objects.get_or_create(
            code=ROLE_VIEWER,
            defaults={'name': 'Viewer', 'description': 'Read-only access to reports and dashboards'}
        )
        viewer_perms = [
            permissions_dict.get('view_org_overview'),
            permissions_dict.get('view_entities'),
            permissions_dict.get('view_tax_compliance'),
            permissions_dict.get('view_cashflow'),
            permissions_dict.get('view_risk_exposure'),
            permissions_dict.get('view_reports'),
        ]
        viewer_role.permissions.set([p for p in viewer_perms if p])
        
        # EXTERNAL_ADVISOR: Scoped access
        advisor_role, _ = Role.objects.get_or_create(
            code=ROLE_EXTERNAL_ADVISOR,
            defaults={'name': 'External Advisor', 'description': 'Limited scoped access'}
        )
        advisor_perms = [
            permissions_dict.get('view_tax_compliance'),
            permissions_dict.get('view_reports'),
        ]
        advisor_role.permissions.set([p for p in advisor_perms if p])
        
        return {
            ROLE_ORG_OWNER: owner_role,
            ROLE_CFO: cfo_role,
            ROLE_FINANCE_ANALYST: analyst_role,
            ROLE_VIEWER: viewer_role,
            ROLE_EXTERNAL_ADVISOR: advisor_role,
        }


class TeamMember(models.Model):
    """Team members in an organization"""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='team_members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organization_roles')
    role = models.ForeignKey(Role, on_delete=models.PROTECT)
    # Scope: if external advisor, can limit to specific entities
    scoped_entities = models.ManyToManyField(Entity, blank=True, help_text="Leave empty for full access")
    is_active = models.BooleanField(default=True)
    invited_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('organization', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.role.name} @ {self.organization.name}"


class Expense(models.Model):
    """Model for tracking expenses (personal or entity-specific)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='personal_expenses', null=True, blank=True)
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='expenses', null=True, blank=True)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    category = models.CharField(max_length=100)
    date = models.DateField()
    currency = models.CharField(max_length=3, default='USD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        scope = f"Entity: {self.entity}" if self.entity else f"User: {self.user}"
        return f"{self.description} - ${self.amount} ({self.category}) [{scope}]"


class Income(models.Model):
    """Model for tracking income (personal or entity-specific)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='personal_income', null=True, blank=True)
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='income', null=True, blank=True)
    source = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField()
    income_type = models.CharField(max_length=50, default='salary')  # salary, investment, business, etc.
    currency = models.CharField(max_length=3, default='USD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        scope = f"Entity: {self.entity}" if self.entity else f"User: {self.user}"
        return f"{self.source} - ${self.amount} [{scope}]"


class Budget(models.Model):
    """Model for tracking budgets by category"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='personal_budgets', null=True, blank=True)
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='budgets', null=True, blank=True)
    category = models.CharField(max_length=100)
    limit = models.DecimalField(max_digits=15, decimal_places=2)
    spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    color = models.CharField(max_length=7, default='#3498db')  # Hex color code
    currency = models.CharField(max_length=3, default='USD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-category']

    def __str__(self):
        scope = f"Entity: {self.entity}" if self.entity else f"User: {self.user}"
        return f"{self.category} - ${self.spent}/${self.limit} [{scope}]"

    @property
    def percentage_used(self):
        """Calculate percentage of budget used"""
        if self.limit > 0:
            return (self.spent / self.limit) * 100
        return 0

    @property
    def remaining(self):
        """Calculate remaining budget"""
        return self.limit - self.spent


class TaxExposure(models.Model):
    """Track tax obligations per entity, country, period"""
    PERIOD_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annual', 'Annual'),
    ]

    STATUS_CHOICES = [
        ('estimated', 'Estimated'),
        ('ready', 'Ready to File'),
        ('filed', 'Filed'),
        ('paid', 'Paid'),
    ]

    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='tax_exposures')
    country = models.CharField(max_length=100)
    tax_type = models.CharField(max_length=100)  # e.g., "Corporate Income Tax", "VAT"
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    tax_year = models.IntegerField()
    period_start = models.DateField()
    period_end = models.DateField()
    estimated_amount = models.DecimalField(max_digits=15, decimal_places=2)
    actual_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='estimated')
    filing_deadline = models.DateField()
    payment_deadline = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('entity', 'country', 'tax_type', 'tax_year', 'period')
        ordering = ['filing_deadline']

    def __str__(self):
        return f"{self.tax_type} - {self.country} ({self.period_start} to {self.period_end})"


class ComplianceDeadline(models.Model):
    """Track compliance deadlines for entities"""
    DEADLINE_TYPE_CHOICES = [
        ('tax_filing', 'Tax Filing'),
        ('vat_filing', 'VAT Filing'),
        ('payroll', 'Payroll Filing'),
        ('audit', 'Audit'),
        ('renewal', 'License/Registration Renewal'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('due_soon', 'Due Soon'),
        ('overdue', 'Overdue'),
        ('completed', 'Completed'),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='compliance_deadlines')
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='compliance_deadlines')
    title = models.CharField(max_length=255)
    deadline_type = models.CharField(max_length=50, choices=DEADLINE_TYPE_CHOICES)
    deadline_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    description = models.TextField(blank=True)
    responsible_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    completed_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['deadline_date']

    def __str__(self):
        return f"{self.title} - {self.entity.name} ({self.deadline_date})"


class CashflowForecast(models.Model):
    """Cashflow forecasting and tracking"""
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='cashflow_forecasts')
    month = models.DateField()  # First day of month
    category = models.CharField(max_length=100)  # e.g., "Income", "Expenses", "Tax Payments", "Payroll"
    forecasted_amount = models.DecimalField(max_digits=15, decimal_places=2)
    actual_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('entity', 'month', 'category')
        ordering = ['-month']

    def __str__(self):
        return f"{self.entity.name} - {self.category} ({self.month})"


class AuditLog(models.Model):
    """Track all changes for compliance and audit purposes"""
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('view', 'View'),
        ('export', 'Export'),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='audit_logs')
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, null=True, blank=True, related_name='audit_logs')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)  # Model that was changed
    object_id = models.CharField(max_length=100)
    changes = models.JSONField(default=dict)  # Track what changed
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        scope = f"Entity: {self.entity.name}" if self.entity else f"Organization: {self.organization.name}"
        return f"{self.action} {self.model_name} by {self.user} on {self.created_at} [{scope}]"


# ===== FINANCIAL MODELING MODELS =====

class ModelTemplate(models.Model):
    """Pre-defined financial model templates"""
    TEMPLATE_TYPES = [
        ('dcf', 'Discounted Cash Flow'),
        ('comparable', 'Comparable Companies'),
        ('merger', 'Merger & Acquisition'),
        ('lbo', 'Leveraged Buyout'),
        ('real_estate', 'Real Estate'),
        ('venture', 'Venture Capital'),
        ('distressed', 'Distressed Assets'),
    ]

    name = models.CharField(max_length=255)
    template_type = models.CharField(max_length=50, choices=TEMPLATE_TYPES)
    description = models.TextField()
    industry = models.CharField(max_length=100, blank=True)
    version = models.CharField(max_length=20, default='1.0')
    is_active = models.BooleanField(default=True)
    default_assumptions = models.JSONField(default=dict)
    calculation_logic = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"


class FinancialModel(models.Model):
    """Core financial model instance"""
    MODEL_TYPES = [
        ('dcf', 'DCF'),
        ('comparable', 'Comparable'),
        ('merger', 'Merger'),
        ('lbo', 'LBO'),
        ('real_estate', 'Real Estate'),
        ('venture', 'Venture'),
        ('distressed', 'Distressed'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('calculating', 'Calculating'),
        ('completed', 'Completed'),
        ('error', 'Error'),
    ]

    # Basic info
    name = models.CharField(max_length=255)
    model_type = models.CharField(max_length=50, choices=MODEL_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    # Relationships
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='financial_models')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True)
    template = models.ForeignKey(ModelTemplate, on_delete=models.SET_NULL, null=True, blank=True)

    # Model data
    input_data = models.JSONField(default=dict)
    assumptions = models.JSONField(default=dict)
    results = models.JSONField(default=dict)
    metadata = models.JSONField(default=dict)

    # Financial metrics
    enterprise_value = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    equity_value = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    irr = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    moic = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    calculated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} ({self.get_model_type_display()})"


class Scenario(models.Model):
    """Scenario analysis for financial models"""
    SCENARIO_TYPES = [
        ('best', 'Best Case'),
        ('base', 'Base Case'),
        ('worst', 'Worst Case'),
        ('custom', 'Custom'),
    ]

    name = models.CharField(max_length=255)
    scenario_type = models.CharField(max_length=20, choices=SCENARIO_TYPES)
    financial_model = models.ForeignKey(FinancialModel, on_delete=models.CASCADE, related_name='scenarios')

    # Scenario parameters
    assumptions_override = models.JSONField(default=dict)
    results = models.JSONField(default=dict)

    # Key metrics
    enterprise_value = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    irr = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    probability = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.financial_model.name}"


class SensitivityAnalysis(models.Model):
    """Sensitivity analysis for key variables"""
    financial_model = models.ForeignKey(FinancialModel, on_delete=models.CASCADE, related_name='sensitivity_analyses')

    variable_name = models.CharField(max_length=100)
    base_value = models.DecimalField(max_digits=15, decimal_places=4)
    range_min = models.DecimalField(max_digits=15, decimal_places=4)
    range_max = models.DecimalField(max_digits=15, decimal_places=4)
    steps = models.IntegerField(default=10)

    results = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sensitivity: {self.variable_name} - {self.financial_model.name}"


class AIInsight(models.Model):
    """AI-generated insights and recommendations"""
    INSIGHT_TYPES = [
        ('pattern', 'Pattern Recognition'),
        ('anomaly', 'Anomaly Detection'),
        ('trend', 'Trend Analysis'),
        ('benchmark', 'Benchmarking'),
        ('recommendation', 'Recommendation'),
        ('risk', 'Risk Assessment'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    financial_model = models.ForeignKey(FinancialModel, on_delete=models.CASCADE, related_name='ai_insights')
    insight_type = models.CharField(max_length=50, choices=INSIGHT_TYPES)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')

    title = models.CharField(max_length=255)
    description = models.TextField()
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    supporting_data = models.JSONField(default=dict)
    recommendations = models.JSONField(default=dict)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_insight_type_display()}: {self.title}"


class CustomKPI(models.Model):
    """Custom Key Performance Indicators"""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='custom_kpis')
    name = models.CharField(max_length=255)
    formula = models.TextField()  # Formula expression
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=50, blank=True)
    target_value = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.organization.name})"


class KPICalculation(models.Model):
    """Calculated KPI values over time"""
    kpi = models.ForeignKey(CustomKPI, on_delete=models.CASCADE, related_name='calculations')
    financial_model = models.ForeignKey(FinancialModel, on_delete=models.CASCADE, related_name='kpi_calculations')

    value = models.DecimalField(max_digits=15, decimal_places=4)
    status = models.CharField(max_length=20, choices=[
        ('on_target', 'On Target'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
        ('normal', 'Normal'),
    ], default='normal')

    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-calculated_at']

    def __str__(self):
        return f"{self.kpi.name}: {self.value}"


class Report(models.Model):
    """Generated financial reports"""
    REPORT_TYPES = [
        ('executive', 'Executive Summary'),
        ('detailed', 'Detailed Analysis'),
        ('scenario', 'Scenario Analysis'),
        ('compliance', 'Compliance Report'),
        ('valuation', 'Valuation Report'),
        ('custom', 'Custom Report'),
    ]

    EXPORT_FORMATS = [
        ('pdf', 'PDF'),
        ('html', 'HTML'),
        ('json', 'JSON'),
        ('csv', 'CSV'),
        ('xlsx', 'Excel'),
    ]

    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    financial_model = models.ForeignKey(FinancialModel, on_delete=models.CASCADE, related_name='reports')

    # Report content
    content = models.JSONField(default=dict)
    summary = models.TextField(blank=True)
    recommendations = models.JSONField(default=dict)

    # Export options
    export_format = models.CharField(max_length=10, choices=EXPORT_FORMATS, default='pdf')
    file_path = models.FileField(upload_to='reports/', null=True, blank=True)

    # Metadata
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    is_public = models.BooleanField(default=False)
    version = models.CharField(max_length=20, default='1.0')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_report_type_display()})"


class Consolidation(models.Model):
    """Multi-entity financial consolidation"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('error', 'Error'),
    ]

    name = models.CharField(max_length=255)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='consolidations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    # Consolidation parameters
    consolidation_date = models.DateField()
    reporting_currency = models.CharField(max_length=3, default='USD')
    include_minority_interest = models.BooleanField(default=True)
    eliminate_intercompany = models.BooleanField(default=True)

    # Results
    consolidated_pnl = models.JSONField(default=dict)
    consolidated_balance_sheet = models.JSONField(default=dict)
    consolidated_cashflow = models.JSONField(default=dict)
    adjustments = models.JSONField(default=dict)

    # Key metrics
    total_assets = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    total_liabilities = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    shareholders_equity = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Consolidation: {self.name} ({self.consolidation_date})"


class ConsolidationEntity(models.Model):
    """Entity included in consolidation"""
    consolidation = models.ForeignKey(Consolidation, on_delete=models.CASCADE, related_name='entities')
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE)
    ownership_percentage = models.DecimalField(max_digits=7, decimal_places=4, default=100.0000)
    acquisition_date = models.DateField(null=True, blank=True)
    goodwill = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    # Financial data for consolidation
    pnl_data = models.JSONField(default=dict)
    balance_sheet_data = models.JSONField(default=dict)
    cashflow_data = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.entity.name} ({self.ownership_percentage}%)"


class TaxCalculation(models.Model):
    """Tax calculations for different jurisdictions"""
    CALCULATION_TYPES = [
        ('corporate', 'Corporate Tax'),
        ('personal', 'Personal Income Tax'),
        ('vat', 'Value Added Tax'),
        ('withholding', 'Withholding Tax'),
        ('property', 'Property Tax'),
    ]

    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='tax_calculations')
    tax_year = models.IntegerField()
    calculation_type = models.CharField(max_length=50, choices=CALCULATION_TYPES)
    jurisdiction = models.CharField(max_length=100)

    # Tax calculation inputs
    taxable_income = models.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=7, decimal_places=4)
    deductions = models.JSONField(default=dict)
    credits = models.JSONField(default=dict)

    # Results
    calculated_tax = models.DecimalField(max_digits=15, decimal_places=2)
    effective_rate = models.DecimalField(max_digits=7, decimal_places=4)
    breakdown = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('entity', 'tax_year', 'calculation_type', 'jurisdiction')

    def __str__(self):
        return f"{self.calculation_type} - {self.entity.name} ({self.tax_year})"


# ============================================================================
# WORKFLOW & AUTOMATION MODELS
# ============================================================================


class RecurringTransaction(models.Model):
    """Template for automatically created recurring bookkeeping transactions.

    Used for items like payroll, rent, subscriptions, depreciation journals, etc.
    """

    FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("monthly", "Monthly"),
        ("quarterly", "Quarterly"),
        ("yearly", "Yearly"),
    ]

    # Local copy of transaction type/payment method choices to avoid referencing
    # the Transaction class before it is defined.
    TRANSACTION_TYPE_CHOICES = [
        ("income", "Income"),
        ("expense", "Expense"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("bank", "Bank Transfer"),
        ("wallet", "Wallet"),
        ("cash", "Cash"),
        ("card", "Card Payment"),
        ("cheque", "Cheque"),
        ("other", "Other"),
    ]

    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name="recurring_transactions")
    account = models.ForeignKey('BookkeepingAccount', on_delete=models.PROTECT, related_name="recurring_transactions")
    category = models.ForeignKey('BookkeepingCategory', on_delete=models.PROTECT, related_name="recurring_transactions")

    type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default="bank")
    description = models.TextField()

    staff_member = models.ForeignKey(EntityStaff, on_delete=models.SET_NULL, null=True, blank=True, related_name="recurring_transactions")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="recurring_transactions_created")

    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default="monthly")
    next_run_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    max_occurrences = models.IntegerField(null=True, blank=True)
    occurrences_executed = models.IntegerField(default=0)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_active", "next_run_date"]

    def __str__(self):
        return f"{self.get_frequency_display()} {self.get_type_display()} - {self.entity.name}"

    def _frequency_delta_days(self):
        """Approximate frequency in days (used for simple scheduling)."""
        if self.frequency == "daily":
            return 1
        if self.frequency == "weekly":
            return 7
        if self.frequency == "monthly":
            return 30
        if self.frequency == "quarterly":
            return 90
        if self.frequency == "yearly":
            return 365
        return 30

    def is_due(self, as_of_date=None):
        from datetime import date

        if not self.is_active:
            return False

        today = as_of_date or date.today()
        if self.next_run_date and self.next_run_date > today:
            return False

        if self.end_date and today > self.end_date:
            return False

        if self.max_occurrences is not None and self.occurrences_executed >= self.max_occurrences:
            return False

        return True

    def schedule_next(self):
        from datetime import timedelta, date

        base_date = self.next_run_date or date.today()
        delta_days = self._frequency_delta_days()
        self.next_run_date = base_date + timedelta(days=delta_days)
        self.save(update_fields=["next_run_date"])

    def create_transaction(self, run_date=None):
        """Create a concrete Transaction instance from this template."""
        from datetime import date

        if not self.is_due(run_date):
            return None

        transaction_date = run_date or self.next_run_date or date.today()

        transaction = Transaction.objects.create(
            entity=self.entity,
            type=self.type,
            category=self.category,
            account=self.account,
            amount=self.amount,
            currency=self.currency,
            payment_method=self.payment_method,
            description=self.description,
            reference_number=f"AUTO-{self.id}-{self.occurrences_executed + 1}",
            date=transaction_date,
            staff_member=self.staff_member,
            created_by=self.created_by,
        )

        self.occurrences_executed += 1
        self.save(update_fields=["occurrences_executed"])
        self.schedule_next()
        return transaction


class TaskRequest(models.Model):
    """Queue-based task management for digital office workflows.

    Allows users to submit tasks (e.g. generate statements, run tax calcs,
    import bank feeds) and poll for status instead of waiting in a physical
    queue.
    """

    TASK_TYPE_CHOICES = [
        ("generate_statement", "Generate Financial Statement"),
        ("run_tax_calculation", "Run Tax Calculation"),
        ("import_bank_feed", "Import Bank Feed"),
        ("process_payroll", "Process Payroll"),
        ("custom", "Custom Task"),
    ]

    STATUS_CHOICES = [
        ("queued", "Queued"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("normal", "Normal"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="task_requests")
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, null=True, blank=True, related_name="task_requests")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="task_requests")

    task_type = models.CharField(max_length=50, choices=TASK_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="queued")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="normal")

    payload = models.JSONField(default=dict, blank=True)
    result = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["entity", "status"]),
        ]

    def __str__(self):
        return f"{self.get_task_type_display()} [{self.get_status_display()}]"

    def mark_processing(self):
        from django.utils import timezone

        self.status = "processing"
        self.started_at = timezone.now()
        self.save(update_fields=["status", "started_at"])

    def mark_completed(self, result=None):
        from django.utils import timezone

        self.status = "completed"
        if result is not None:
            self.result = result
        self.completed_at = timezone.now()
        self.error_message = ""
        self.save(update_fields=["status", "result", "completed_at", "error_message"])

    def mark_failed(self, error_message):
        from django.utils import timezone

        self.status = "failed"
        self.error_message = str(error_message)
        self.completed_at = timezone.now()
        self.save(update_fields=["status", "error_message", "completed_at"])


# ============================================================================
# BOOKKEEPING MODULE MODELS
# ============================================================================

class BookkeepingCategory(models.Model):
    """Transaction categories for income and expenses"""
    CATEGORY_TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='bookkeeping_categories')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=CATEGORY_TYPE_CHOICES)
    description = models.TextField(blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['type', 'name']
        unique_together = ('entity', 'name', 'type')
        verbose_name_plural = 'Bookkeeping Categories'
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class BookkeepingAccount(models.Model):
    """Financial accounts for tracking balances"""
    ACCOUNT_TYPE_CHOICES = [
        ('bank', 'Bank Account'),
        ('wallet', 'Wallet'),
        ('cash', 'Cash'),
    ]
    
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='bookkeeping_accounts')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    account_number = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_active', 'type', 'name']
        unique_together = ('entity', 'name')
    
    def __str__(self):
        return f"{self.name} - {self.currency} {self.balance:,.2f}"


class Transaction(models.Model):
    """Core transaction model for bookkeeping"""
    TRANSACTION_TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('bank', 'Bank Transfer'),
        ('wallet', 'Wallet'),
        ('cash', 'Cash'),
        ('card', 'Card Payment'),
        ('cheque', 'Cheque'),
        ('other', 'Other'),
    ]
    
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    category = models.ForeignKey(BookkeepingCategory, on_delete=models.PROTECT, related_name='transactions')
    account = models.ForeignKey(BookkeepingAccount, on_delete=models.PROTECT, related_name='transactions')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    description = models.TextField()
    reference_number = models.CharField(max_length=100, blank=True)
    date = models.DateField()
    attachment_url = models.URLField(blank=True)
    
    # Staff payroll tracking
    staff_member = models.ForeignKey(EntityStaff, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='transactions_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['entity', 'date']),
            models.Index(fields=['entity', 'type']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.currency} {self.amount:,.2f} - {self.description[:50]}"
    
    def save(self, *args, **kwargs):
        """Update account balance on transaction save"""
        is_new = self.pk is None
        old_transaction = None
        
        if not is_new:
            old_transaction = Transaction.objects.get(pk=self.pk)
        
        super().save(*args, **kwargs)
        
        # Update account balance
        if is_new:
            if self.type == 'income':
                self.account.balance += self.amount
            else:  # expense
                self.account.balance -= self.amount
            self.account.save()
        elif old_transaction:
            # Reverse old transaction
            if old_transaction.type == 'income':
                old_transaction.account.balance -= old_transaction.amount
            else:
                old_transaction.account.balance += old_transaction.amount
            old_transaction.account.save()
            
            # Apply new transaction
            if self.type == 'income':
                self.account.balance += self.amount
            else:
                self.account.balance -= self.amount
            self.account.save()
    
    def delete(self, *args, **kwargs):
        """Reverse account balance on transaction delete"""
        if self.type == 'income':
            self.account.balance -= self.amount
        else:
            self.account.balance += self.amount
        self.account.save()
        super().delete(*args, **kwargs)


class BookkeepingAuditLog(models.Model):
    """Audit log for all bookkeeping actions"""
    ACTION_CHOICES = [
        ('create_transaction', 'Created Transaction'),
        ('edit_transaction', 'Edited Transaction'),
        ('delete_transaction', 'Deleted Transaction'),
        ('create_category', 'Created Category'),
        ('edit_category', 'Edited Category'),
        ('delete_category', 'Deleted Category'),
        ('create_account', 'Created Account'),
        ('edit_account', 'Edited Account'),
        ('delete_account', 'Deleted Account'),
    ]
    
    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='bookkeeping_audit_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['entity', 'timestamp']),
            models.Index(fields=['action']),
        ]
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.user} - {self.timestamp}"


class FixedAsset(models.Model):
    """Fixed assets with depreciation tracking"""
    DEPRECIATION_METHODS = [
        ('straight_line', 'Straight-Line'),
        ('declining_balance', 'Declining Balance'),
        ('units_of_production', 'Units of Production'),
    ]

    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='fixed_assets')
    name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=100)  # e.g. "Equipment", "Building"
    purchase_date = models.DateField()
    cost = models.DecimalField(max_digits=15, decimal_places=2)
    salvage_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    useful_life_years = models.IntegerField()  # Useful life in years
    depreciation_method = models.CharField(max_length=20, choices=DEPRECIATION_METHODS, default='straight_line')
    accumulated_depreciation = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    book_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.asset_type}"

    def calculate_depreciation(self):
        """Calculate annual depreciation amount"""
        if self.depreciation_method == 'straight_line':
            return (self.cost - self.salvage_value) / self.useful_life_years
        return 0


class AccrualEntry(models.Model):
    """Accrual entries for expenses/revenues recognized but not yet paid"""
    ACCRUAL_TYPES = [
        ('revenue', 'Revenue Accrual'),
        ('expense', 'Expense Accrual'),
    ]

    entity = models.ForeignKey(Entity, on_delete=models.CASCADE, related_name='accrual_entries')
    accrual_type = models.CharField(max_length=20, choices=ACCRUAL_TYPES)
    description = models.CharField(max_length=255)
    category = models.ForeignKey(BookkeepingCategory, on_delete=models.PROTECT, related_name='accruals')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    accrual_date = models.DateField()
    settlement_date = models.DateField(null=True, blank=True)
    is_settled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-accrual_date']

    def __str__(self):
        return f"{self.get_accrual_type_display()}: {self.description}"
