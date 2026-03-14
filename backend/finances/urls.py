from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExpenseViewSet, IncomeViewSet, BudgetViewSet,
    ModelTemplateViewSet, FinancialModelViewSet, ScenarioViewSet,
    SensitivityAnalysisViewSet, AIInsightViewSet, CustomKPIViewSet,
    KPICalculationViewSet, ReportViewSet, ConsolidationViewSet,
    ConsolidationEntityViewSet, TaxCalculationViewSet
)
from .platform_views import health_check, ingest_platform_event
from .views import list_countries, get_country
from .enterprise_views import (
    OrganizationViewSet, EntityViewSet, TeamMemberViewSet,
    TaxExposureViewSet, TaxProfileViewSet, ComplianceDeadlineViewSet, CashflowForecastViewSet,
    RoleViewSet, PermissionViewSet, AuditLogViewSet,
    EntityDepartmentViewSet, EntityRoleViewSet, EntityStaffViewSet,
    BankAccountViewSet, WalletViewSet, ComplianceDocumentViewSet,
    BookkeepingCategoryViewSet, BookkeepingAccountViewSet, TransactionViewSet, BookkeepingAuditLogViewSet,
    CashflowTreasuryViewSet, RecurringTransactionViewSet, TaskRequestViewSet, FinancialStatementsViewSet,
    # New viewsets for Accounting module
    ChartOfAccountsViewSet, GeneralLedgerViewSet, JournalEntryViewSet,
    RecurringJournalTemplateViewSet, LedgerPeriodViewSet,
    CustomerViewSet, InvoiceViewSet, CreditNoteViewSet, PaymentViewSet,
    VendorViewSet, PurchaseOrderViewSet, BillViewSet, BillPaymentViewSet,
    InventoryItemViewSet, InventoryTransactionViewSet, InventoryCOGSViewSet,
    BankReconciliationViewSet,
    DeferredRevenueViewSet, RevenueRecognitionScheduleViewSet,
    PeriodCloseChecklistViewSet, PeriodCloseItemViewSet,
    ExchangeRateViewSet, FXGainLossViewSet,
    NotificationViewSet, NotificationPreferenceViewSet,
    # NEW VIEWSETS
    ClientViewSet, ClientPortalViewSet, ClientMessageViewSet, ClientDocumentViewSet,
    DocumentRequestViewSet, ApprovalRequestViewSet, DocumentTemplateViewSet, LoanViewSet,
    LoanPaymentViewSet, KYCProfileViewSet, AMLTransactionViewSet, FirmServiceViewSet,
    ClientInvoiceViewSet, ClientInvoiceLineItemViewSet, ClientSubscriptionViewSet,
    WhiteLabelBrandingViewSet, BankingIntegrationViewSet, BankingTransactionViewSet,
    EmbeddedPaymentViewSet, AutomationWorkflowViewSet, AutomationExecutionViewSet,
    FirmMetricViewSet, ClientMarketplaceIntegrationViewSet
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

# NEW: Chart of Accounts & General Ledger
router.register(r'chart-of-accounts', ChartOfAccountsViewSet, basename='chart-of-accounts')
router.register(r'general-ledger', GeneralLedgerViewSet, basename='general-ledger')
router.register(r'journal-entries', JournalEntryViewSet, basename='journal-entry')
router.register(r'recurring-journal-templates', RecurringJournalTemplateViewSet, basename='recurring-journal-template')
router.register(r'ledger-periods', LedgerPeriodViewSet, basename='ledger-period')

# NEW: Accounts Receivable (AR)
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'credit-notes', CreditNoteViewSet, basename='credit-note')
router.register(r'payments', PaymentViewSet, basename='payment')

# NEW: Accounts Payable (AP)
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'bills', BillViewSet, basename='bill')
router.register(r'bill-payments', BillPaymentViewSet, basename='bill-payment')

# NEW: Inventory
router.register(r'inventory-items', InventoryItemViewSet, basename='inventory-item')
router.register(r'inventory-transactions', InventoryTransactionViewSet, basename='inventory-transaction')
router.register(r'inventory-cogs', InventoryCOGSViewSet, basename='inventory-cogs')

# NEW: Reconciliation
router.register(r'bank-reconciliations', BankReconciliationViewSet, basename='bank-reconciliation')

# NEW: Revenue Recognition & Deferred Revenue
router.register(r'deferred-revenues', DeferredRevenueViewSet, basename='deferred-revenue')
router.register(r'revenue-recognition-schedules', RevenueRecognitionScheduleViewSet, basename='revenue-recognition-schedule')

# NEW: Period Close
router.register(r'period-close-checklists', PeriodCloseChecklistViewSet, basename='period-close-checklist')
router.register(r'period-close-items', PeriodCloseItemViewSet, basename='period-close-item')

# NEW: FX & Multi-Currency
router.register(r'exchange-rates', ExchangeRateViewSet, basename='exchange-rate')
router.register(r'fx-gainloss', FXGainLossViewSet, basename='fx-gainloss')

# NEW: Notifications
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'notification-preferences', NotificationPreferenceViewSet, basename='notification-preference')

# NEW: Client Management
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'client-portals', ClientPortalViewSet, basename='client-portal')
router.register(r'client-messages', ClientMessageViewSet, basename='client-message')
router.register(r'client-documents', ClientDocumentViewSet, basename='client-document')
router.register(r'document-requests', DocumentRequestViewSet, basename='document-request')
router.register(r'approval-requests', ApprovalRequestViewSet, basename='approval-request')
router.register(r'document-templates', DocumentTemplateViewSet, basename='document-template')

# NEW: Loan Management
router.register(r'loans', LoanViewSet, basename='loan')
router.register(r'loan-payments', LoanPaymentViewSet, basename='loan-payment')

# NEW: Compliance & KYC/AML
router.register(r'kyc-profiles', KYCProfileViewSet, basename='kyc-profile')
router.register(r'aml-transactions', AMLTransactionViewSet, basename='aml-transaction')

# NEW: Billing & Firm Management
router.register(r'firm-services', FirmServiceViewSet, basename='firm-service')
router.register(r'client-invoices', ClientInvoiceViewSet, basename='client-invoice')
router.register(r'client-invoice-line-items', ClientInvoiceLineItemViewSet, basename='client-invoice-line-item')
router.register(r'client-subscriptions', ClientSubscriptionViewSet, basename='client-subscription')

# NEW: White-Labeling
router.register(r'white-label-branding', WhiteLabelBrandingViewSet, basename='white-label-branding')

# NEW: Embedded Banking & Payments
router.register(r'banking-integrations', BankingIntegrationViewSet, basename='banking-integration')
router.register(r'banking-transactions', BankingTransactionViewSet, basename='banking-transaction')
router.register(r'embedded-payments', EmbeddedPaymentViewSet, basename='embedded-payment')

# NEW: Workflow Automation
router.register(r'automation-workflows', AutomationWorkflowViewSet, basename='automation-workflow')
router.register(r'automation-executions', AutomationExecutionViewSet, basename='automation-execution')

# NEW: Firm Dashboard
router.register(r'firm-metrics', FirmMetricViewSet, basename='firm-metric')
router.register(r'client-marketplace-integrations', ClientMarketplaceIntegrationViewSet, basename='client-marketplace-integration')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', health_check, name='health-check'),
    path('platform/events/', ingest_platform_event, name='platform-event-ingest'),
    path('tax/countries/', list_countries, name='tax_countries_list'),
    path('tax/countries/<str:code>/', get_country, name='tax_country_detail'),
]
