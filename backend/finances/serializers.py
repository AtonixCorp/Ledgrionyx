from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Expense, Income, Budget, UserProfile, Organization, Entity, Role, Permission,
    TeamMember, TaxExposure, TaxProfile, ComplianceDeadline, CashflowForecast, AuditLog,
    ModelTemplate, FinancialModel, Scenario, SensitivityAnalysis, AIInsight,
    CustomKPI, KPICalculation, Report, Consolidation, ConsolidationEntity,
    TaxCalculation, ACCOUNT_TYPE_PERSONAL, ACCOUNT_TYPE_ENTERPRISE,
    EntityDepartment, EntityRole, EntityStaff, BankAccount, Wallet, ComplianceDocument,
    BookkeepingCategory, BookkeepingAccount, Transaction, BookkeepingAuditLog,
    RecurringTransaction, TaskRequest,
    # Core GL/COA models
    ChartOfAccounts, GeneralLedger, JournalEntry, RecurringJournalTemplate, LedgerPeriod,
    # AR models
    Customer, Invoice, InvoiceLineItem, CreditNote, Payment,
    # AP models
    Vendor, PurchaseOrder, Bill, BillPayment,
    # Inventory models
    InventoryItem, InventoryTransaction, InventoryCostOfGoodsSold,
    # Reconciliation models
    BankReconciliation,
    # Revenue Recognition models
    DeferredRevenue, RevenueRecognitionSchedule,
    # Period Close models
    PeriodCloseChecklist, PeriodCloseItem,
    # FX models
    ExchangeRate, FXGainLoss,
    # Notification models
    Notification, NotificationPreference,
    # NEW MODELS
    Client, ClientPortal, ClientMessage, ClientDocument, DocumentRequest, ApprovalRequest,
    DocumentTemplate, Loan, LoanPayment, KYCProfile, AMLTransaction, FirmService,
    ClientInvoice, ClientInvoiceLineItem, ClientSubscription, WhiteLabelBranding,
    BankingIntegration, BankingTransaction, EmbeddedPayment, AutomationWorkflow,
    AutomationExecution, FirmMetric, ClientMarketplaceIntegration
)


# ============ User & Auth Serializers ============

class UserProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source='user.id')
    email = serializers.ReadOnlyField(source='user.email')
    username = serializers.ReadOnlyField(source='user.username')
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['user_id', 'email', 'username', 'first_name', 'last_name', 'account_type', 'country', 'phone', 'tax_type', 'tax_rate', 'avatar_color', 'created_at']
        read_only_fields = ['created_at']

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name


# ============ Organization Serializers ============

class OrganizationSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source='owner.get_full_name')
    # Backward-compatible aliases (frontend previously used `country`/`currency`)
    country = serializers.CharField(source='primary_country', required=False)
    currency = serializers.CharField(source='primary_currency', required=False)

    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'description', 'logo_url', 'industry', 'employee_count', 'primary_currency', 'primary_country', 'country', 'currency', 'settings', 'website', 'owner_name', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ============ Entity Serializers ============

class EntitySerializer(serializers.ModelSerializer):
    child_entities = serializers.SerializerMethodField()

    class Meta:
        model = Entity
        fields = ['id', 'name', 'country', 'entity_type', 'status', 'registration_number', 'local_currency', 'main_bank', 'tax_authority_url', 'fiscal_year_end', 'next_filing_date', 'parent_entity', 'child_entities', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_child_entities(self, obj):
        children = obj.child_entities.all()
        return EntitySerializer(children, many=True).data


class EntityDetailSerializer(EntitySerializer):
    """Extended serializer with related data"""
    tax_exposures = serializers.SerializerMethodField()
    compliance_deadlines = serializers.SerializerMethodField()

    def get_tax_exposures(self, obj):
        exposures = obj.tax_exposures.all()
        return TaxExposureSerializer(exposures, many=True).data

    def get_compliance_deadlines(self, obj):
        deadlines = obj.compliance_deadlines.all()
        return ComplianceDeadlineSerializer(deadlines, many=True).data


# ============ Permission & Role Serializers ============

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'code', 'get_code_display']
        read_only_fields = ['code']


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        source='permissions',
        many=True,
        write_only=True
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'code', 'description', 'permissions', 'permission_ids', 'created_at']
        read_only_fields = ['created_at', 'code']


# ============ Team Member Serializers ============

class TeamMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    role_name = serializers.ReadOnlyField(source='role.name')
    role_code = serializers.ReadOnlyField(source='role.code')

    class Meta:
        model = TeamMember
        fields = ['id', 'user_email', 'user_name', 'role', 'role_name', 'role_code', 'scoped_entities', 'is_active', 'invited_at', 'accepted_at', 'created_at', 'updated_at']
        read_only_fields = ['invited_at', 'accepted_at', 'created_at', 'updated_at']


# ============ Financial Data Serializers ============

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'user', 'entity', 'description', 'amount', 'category', 'date', 'currency', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id', 'user', 'entity', 'source', 'amount', 'date', 'income_type', 'currency', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class BudgetSerializer(serializers.ModelSerializer):
    percentage_used = serializers.ReadOnlyField()
    remaining = serializers.ReadOnlyField()

    class Meta:
        model = Budget
        fields = ['id', 'user', 'entity', 'category', 'limit', 'spent', 'color', 'currency', 'percentage_used', 'remaining', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ============ Tax & Compliance Serializers ============

class TaxExposureSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxExposure
        fields = ['id', 'entity', 'country', 'tax_type', 'period', 'tax_year', 'period_start', 'period_end', 'estimated_amount', 'actual_amount', 'paid_amount', 'currency', 'status', 'filing_deadline', 'payment_deadline', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ComplianceDeadlineSerializer(serializers.ModelSerializer):
    entity_name = serializers.ReadOnlyField(source='entity.name')
    responsible_user_name = serializers.ReadOnlyField(source='responsible_user.get_full_name')

    class Meta:
        model = ComplianceDeadline
        fields = ['id', 'organization', 'entity', 'entity_name', 'title', 'deadline_type', 'deadline_date', 'status', 'description', 'responsible_user', 'responsible_user_name', 'completed_at', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class CashflowForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashflowForecast
        fields = ['id', 'entity', 'month', 'category', 'forecasted_amount', 'actual_amount', 'currency', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class TaxProfileSerializer(serializers.ModelSerializer):
    entity_name = serializers.ReadOnlyField(source='entity.name')

    class Meta:
        model = TaxProfile
        fields = ['id', 'entity', 'entity_name', 'country', 'status', 'tax_rules', 'auto_update', 'residency_status', 'compliance_score', 'last_rule_update', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')

    class Meta:
        model = AuditLog
        fields = ['id', 'organization', 'user', 'user_name', 'action', 'model_name', 'object_id', 'changes', 'ip_address', 'created_at']
        read_only_fields = ['created_at']


# ============ Dashboard Summary Serializers ============

class OrgOverviewSerializer(serializers.Serializer):
    """Serializer for organization overview dashboard"""
    total_assets = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_liabilities = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_position = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_cash_by_currency = serializers.DictField()
    total_tax_exposure = serializers.DecimalField(max_digits=15, decimal_places=2)
    active_jurisdictions = serializers.IntegerField()
    active_entities = serializers.IntegerField()
    pending_tax_returns = serializers.IntegerField()
    missing_data_entities = serializers.IntegerField()
    tax_exposure_by_country = serializers.DictField()


class EntityHierarchySerializer(serializers.Serializer):
    """Serializer for entity hierarchy visualization"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    country = serializers.CharField()
    entity_type = serializers.CharField()
    status = serializers.CharField()
    children = serializers.SerializerMethodField()

    def get_children(self, obj):
        if hasattr(obj, 'child_entities'):
            return EntityHierarchySerializer(obj.child_entities.all(), many=True).data
        return []


class PersonalDashboardSerializer(serializers.Serializer):
    """Serializer for personal dashboard overview"""
    net_position = serializers.DecimalField(max_digits=15, decimal_places=2)
    monthly_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    monthly_spending = serializers.DecimalField(max_digits=15, decimal_places=2)
    monthly_tax_provision = serializers.DecimalField(max_digits=15, decimal_places=2)
    active_countries = serializers.ListField(child=serializers.CharField())
    pending_insights = serializers.ListField(child=serializers.DictField())
    upcoming_deadlines = serializers.ListField(child=serializers.DictField())


# ============ FINANCIAL MODELING SERIALIZERS ============

class ModelTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelTemplate
        fields = ['id', 'name', 'template_type', 'description', 'industry', 'version', 'is_active', 'default_assumptions', 'calculation_logic', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class FinancialModelSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    organization_name = serializers.ReadOnlyField(source='organization.name')
    template_name = serializers.ReadOnlyField(source='template.name')

    class Meta:
        model = FinancialModel
        fields = ['id', 'name', 'model_type', 'status', 'user', 'user_name', 'organization', 'organization_name', 'template', 'template_name', 'input_data', 'assumptions', 'results', 'metadata', 'enterprise_value', 'equity_value', 'irr', 'moic', 'created_at', 'updated_at', 'calculated_at']
        read_only_fields = ['created_at', 'updated_at', 'calculated_at']


class FinancialModelCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating financial models"""
    class Meta:
        model = FinancialModel
        fields = ['name', 'model_type', 'organization', 'template', 'input_data', 'assumptions']


class ScenarioSerializer(serializers.ModelSerializer):
    financial_model_name = serializers.ReadOnlyField(source='financial_model.name')

    class Meta:
        model = Scenario
        fields = ['id', 'name', 'scenario_type', 'financial_model', 'financial_model_name', 'assumptions_override', 'results', 'enterprise_value', 'irr', 'probability', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class SensitivityAnalysisSerializer(serializers.ModelSerializer):
    financial_model_name = serializers.ReadOnlyField(source='financial_model.name')

    class Meta:
        model = SensitivityAnalysis
        fields = ['id', 'financial_model', 'financial_model_name', 'variable_name', 'base_value', 'range_min', 'range_max', 'steps', 'results', 'created_at']
        read_only_fields = ['created_at']


class AIInsightSerializer(serializers.ModelSerializer):
    financial_model_name = serializers.ReadOnlyField(source='financial_model.name')

    class Meta:
        model = AIInsight
        fields = ['id', 'financial_model', 'financial_model_name', 'insight_type', 'priority', 'title', 'description', 'confidence_score', 'supporting_data', 'recommendations', 'is_read', 'created_at']
        read_only_fields = ['created_at']


class CustomKPISerializer(serializers.ModelSerializer):
    organization_name = serializers.ReadOnlyField(source='organization.name')

    class Meta:
        model = CustomKPI
        fields = ['id', 'organization', 'organization_name', 'name', 'formula', 'description', 'unit', 'target_value', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class KPICalculationSerializer(serializers.ModelSerializer):
    kpi_name = serializers.ReadOnlyField(source='kpi.name')
    financial_model_name = serializers.ReadOnlyField(source='financial_model.name')

    class Meta:
        model = KPICalculation
        fields = ['id', 'kpi', 'kpi_name', 'financial_model', 'financial_model_name', 'value', 'status', 'calculated_at']
        read_only_fields = ['calculated_at']


class ReportSerializer(serializers.ModelSerializer):
    financial_model_name = serializers.ReadOnlyField(source='financial_model.name')
    generated_by_name = serializers.ReadOnlyField(source='generated_by.get_full_name')

    class Meta:
        model = Report
        fields = ['id', 'title', 'report_type', 'financial_model', 'financial_model_name', 'content', 'summary', 'recommendations', 'export_format', 'file_path', 'generated_by', 'generated_by_name', 'is_public', 'version', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ConsolidationEntitySerializer(serializers.ModelSerializer):
    entity_name = serializers.ReadOnlyField(source='entity.name')
    entity_country = serializers.ReadOnlyField(source='entity.country')

    class Meta:
        model = ConsolidationEntity
        fields = ['id', 'consolidation', 'entity', 'entity_name', 'entity_country', 'ownership_percentage', 'acquisition_date', 'goodwill', 'pnl_data', 'balance_sheet_data', 'cashflow_data']


class ConsolidationSerializer(serializers.ModelSerializer):
    organization_name = serializers.ReadOnlyField(source='organization.name')
    entities = ConsolidationEntitySerializer(source='entities.all', many=True, read_only=True)

    class Meta:
        model = Consolidation
        fields = ['id', 'name', 'organization', 'organization_name', 'status', 'consolidation_date', 'reporting_currency', 'include_minority_interest', 'eliminate_intercompany', 'consolidated_pnl', 'consolidated_balance_sheet', 'consolidated_cashflow', 'adjustments', 'total_assets', 'total_liabilities', 'shareholders_equity', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class TaxCalculationSerializer(serializers.ModelSerializer):
    entity_name = serializers.ReadOnlyField(source='entity.name')

    class Meta:
        model = TaxCalculation
        fields = ['id', 'entity', 'entity_name', 'tax_year', 'calculation_type', 'jurisdiction', 'taxable_income', 'tax_rate', 'deductions', 'credits', 'calculated_tax', 'effective_rate', 'breakdown', 'created_at']
        read_only_fields = ['created_at']


# ============ Entity-Specific Serializers ============

class EntityDepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.ReadOnlyField(source='head_of_department.full_name')
    staff_count = serializers.SerializerMethodField()

    class Meta:
        model = EntityDepartment
        fields = ['id', 'entity', 'name', 'code', 'description', 'head_of_department', 'head_name', 'budget', 'currency', 'staff_count', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_staff_count(self, obj):
        return obj.staff.count()


class EntityRoleSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        source='permissions',
        many=True,
        write_only=True
    )
    staff_count = serializers.SerializerMethodField()

    class Meta:
        model = EntityRole
        fields = ['id', 'entity', 'name', 'code', 'department', 'department_name', 'description', 'salary_range_min', 'salary_range_max', 'currency', 'permissions', 'permission_ids', 'staff_count', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_staff_count(self, obj):
        return obj.staff.count()


class EntityStaffSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    department_name = serializers.ReadOnlyField(source='department.name')
    role_name = serializers.ReadOnlyField(source='role.name')
    manager_name = serializers.ReadOnlyField(source='manager.full_name')
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = EntityStaff
        fields = ['id', 'entity', 'user', 'user_email', 'employee_id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'department', 'department_name', 'role', 'role_name', 'employment_type', 'status', 'hire_date', 'termination_date', 'salary', 'currency', 'manager', 'manager_name', 'address', 'emergency_contact', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = ['id', 'entity', 'account_name', 'account_number', 'bank_name', 'account_type', 'currency', 'iban', 'swift_code', 'routing_number', 'balance', 'available_balance', 'is_active', 'last_synced', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'entity', 'name', 'wallet_type', 'currency', 'balance', 'provider', 'account_id', 'is_active', 'last_synced', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ComplianceDocumentSerializer(serializers.ModelSerializer):
    responsible_user_name = serializers.ReadOnlyField(source='responsible_user.get_full_name')
    days_until_expiry = serializers.ReadOnlyField()
    is_expiring_soon = serializers.ReadOnlyField()

    class Meta:
        model = ComplianceDocument
        fields = ['id', 'entity', 'document_type', 'title', 'document_number', 'issuing_authority', 'issue_date', 'expiry_date', 'renewal_date', 'status', 'file_path', 'notes', 'reminder_days', 'responsible_user', 'responsible_user_name', 'days_until_expiry', 'is_expiring_soon', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ============================================================================
# BOOKKEEPING SERIALIZERS
# ============================================================================

class BookkeepingCategorySerializer(serializers.ModelSerializer):
    transaction_count = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = BookkeepingCategory
        fields = ['id', 'entity', 'name', 'type', 'description', 'is_default', 'transaction_count', 'total_amount', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_transaction_count(self, obj):
        return obj.transactions.count()
    
    def get_total_amount(self, obj):
        from django.db.models import Sum
        total = obj.transactions.aggregate(total=Sum('amount'))['total']
        return float(total) if total else 0.0


class BookkeepingAccountSerializer(serializers.ModelSerializer):
    transaction_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BookkeepingAccount
        fields = ['id', 'entity', 'name', 'type', 'balance', 'currency', 'account_number', 'description', 'is_active', 'transaction_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_transaction_count(self, obj):
        return obj.transactions.count()


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    account_name = serializers.ReadOnlyField(source='account.name')
    staff_member_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = ['id', 'entity', 'type', 'category', 'category_name', 'account', 'account_name', 'amount', 'currency', 'payment_method', 'description', 'reference_number', 'date', 'attachment_url', 'staff_member', 'staff_member_name', 'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        """Basic duplicate-protection for transactions.

        Prevents creating an identical transaction for the same entity,
        account, amount and date with the same reference or description.
        """
        from .models import Transaction  # local import to avoid circulars

        entity = attrs.get('entity')
        account = attrs.get('account')
        amount = attrs.get('amount')
        date = attrs.get('date')
        description = (attrs.get('description') or '').strip()
        reference_number = (attrs.get('reference_number') or '').strip()

        if entity and account and amount is not None and date:
            qs = Transaction.objects.filter(
                entity=entity,
                account=account,
                amount=amount,
                date=date,
            )

            if reference_number:
                qs = qs.filter(reference_number__iexact=reference_number)
            elif description:
                qs = qs.filter(description__iexact=description)

            # When updating, ignore the current instance
            if self.instance is not None:
                qs = qs.exclude(pk=self.instance.pk)

            if qs.exists():
                raise serializers.ValidationError({
                    'non_field_errors': [
                        'A similar transaction already exists for this account and date. Please confirm this is not a duplicate.'
                    ]
                })

        return attrs
    
    def get_staff_member_name(self, obj):
        return obj.staff_member.full_name if obj.staff_member else None
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None


class BookkeepingAuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BookkeepingAuditLog
        fields = ['id', 'entity', 'action', 'user', 'user_name', 'old_value', 'new_value', 'timestamp', 'ip_address']
        read_only_fields = ['timestamp']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() if obj.user else 'System'


# ============================================================================
# WORKFLOW & TASK QUEUE SERIALIZERS
# ============================================================================

class RecurringTransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    account_name = serializers.ReadOnlyField(source='account.name')
    staff_member_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = RecurringTransaction
        fields = [
            'id', 'entity', 'account', 'account_name', 'category', 'category_name',
            'type', 'amount', 'currency', 'payment_method', 'description',
            'staff_member', 'staff_member_name', 'created_by', 'created_by_name',
            'frequency', 'next_run_date', 'end_date', 'max_occurrences',
            'occurrences_executed', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['occurrences_executed', 'created_at', 'updated_at']

    def get_staff_member_name(self, obj):
        return obj.staff_member.full_name if obj.staff_member else None

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None


class TaskRequestSerializer(serializers.ModelSerializer):
    organization_name = serializers.ReadOnlyField(source='organization.name')
    entity_name = serializers.ReadOnlyField(source='entity.name')
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TaskRequest
        fields = [
            'id', 'organization', 'organization_name', 'entity', 'entity_name',
            'created_by', 'created_by_name', 'task_type', 'status', 'priority',
            'payload', 'result', 'error_message', 'created_at', 'started_at',
            'completed_at',
        ]
        read_only_fields = ['status', 'result', 'error_message', 'created_at', 'started_at', 'completed_at']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None


# ============ COA & GL Serializers ============

class ChartOfAccountsSerializer(serializers.ModelSerializer):
    parent_account_name = serializers.ReadOnlyField(source='parent_account.account_name')

    class Meta:
        model = ChartOfAccounts
        fields = ['id', 'entity', 'account_code', 'account_name', 'account_type', 'parent_account', 'parent_account_name', 'currency', 'description', 'cost_center', 'status', 'opening_balance', 'current_balance', 'created_at', 'updated_at']
        read_only_fields = ['current_balance', 'created_at', 'updated_at']


class GeneralLedgerSerializer(serializers.ModelSerializer):
    debit_account_code = serializers.ReadOnlyField(source='debit_account.account_code')
    credit_account_code = serializers.ReadOnlyField(source='credit_account.account_code')

    class Meta:
        model = GeneralLedger
        fields = ['id', 'entity', 'debit_account', 'debit_account_code', 'credit_account', 'credit_account_code', 'debit_amount', 'credit_amount', 'description', 'reference_number', 'posting_date', 'journal_entry', 'posting_status', 'created_at']
        read_only_fields = ['created_at']


class JournalEntrySerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    approved_by_name = serializers.ReadOnlyField(source='approved_by.get_full_name')

    class Meta:
        model = JournalEntry
        fields = ['id', 'entity', 'entry_type', 'reference_number', 'description', 'posting_date', 'memo', 'status', 'created_by', 'created_by_name', 'approved_by', 'approved_by_name', 'approved_at', 'is_recurring', 'recurring_template', 'reversing_entry', 'original_entry', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'approved_at']


class RecurringJournalTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')

    class Meta:
        model = RecurringJournalTemplate
        fields = ['id', 'entity', 'name', 'description', 'frequency', 'next_posting_date', 'end_date', 'is_active', 'journal_lines', 'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class LedgerPeriodSerializer(serializers.ModelSerializer):
    closed_by_name = serializers.ReadOnlyField(source='closed_by.get_full_name')

    class Meta:
        model = LedgerPeriod
        fields = ['id', 'entity', 'period_name', 'start_date', 'end_date', 'status', 'no_posting_after', 'created_at', 'closed_at', 'closed_by', 'closed_by_name']
        read_only_fields = ['created_at', 'closed_at']


# ============ AR Serializers ============

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'entity', 'customer_code', 'customer_name', 'email', 'phone', 'address', 'city', 'country', 'postal_code', 'contact_person', 'tax_id', 'payment_terms', 'currency', 'credit_limit', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class InvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'invoice', 'description', 'quantity', 'unit_price', 'tax_rate', 'line_amount']


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.customer_name')
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'entity', 'customer', 'customer_name', 'invoice_number', 'invoice_date', 'due_date', 'subtotal', 'tax_amount', 'total_amount', 'paid_amount', 'outstanding_amount', 'currency', 'status', 'description', 'notes', 'created_by', 'created_by_name', 'line_items', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'outstanding_amount']


class CreditNoteSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.customer_name')
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')

    class Meta:
        model = CreditNote
        fields = ['id', 'entity', 'invoice', 'customer', 'customer_name', 'credit_note_number', 'credit_date', 'reason', 'total_amount', 'currency', 'status', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['created_at']


class PaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.customer_name')
    invoice_number = serializers.ReadOnlyField(source='invoice.invoice_number')

    class Meta:
        model = Payment
        fields = ['id', 'entity', 'invoice', 'invoice_number', 'customer', 'customer_name', 'payment_date', 'amount', 'payment_method', 'reference_number', 'created_at']
        read_only_fields = ['created_at']


# ============ AP Serializers ============

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'entity', 'vendor_code', 'vendor_name', 'email', 'phone', 'address', 'city', 'country', 'postal_code', 'contact_person', 'tax_id', 'payment_terms', 'currency', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.ReadOnlyField(source='vendor.vendor_name')
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'entity', 'vendor', 'vendor_name', 'po_number', 'po_date', 'expected_delivery_date', 'subtotal', 'tax_amount', 'total_amount', 'currency', 'status', 'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class BillSerializer(serializers.ModelSerializer):
    vendor_name = serializers.ReadOnlyField(source='vendor.vendor_name')
    po_number = serializers.ReadOnlyField(source='purchase_order.po_number')
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')

    class Meta:
        model = Bill
        fields = ['id', 'entity', 'vendor', 'vendor_name', 'purchase_order', 'po_number', 'bill_number', 'bill_date', 'due_date', 'subtotal', 'tax_amount', 'total_amount', 'paid_amount', 'outstanding_amount', 'currency', 'status', 'description', 'notes', 'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'outstanding_amount']


class BillPaymentSerializer(serializers.ModelSerializer):
    vendor_name = serializers.ReadOnlyField(source='vendor.vendor_name')
    bill_number = serializers.ReadOnlyField(source='bill.bill_number')

    class Meta:
        model = BillPayment
        fields = ['id', 'entity', 'bill', 'bill_number', 'vendor', 'vendor_name', 'payment_date', 'amount', 'payment_method', 'reference_number', 'created_at']
        read_only_fields = ['created_at']


# ============ Inventory Serializers ============

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ['id', 'entity', 'sku', 'item_name', 'item_code', 'description', 'category', 'unit_of_measure', 'quantity_on_hand', 'reorder_level', 'reorder_quantity', 'unit_cost', 'valuation_method', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class InventoryTransactionSerializer(serializers.ModelSerializer):
    inventory_item_sku = serializers.ReadOnlyField(source='inventory_item.sku')
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')

    class Meta:
        model = InventoryTransaction
        fields = ['id', 'entity', 'inventory_item', 'inventory_item_sku', 'transaction_type', 'transaction_date', 'quantity_before', 'quantity', 'quantity_after', 'unit_cost', 'total_cost', 'reference_number', 'notes', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['created_at', 'quantity_after']


class InventoryCostOfGoodsSoldSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryCostOfGoodsSold
        fields = ['id', 'entity', 'period_start', 'period_end', 'opening_inventory', 'purchases', 'closing_inventory', 'cogs', 'created_at']
        read_only_fields = ['created_at', 'cogs']


# ============ Reconciliation Serializers ============

class BankReconciliationSerializer(serializers.ModelSerializer):
    bank_account_name = serializers.ReadOnlyField(source='bank_account.account_name')
    reconciled_by_name = serializers.ReadOnlyField(source='reconciled_by.get_full_name')

    class Meta:
        model = BankReconciliation
        fields = ['id', 'entity', 'bank_account', 'bank_account_name', 'reconciliation_date', 'bank_statement_balance', 'book_balance', 'status', 'variance', 'notes', 'reconciled_by', 'reconciled_by_name', 'reconciled_at', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'variance']


# ============ Revenue Recognition Serializers ============

class RevenueRecognitionScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueRecognitionSchedule
        fields = ['id', 'deferred_revenue', 'recognition_period_start', 'recognition_period_end', 'recognition_date', 'amount_to_recognize', 'is_recognized', 'recognized_date']


class DeferredRevenueSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.customer_name')
    recognition_schedule = RevenueRecognitionScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = DeferredRevenue
        fields = ['id', 'entity', 'customer', 'customer_name', 'contract_number', 'contract_start_date', 'contract_end_date', 'total_amount', 'currency', 'recognized_amount', 'remaining_amount', 'status', 'description', 'recognition_schedule', 'created_at']
        read_only_fields = ['created_at', 'recognized_amount', 'remaining_amount']


# ============ Period Close Serializers ============

class PeriodCloseItemSerializer(serializers.ModelSerializer):
    responsible_user_name = serializers.ReadOnlyField(source='responsible_user.get_full_name')

    class Meta:
        model = PeriodCloseItem
        fields = ['id', 'checklist', 'task_name', 'description', 'sequence', 'status', 'responsible_user', 'responsible_user_name', 'completed_at']


class PeriodCloseChecklistSerializer(serializers.ModelSerializer):
    items = PeriodCloseItemSerializer(many=True, read_only=True)

    class Meta:
        model = PeriodCloseChecklist
        fields = ['id', 'entity', 'period', 'status', 'created_at', 'started_at', 'completed_at', 'items']
        read_only_fields = ['created_at']


# ============ FX Serializers ============

class ExchangeRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRate
        fields = ['id', 'from_currency', 'to_currency', 'rate', 'rate_date', 'source', 'created_at']
        read_only_fields = ['created_at']


class FXGainLossSerializer(serializers.ModelSerializer):
    transaction_reference = serializers.ReadOnlyField(source='transaction.description')

    class Meta:
        model = FXGainLoss
        fields = ['id', 'entity', 'transaction', 'transaction_reference', 'from_currency', 'to_currency', 'original_amount', 'original_rate', 'original_value', 'current_rate', 'current_value', 'gain_loss_amount', 'gain_type', 'transaction_date', 'created_at']
        read_only_fields = ['created_at']


# ============ Notification Serializers ============

class NotificationSerializer(serializers.ModelSerializer):
    related_entity_name = serializers.ReadOnlyField(source='related_entity.name')

    class Meta:
        model = Notification
        fields = ['id', 'user', 'organization', 'notification_type', 'priority', 'status', 'title', 'message', 'related_entity', 'related_entity_name', 'related_content_type', 'related_object_id', 'action_url', 'read_at', 'sent_at']
        read_only_fields = ['sent_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['id', 'user', 'email_budget_alerts', 'email_deadline_reminders', 'email_payment_due', 'email_approval_requests', 'sms_budget_alerts', 'sms_deadline_reminders', 'sms_payment_due', 'in_app_all', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ============ CLIENT MANAGEMENT SERIALIZERS ============

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'organization', 'name', 'email', 'phone', 'address', 'country', 'industry', 'registration_number', 'tax_id', 'contact_person', 'contact_email', 'contact_phone', 'website', 'status', 'assigned_accountant', 'monthly_fee', 'currency', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ClientPortalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientPortal
        fields = ['id', 'client', 'user', 'portal_slug', 'is_active', 'last_login', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ClientMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientMessage
        fields = ['id', 'client', 'from_user', 'to_user', 'message_type', 'subject', 'content', 'is_read', 'read_at', 'is_urgent', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'read_at']


class ClientDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientDocument
        fields = ['id', 'client', 'organization', 'document_type', 'name', 'description', 'file_url', 'file_size', 'status', 'uploaded_by', 'reviewed_by', 'review_notes', 'tags', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'file_size']


class DocumentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentRequest
        fields = ['id', 'client', 'organization', 'requested_by', 'document_type', 'description', 'status', 'due_date', 'reminder_sent', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ApprovalRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalRequest
        fields = ['id', 'client', 'organization', 'request_type', 'request_data', 'status', 'requested_by', 'approved_by', 'rejection_reason', 'due_date', 'email_sent', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ============ DOCUMENT MANAGEMENT SERIALIZERS ============

class DocumentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTemplate
        fields = ['id', 'organization', 'name', 'description', 'template_content', 'category', 'is_active', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ============ LOAN MANAGEMENT SERIALIZERS ============

class LoanPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanPayment
        fields = ['id', 'loan', 'payment_number', 'payment_date', 'principal_paid', 'interest_paid', 'total_paid', 'principal_remaining', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class LoanSerializer(serializers.ModelSerializer):
    payments = LoanPaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Loan
        fields = ['id', 'entity', 'organization', 'lender_name', 'loan_type', 'loan_amount', 'currency', 'interest_rate', 'start_date', 'maturity_date', 'status', 'principal_remaining', 'monthly_payment', 'payments', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ============ COMPLIANCE & KYC/AML SERIALIZERS ============

class KYCProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCProfile
        fields = ['id', 'entity', 'client', 'organization', 'status', 'beneficial_owners', 'verification_date', 'verified_by', 'expiry_date', 'id_document_url', 'proof_of_address_url', 'business_registration_url', 'rejection_reason', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AMLTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AMLTransaction
        fields = ['id', 'entity', 'transaction', 'organization', 'amount', 'currency', 'transaction_date', 'transaction_type', 'risk_level', 'status', 'reason', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ============ BILLING & FIRM MANAGEMENT SERIALIZERS ============

class FirmServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FirmService
        fields = ['id', 'organization', 'name', 'description', 'price', 'currency', 'billing_frequency', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ClientInvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientInvoiceLineItem
        fields = ['id', 'invoice', 'service', 'description', 'quantity', 'unit_price', 'total_price']


class ClientInvoiceSerializer(serializers.ModelSerializer):
    line_items = ClientInvoiceLineItemSerializer(many=True, read_only=True)

    class Meta:
        model = ClientInvoice
        fields = ['id', 'organization', 'client', 'invoice_number', 'currency', 'issue_date', 'due_date', 'subtotal', 'tax_amount', 'total_amount', 'status', 'payment_received', 'payment_date', 'description', 'notes', 'sent_at', 'viewed_at', 'created_by', 'line_items', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ClientSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientSubscription
        fields = ['id', 'organization', 'client', 'service', 'status', 'start_date', 'end_date', 'next_billing_date', 'auto_renew', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ============ WHITE-LABELING SERIALIZERS ============

class WhiteLabelBrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhiteLabelBranding
        fields = ['id', 'organization', 'primary_color', 'secondary_color', 'accent_color', 'logo_url', 'logo_light_url', 'logo_dark_url', 'favicon_url', 'custom_domain', 'portal_name', 'portal_description', 'support_email', 'support_phone', 'font_family', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ============ EMBEDDED BANKING & PAYMENTS SERIALIZERS ============

class BankingIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankingIntegration
        fields = ['id', 'organization', 'integration_type', 'provider_name', 'status', 'is_active', 'last_sync', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'api_key', 'api_secret']


class BankingTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankingTransaction
        fields = ['id', 'entity', 'bank_account', 'transaction_id', 'transaction_date', 'amount', 'currency', 'description', 'counterparty_name', 'counterparty_account', 'transaction_type', 'status', 'is_matched', 'matched_transaction', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class EmbeddedPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmbeddedPayment
        fields = ['id', 'organization', 'client', 'invoice', 'amount', 'currency', 'payment_method', 'status', 'payment_link', 'payment_ref', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'payment_ref']


# ============ WORKFLOW AUTOMATION SERIALIZERS ============

class AutomationExecutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationExecution
        fields = ['id', 'workflow', 'status', 'triggered_at', 'started_at', 'completed_at', 'execution_result', 'error_message']
        read_only_fields = ['triggered_at', 'started_at', 'completed_at']


class AutomationWorkflowSerializer(serializers.ModelSerializer):
    executions = AutomationExecutionSerializer(many=True, read_only=True)

    class Meta:
        model = AutomationWorkflow
        fields = ['id', 'organization', 'entity', 'name', 'description', 'trigger_type', 'trigger_config', 'actions', 'is_active', 'created_by', 'created_at', 'updated_at', 'executions']
        read_only_fields = ['created_at', 'updated_at']


# ============ FIRM DASHBOARD & BUSINESS INTELLIGENCE SERIALIZERS ============

class FirmMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = FirmMetric
        fields = ['id', 'organization', 'metric_name', 'metric_key', 'value', 'value_type', 'period', 'period_date', 'previous_value', 'change_percentage', 'created_at']
        read_only_fields = ['created_at']


class ClientMarketplaceIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientMarketplaceIntegration
        fields = ['id', 'organization', 'client', 'name', 'category', 'provider', 'description', 'icon_url', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'api_key']
