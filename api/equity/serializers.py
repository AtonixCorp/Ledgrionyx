from rest_framework import serializers

from .models import (
    EquityExerciseApproval,
    EquityExerciseRequest,
    EquityFundingRound,
    EquityGrant,
    EquityHolding,
    EquityPayrollTaxEvent,
    EquityReport,
    EquityShareCertificate,
    EquityShareClass,
    EquityShareholder,
    EquityTransaction,
    EquityValuation,
    EquityVestingEvent,
    WorkspaceEquityProfile,
)
from .services import calculate_grant_summary


class WorkspaceEquityProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceEquityProfile
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')


class EquityShareholderSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquityShareholder
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at', 'created_by')


class EquityShareClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquityShareClass
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')


class EquityHoldingSerializer(serializers.ModelSerializer):
    shareholder_name = serializers.CharField(source='shareholder.name', read_only=True)
    share_class_name = serializers.CharField(source='share_class.name', read_only=True)

    class Meta:
        model = EquityHolding
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at', 'shareholder_name', 'share_class_name')


class EquityFundingRoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquityFundingRound
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')


class EquityValuationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquityValuation
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')


class EquityTransactionSerializer(serializers.ModelSerializer):
    shareholder_name = serializers.CharField(source='shareholder.name', read_only=True)
    share_class_name = serializers.CharField(source='share_class.name', read_only=True)

    class Meta:
        model = EquityTransaction
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at', 'created_by', 'shareholder_name', 'share_class_name')


class EquityReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquityReport
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at', 'generated_by')


class EquityGrantSerializer(serializers.ModelSerializer):
    shareholder_name = serializers.CharField(source='shareholder.name', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    share_class_name = serializers.CharField(source='share_class.name', read_only=True)
    vesting_summary = serializers.SerializerMethodField()

    class Meta:
        model = EquityGrant
        fields = '__all__'
        read_only_fields = (
            'id',
            'workspace',
            'created_at',
            'updated_at',
            'created_by',
            'shareholder_name',
            'employee_name',
            'share_class_name',
            'vesting_summary',
        )

    def get_vesting_summary(self, obj):
        return calculate_grant_summary(obj)


class EquityVestingEventSerializer(serializers.ModelSerializer):
    grant_number = serializers.CharField(source='grant.grant_number', read_only=True)

    class Meta:
        model = EquityVestingEvent
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at', 'grant_number')


class EquityExerciseApprovalSerializer(serializers.ModelSerializer):
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)

    class Meta:
        model = EquityExerciseApproval
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'approver_name')


class EquityExerciseRequestSerializer(serializers.ModelSerializer):
    shareholder_name = serializers.CharField(source='shareholder.name', read_only=True)
    grant_number = serializers.CharField(source='grant.grant_number', read_only=True)
    approvals = EquityExerciseApprovalSerializer(many=True, read_only=True)

    class Meta:
        model = EquityExerciseRequest
        fields = '__all__'
        read_only_fields = (
            'id',
            'workspace',
            'shareholder',
            'approved_units',
            'strike_price_per_unit',
            'strike_payment_amount',
            'tax_withholding_amount',
            'payment_status',
            'status',
            'requested_at',
            'due_date',
            'completed_at',
            'exercise_date',
            'tax_calculation',
            'journal_entry',
            'created_at',
            'updated_at',
            'created_by',
            'shareholder_name',
            'grant_number',
            'approvals',
        )


class EquityShareCertificateSerializer(serializers.ModelSerializer):
    issued_to_name = serializers.CharField(source='issued_to.name', read_only=True)
    grant_number = serializers.CharField(source='grant.grant_number', read_only=True)

    class Meta:
        model = EquityShareCertificate
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at', 'issued_by', 'issued_to_name', 'grant_number')


class EquityPayrollTaxEventSerializer(serializers.ModelSerializer):
    grant_number = serializers.CharField(source='grant.grant_number', read_only=True)
    employee_name = serializers.CharField(source='staff.full_name', read_only=True)

    class Meta:
        model = EquityPayrollTaxEvent
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at', 'grant_number', 'employee_name')
