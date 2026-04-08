from django.contrib import admin

from .models import (
    EquityDeliveryLog,
    EquityExerciseApproval,
    EquityExerciseRequest,
    EquityExternalAdapterConfig,
    EquityFundingRound,
    EquityGrant,
    EquityHolding,
    EquityOptionPoolReserve,
    EquityPayrollTaxEvent,
    EquityReport,
    EquityScenarioApprovalEvent,
    EquityScenarioApprovalPolicy,
    EquityScenarioApproval,
    EquityShareCertificate,
    EquityShareClass,
    EquityShareholder,
    EquityTransaction,
    EquityValuation,
    EquityVestingEvent,
    WorkspaceEquityProfile,
)

admin.site.register(WorkspaceEquityProfile)
admin.site.register(EquityShareholder)
admin.site.register(EquityShareClass)
admin.site.register(EquityHolding)
admin.site.register(EquityOptionPoolReserve)
admin.site.register(EquityFundingRound)
admin.site.register(EquityScenarioApprovalPolicy)
admin.site.register(EquityScenarioApproval)
admin.site.register(EquityScenarioApprovalEvent)
admin.site.register(EquityValuation)
admin.site.register(EquityTransaction)
admin.site.register(EquityReport)
admin.site.register(EquityGrant)
admin.site.register(EquityVestingEvent)
admin.site.register(EquityExerciseRequest)
admin.site.register(EquityExerciseApproval)
admin.site.register(EquityShareCertificate)
admin.site.register(EquityPayrollTaxEvent)
admin.site.register(EquityExternalAdapterConfig)
admin.site.register(EquityDeliveryLog)
