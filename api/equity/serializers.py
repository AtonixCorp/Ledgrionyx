from rest_framework import serializers
from django.utils import timezone

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
from .scenario_services import user_can_board_approve, user_can_legal_approve
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
    share_class_name = serializers.CharField(source='share_class.name', read_only=True)

    class Meta:
        model = EquityFundingRound
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at', 'share_class_name')


class EquityOptionPoolReserveSerializer(serializers.ModelSerializer):
    share_class_name = serializers.CharField(source='share_class.name', read_only=True)
    funding_round_name = serializers.CharField(source='funding_round.name', read_only=True)
    available_shares = serializers.SerializerMethodField()

    class Meta:
        model = EquityOptionPoolReserve
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at', 'share_class_name', 'funding_round_name', 'available_shares')

    def get_available_shares(self, obj):
        return max(int(obj.reserved_shares or 0) - int(obj.allocated_shares or 0), 0)


class EquityScenarioApprovalPolicySerializer(serializers.ModelSerializer):
    board_reviewers_details = serializers.SerializerMethodField()
    legal_reviewers_details = serializers.SerializerMethodField()
    board_escalation_reviewers_details = serializers.SerializerMethodField()
    legal_escalation_reviewers_details = serializers.SerializerMethodField()
    submission_rules = serializers.SerializerMethodField()

    class Meta:
        model = EquityScenarioApprovalPolicy
        fields = '__all__'
        read_only_fields = (
            'id',
            'workspace',
            'board_reviewers_details',
            'legal_reviewers_details',
            'board_escalation_reviewers_details',
            'legal_escalation_reviewers_details',
            'submission_rules',
            'created_at',
            'updated_at',
        )

    def _serialize_staff(self, staff_members):
        return [
            {
                'id': str(staff.id),
                'full_name': staff.full_name,
                'role_name': getattr(staff.role, 'name', ''),
                'department_name': getattr(staff.department, 'name', ''),
                'user_id': staff.user_id,
            }
            for staff in staff_members.select_related('role', 'department')
        ]

    def get_board_reviewers_details(self, obj):
        return self._serialize_staff(obj.board_reviewers.all())

    def get_legal_reviewers_details(self, obj):
        return self._serialize_staff(obj.legal_reviewers.all())

    def get_board_escalation_reviewers_details(self, obj):
        return self._serialize_staff(obj.board_escalation_reviewers.all())

    def get_legal_escalation_reviewers_details(self, obj):
        return self._serialize_staff(obj.legal_escalation_reviewers.all())

    def get_submission_rules(self, obj):
        return {
            'require_explicit_reviewers': obj.require_explicit_reviewers,
            'require_designated_backups': obj.require_designated_backups,
        }


class EquityScenarioApprovalEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)

    class Meta:
        model = EquityScenarioApprovalEvent
        fields = '__all__'
        read_only_fields = ('id', 'approval', 'actor', 'actor_name', 'created_at')


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


class EquityExternalAdapterConfigSerializer(serializers.ModelSerializer):
    api_key = serializers.CharField(write_only=True, required=False, allow_blank=True)
    has_api_key = serializers.SerializerMethodField()

    class Meta:
        model = EquityExternalAdapterConfig
        fields = '__all__'
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at', 'created_by', 'last_synced_at', 'last_error', 'has_api_key')

    def get_has_api_key(self, obj):
        return bool(obj.api_key)

    def create(self, validated_data):
        return EquityExternalAdapterConfig.objects.create(**validated_data)

    def update(self, instance, validated_data):
        api_key = validated_data.pop('api_key', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if api_key is not None:
            instance.api_key = api_key
        instance.save()
        return instance


class EquityDeliveryLogSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient_user.get_full_name', read_only=True)
    grant_number = serializers.CharField(source='grant.grant_number', read_only=True)
    certificate_number = serializers.CharField(source='certificate.certificate_number', read_only=True)

    class Meta:
        model = EquityDeliveryLog
        fields = '__all__'
        read_only_fields = (
            'id',
            'workspace',
            'created_at',
            'updated_at',
            'recipient_name',
            'grant_number',
            'certificate_number',
        )


class EquityScenarioRequestSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True)
    share_class = serializers.UUIDField(required=False, allow_null=True)
    investor_name = serializers.CharField(required=False, allow_blank=True, default='New Investor')
    pre_money_valuation = serializers.DecimalField(max_digits=18, decimal_places=2)
    amount_raised = serializers.DecimalField(max_digits=18, decimal_places=2)
    price_per_share = serializers.DecimalField(max_digits=14, decimal_places=4, required=False, allow_null=True)
    option_pool_top_up = serializers.IntegerField(required=False, min_value=0, default=0)
    apply_pro_rata = serializers.BooleanField(required=False, default=True)
    include_anti_dilution = serializers.BooleanField(required=False, default=True)
    exit_values = serializers.ListField(
        child=serializers.DecimalField(max_digits=18, decimal_places=2),
        required=False,
        allow_empty=True,
        default=list,
    )


class EquityScenarioReportSerializer(serializers.Serializer):
    title = serializers.CharField()
    reporting_period = serializers.CharField(required=False, allow_blank=True, default='')
    scenario = EquityScenarioRequestSerializer()


class EquityScenarioCommitSerializer(serializers.Serializer):
    approval_id = serializers.UUIDField(required=False, allow_null=True)
    scenario = EquityScenarioRequestSerializer(required=False)


class EquityScenarioApprovalSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    board_approved_by_name = serializers.CharField(source='board_approved_by.get_full_name', read_only=True)
    legal_approved_by_name = serializers.CharField(source='legal_approved_by.get_full_name', read_only=True)
    committed_round_name = serializers.CharField(source='committed_round.name', read_only=True)
    can_board_approve = serializers.SerializerMethodField()
    can_legal_approve = serializers.SerializerMethodField()
    overdue_reviews = serializers.SerializerMethodField()
    sla_summary = serializers.SerializerMethodField()
    timeline_events = EquityScenarioApprovalEventSerializer(source='events', many=True, read_only=True)

    class Meta:
        model = EquityScenarioApproval
        fields = '__all__'
        read_only_fields = (
            'id',
            'workspace',
            'analysis_payload',
            'status',
            'board_status',
            'legal_status',
            'requested_by',
            'requested_by_name',
            'board_approved_by',
            'board_approved_by_name',
            'legal_approved_by',
            'legal_approved_by_name',
            'board_decided_at',
            'legal_decided_at',
            'committed_round',
            'committed_round_name',
            'can_board_approve',
            'can_legal_approve',
            'overdue_reviews',
            'sla_summary',
            'timeline_events',
            'created_at',
            'updated_at',
        )

    def get_can_board_approve(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return bool(user and user_can_board_approve(obj.workspace, user))

    def get_can_legal_approve(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return bool(user and user_can_legal_approve(obj.workspace, user))

    def get_overdue_reviews(self, obj):
        now = timezone.now()
        overdue = []
        if obj.board_status == 'pending' and obj.board_due_at and obj.board_due_at <= now:
            overdue.append('board')
        if obj.legal_status == 'pending' and obj.legal_due_at and obj.legal_due_at <= now:
            overdue.append('legal')
        return overdue

    def get_sla_summary(self, obj):
        return {
            'board_due_at': obj.board_due_at,
            'legal_due_at': obj.legal_due_at,
            'board_last_reminder_at': obj.board_last_reminder_at,
            'legal_last_reminder_at': obj.legal_last_reminder_at,
            'board_escalated_at': obj.board_escalated_at,
            'legal_escalated_at': obj.legal_escalated_at,
        }


class EquityScenarioApprovalRequestSerializer(serializers.Serializer):
    title = serializers.CharField()
    reporting_period = serializers.CharField(required=False, allow_blank=True, default='')
    scenario = EquityScenarioRequestSerializer()


class EquityScenarioDecisionSerializer(serializers.Serializer):
    comments = serializers.CharField(required=False, allow_blank=True, default='')


class EquityScenarioInboxSerializer(serializers.Serializer):
    pending = EquityScenarioApprovalSerializer(many=True)
    overdue = EquityScenarioApprovalSerializer(many=True)
    summary = serializers.DictField()
