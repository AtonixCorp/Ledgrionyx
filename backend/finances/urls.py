from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExpenseViewSet, IncomeViewSet, BudgetViewSet,
    ModelTemplateViewSet, FinancialModelViewSet, ScenarioViewSet,
    SensitivityAnalysisViewSet, AIInsightViewSet, CustomKPIViewSet,
    KPICalculationViewSet, ReportViewSet, ConsolidationViewSet,
    ConsolidationEntityViewSet, TaxCalculationViewSet
)
from .views import list_countries, get_country
from .enterprise_views import (
    OrganizationViewSet, EntityViewSet, TeamMemberViewSet,
    TaxExposureViewSet, TaxProfileViewSet, ComplianceDeadlineViewSet, CashflowForecastViewSet,
    RoleViewSet, PermissionViewSet, AuditLogViewSet,
    EntityDepartmentViewSet, EntityRoleViewSet, EntityStaffViewSet,
    BankAccountViewSet, WalletViewSet, ComplianceDocumentViewSet,
    BookkeepingCategoryViewSet, BookkeepingAccountViewSet, TransactionViewSet, BookkeepingAuditLogViewSet,
    CashflowTreasuryViewSet, RecurringTransactionViewSet, TaskRequestViewSet, FinancialStatementsViewSet
)

router = DefaultRouter()

# Personal finance endpoints
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'income', IncomeViewSet, basename='income')
router.register(r'budgets', BudgetViewSet, basename='budget')

# Enterprise endpoints
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'entities', EntityViewSet, basename='entity')
router.register(r'team-members', TeamMemberViewSet, basename='team-member')
router.register(r'tax-exposures', TaxExposureViewSet, basename='tax-exposure')
router.register(r'tax-profiles', TaxProfileViewSet, basename='tax-profile')
router.register(r'compliance-deadlines', ComplianceDeadlineViewSet, basename='compliance-deadline')
router.register(r'cashflow-forecasts', CashflowForecastViewSet, basename='cashflow-forecast')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

# Entity-specific endpoints
router.register(r'entity-departments', EntityDepartmentViewSet, basename='entity-department')
router.register(r'entity-roles', EntityRoleViewSet, basename='entity-role')
router.register(r'entity-staff', EntityStaffViewSet, basename='entity-staff')
router.register(r'bank-accounts', BankAccountViewSet, basename='bank-account')
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'compliance-documents', ComplianceDocumentViewSet, basename='compliance-document')

# Bookkeeping endpoints
router.register(r'bookkeeping-categories', BookkeepingCategoryViewSet, basename='bookkeeping-category')
router.register(r'bookkeeping-accounts', BookkeepingAccountViewSet, basename='bookkeeping-account')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'bookkeeping-audit-logs', BookkeepingAuditLogViewSet, basename='bookkeeping-audit-log')

# Workflow & task queue endpoints
router.register(r'recurring-transactions', RecurringTransactionViewSet, basename='recurring-transaction')
router.register(r'task-requests', TaskRequestViewSet, basename='task-request')

# Financial statements endpoints (no model viewset, just actions)
router.register(r'financial-statements', FinancialStatementsViewSet, basename='financial-statements')

# Cashflow & Treasury endpoints
router.register(r'cashflow-treasury', CashflowTreasuryViewSet, basename='cashflow-treasury')

# Financial modeling endpoints
router.register(r'model-templates', ModelTemplateViewSet, basename='model-template')
router.register(r'financial-models', FinancialModelViewSet, basename='financial-model')
router.register(r'scenarios', ScenarioViewSet, basename='scenario')
router.register(r'sensitivity-analyses', SensitivityAnalysisViewSet, basename='sensitivity-analysis')
router.register(r'ai-insights', AIInsightViewSet, basename='ai-insight')
router.register(r'custom-kpis', CustomKPIViewSet, basename='custom-kpi')
router.register(r'kpi-calculations', KPICalculationViewSet, basename='kpi-calculation')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'consolidations', ConsolidationViewSet, basename='consolidation')
router.register(r'consolidation-entities', ConsolidationEntityViewSet, basename='consolidation-entity')
router.register(r'tax-calculations', TaxCalculationViewSet, basename='tax-calculation')

urlpatterns = [
    path('', include(router.urls)),
    path('tax/countries/', list_countries, name='tax_countries_list'),
    path('tax/countries/<str:code>/', get_country, name='tax_country_detail'),
]
