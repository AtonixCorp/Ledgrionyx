from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    EquityExerciseRequestViewSet,
    EquityFundingRoundViewSet,
    EquityGrantViewSet,
    EquityHoldingViewSet,
    EquityPayrollTaxEventViewSet,
    EquityReportViewSet,
    EquityShareCertificateViewSet,
    EquityShareClassViewSet,
    EquityShareholderViewSet,
    EquityTransactionViewSet,
    EquityValuationViewSet,
    EquityVestingEventViewSet,
    WorkspaceEquityProfileViewSet,
)

router = DefaultRouter(trailing_slash=False)
router.register(r'profile', WorkspaceEquityProfileViewSet, basename='equity-profile')
router.register(r'shareholders', EquityShareholderViewSet, basename='equity-shareholders')
router.register(r'share-classes', EquityShareClassViewSet, basename='equity-share-classes')
router.register(r'holdings', EquityHoldingViewSet, basename='equity-holdings')
router.register(r'funding-rounds', EquityFundingRoundViewSet, basename='equity-funding-rounds')
router.register(r'valuations', EquityValuationViewSet, basename='equity-valuations')
router.register(r'transactions', EquityTransactionViewSet, basename='equity-transactions')
router.register(r'reports', EquityReportViewSet, basename='equity-reports')
router.register(r'grants', EquityGrantViewSet, basename='equity-grants')
router.register(r'vesting-events', EquityVestingEventViewSet, basename='equity-vesting-events')
router.register(r'exercise-requests', EquityExerciseRequestViewSet, basename='equity-exercise-requests')
router.register(r'certificates', EquityShareCertificateViewSet, basename='equity-certificates')
router.register(r'payroll-tax-events', EquityPayrollTaxEventViewSet, basename='equity-payroll-tax-events')

urlpatterns = [
    path('entities/<int:workspace_id>/equity/', include(router.urls)),
]
