from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    EquityDeliveryLogViewSet,
    EquityExerciseRequestViewSet,
    EquityExternalAdapterConfigViewSet,
    EquityFundingRoundViewSet,
    EquityGrantViewSet,
    EquityHoldingViewSet,
    EquityOptionPoolReserveViewSet,
    EquityPayrollTaxEventViewSet,
    EquityReportViewSet,
    EquityScenarioApprovalPolicyViewSet,
    EquityScenarioApprovalViewSet,
    EquityScenarioViewSet,
    EquityShareCertificateViewSet,
    EquityShareClassViewSet,
    EquityShareholderViewSet,
    EquityTransactionViewSet,
    EquityValuationViewSet,
    EquityVestingEventViewSet,
    EquitySelfServiceViewSet,
    WorkspaceEquityProfileViewSet,
)

router = DefaultRouter(trailing_slash=False)
router.register(r'profile', WorkspaceEquityProfileViewSet, basename='equity-profile')
router.register(r'shareholders', EquityShareholderViewSet, basename='equity-shareholders')
router.register(r'share-classes', EquityShareClassViewSet, basename='equity-share-classes')
router.register(r'holdings', EquityHoldingViewSet, basename='equity-holdings')
router.register(r'option-pool-reserves', EquityOptionPoolReserveViewSet, basename='equity-option-pool-reserves')
router.register(r'scenario-approval-policy', EquityScenarioApprovalPolicyViewSet, basename='equity-scenario-approval-policy')
router.register(r'funding-rounds', EquityFundingRoundViewSet, basename='equity-funding-rounds')
router.register(r'valuations', EquityValuationViewSet, basename='equity-valuations')
router.register(r'transactions', EquityTransactionViewSet, basename='equity-transactions')
router.register(r'reports', EquityReportViewSet, basename='equity-reports')
router.register(r'grants', EquityGrantViewSet, basename='equity-grants')
router.register(r'vesting-events', EquityVestingEventViewSet, basename='equity-vesting-events')
router.register(r'exercise-requests', EquityExerciseRequestViewSet, basename='equity-exercise-requests')
router.register(r'certificates', EquityShareCertificateViewSet, basename='equity-certificates')
router.register(r'payroll-tax-events', EquityPayrollTaxEventViewSet, basename='equity-payroll-tax-events')
router.register(r'adapter-configs', EquityExternalAdapterConfigViewSet, basename='equity-adapter-configs')
router.register(r'delivery-logs', EquityDeliveryLogViewSet, basename='equity-delivery-logs')
router.register(r'scenario-approvals', EquityScenarioApprovalViewSet, basename='equity-scenario-approvals')
router.register(r'me', EquitySelfServiceViewSet, basename='equity-self-service')
router.register(r'scenarios', EquityScenarioViewSet, basename='equity-scenarios')

urlpatterns = [
    path('entities/<int:workspace_id>/equity/', include(router.urls)),
]
