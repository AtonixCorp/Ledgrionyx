from rest_framework import serializers

from .models import AIInteraction, WorkspaceAIPrecedent, WorkspaceAIProfile


class WorkspaceAIProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceAIProfile
        fields = [
            'id',
            'workspace',
            'tax_preferences',
            'equity_policies',
            'compliance_profile',
            'risk_tolerance',
            'language_preferences',
            'tone_preferences',
            'feedback_history',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'workspace', 'feedback_history', 'created_at', 'updated_at']


class TaxTreatmentRequestSerializer(serializers.Serializer):
    jurisdiction = serializers.CharField(max_length=50)
    period = serializers.CharField(max_length=50, required=False, allow_blank=True)
    transaction = serializers.JSONField()
    options = serializers.JSONField(required=False)

    def validate_transaction(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('transaction must be an object.')
        if 'amount' not in value:
            raise serializers.ValidationError('transaction.amount is required.')
        if 'type' not in value:
            raise serializers.ValidationError('transaction.type is required.')
        return value


class AIInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInteraction
        fields = [
            'id',
            'workspace',
            'organization',
            'entity',
            'user',
            'intent',
            'input_payload',
            'claude_request',
            'claude_response',
            'raw_claude_response',
            'tools_used',
            'output_payload',
            'model_name',
            'prompt_version',
            'status',
            'confidence',
            'feedback_outcome',
            'feedback_payload',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class AIInteractionFeedbackSerializer(serializers.Serializer):
    outcome = serializers.ChoiceField(choices=['accepted', 'overridden', 'flagged'])
    override_treatment = serializers.JSONField(required=False)
    reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs['outcome'] == 'overridden' and not attrs.get('override_treatment'):
            raise serializers.ValidationError({'override_treatment': 'override_treatment is required when outcome is overridden.'})
        return attrs


class WorkspaceAIPrecedentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceAIPrecedent
        fields = [
            'id',
            'workspace',
            'interaction',
            'intent',
            'feedback_outcome',
            'example_payload',
            'proposed_treatment',
            'final_treatment',
            'rationale',
            'metadata',
            'active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields
