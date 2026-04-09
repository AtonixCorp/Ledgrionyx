import uuid

from django.conf import settings
from django.db import models


class WorkspaceAIRiskTolerance(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'


class AIInteractionStatus(models.TextChoices):
    SUCCEEDED = 'succeeded', 'Succeeded'
    FALLBACK = 'fallback', 'Fallback'
    FAILED = 'failed', 'Failed'


class AIFeedbackOutcome(models.TextChoices):
    PENDING = 'pending', 'Pending'
    ACCEPTED = 'accepted', 'Accepted'
    OVERRIDDEN = 'overridden', 'Overridden'
    FLAGGED = 'flagged', 'Flagged'


class GlobalKnowledgeDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    source_type = models.CharField(max_length=50, default='text')
    source = models.CharField(max_length=500)
    jurisdiction = models.CharField(max_length=50, default='GLOBAL')
    topic = models.CharField(max_length=100)
    effective_date = models.DateField(null=True, blank=True)
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['jurisdiction', 'topic', '-effective_date', '-updated_at']
        indexes = [
            models.Index(fields=['jurisdiction', 'topic']),
            models.Index(fields=['is_active', 'effective_date']),
        ]

    def __str__(self):
        return f'{self.jurisdiction} {self.topic} {self.title}'


class GlobalKnowledgeChunk(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(GlobalKnowledgeDocument, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.PositiveIntegerField(default=0)
    text = models.TextField()
    embedding_vector = models.JSONField(default=list, blank=True)
    embedding_model = models.CharField(max_length=100, blank=True, default='')
    jurisdiction = models.CharField(max_length=50, default='GLOBAL')
    topic = models.CharField(max_length=100)
    source = models.CharField(max_length=500)
    effective_date = models.DateField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['jurisdiction', 'topic', 'chunk_index']
        unique_together = ('document', 'chunk_index')
        indexes = [
            models.Index(fields=['jurisdiction', 'topic']),
            models.Index(fields=['effective_date']),
        ]

    def __str__(self):
        return f'{self.document.title}#{self.chunk_index}'


class WorkspaceAIProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.OneToOneField('workspaces.Workspace', on_delete=models.CASCADE, related_name='ai_profile')
    tax_preferences = models.JSONField(default=dict, blank=True)
    equity_policies = models.JSONField(default=dict, blank=True)
    compliance_profile = models.JSONField(default=dict, blank=True)
    risk_tolerance = models.CharField(max_length=20, choices=WorkspaceAIRiskTolerance.choices, default=WorkspaceAIRiskTolerance.MEDIUM)
    language_preferences = models.JSONField(default=dict, blank=True)
    tone_preferences = models.JSONField(default=dict, blank=True)
    feedback_history = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.workspace.name} AI profile'


class WorkspaceKnowledgeChunk(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey('workspaces.Workspace', on_delete=models.CASCADE, related_name='ai_knowledge_chunks')
    source_type = models.CharField(max_length=50)
    source_id = models.CharField(max_length=100, blank=True, default='')
    text = models.TextField()
    embedding_vector = models.JSONField(default=list, blank=True)
    embedding_model = models.CharField(max_length=100, blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['workspace', 'source_type']),
            models.Index(fields=['workspace', 'updated_at']),
        ]

    def __str__(self):
        return f'{self.workspace_id} {self.source_type} {self.source_id}'.strip()


class AIInteraction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey('workspaces.Workspace', on_delete=models.CASCADE, related_name='ai_interactions')
    organization = models.ForeignKey('finances.Organization', on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_interactions')
    entity = models.ForeignKey('finances.Entity', on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_interactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_interactions')
    intent = models.CharField(max_length=100)
    input_payload = models.JSONField(default=dict, blank=True)
    claude_request = models.JSONField(default=dict, blank=True)
    claude_response = models.JSONField(default=dict, blank=True)
    raw_claude_response = models.JSONField(default=dict, blank=True)
    tools_used = models.JSONField(default=list, blank=True)
    output_payload = models.JSONField(default=dict, blank=True)
    model_name = models.CharField(max_length=100, blank=True, default='')
    prompt_version = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, choices=AIInteractionStatus.choices, default=AIInteractionStatus.SUCCEEDED)
    confidence = models.CharField(max_length=20, blank=True, default='')
    feedback_outcome = models.CharField(max_length=20, choices=AIFeedbackOutcome.choices, default=AIFeedbackOutcome.PENDING)
    feedback_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['workspace', 'intent', 'created_at']),
            models.Index(fields=['workspace', 'feedback_outcome']),
            models.Index(fields=['organization', 'created_at']),
        ]

    def __str__(self):
        return f'{self.workspace_id} {self.intent} {self.created_at.isoformat()}'


class WorkspaceAIPrecedent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey('workspaces.Workspace', on_delete=models.CASCADE, related_name='ai_precedents')
    interaction = models.ForeignKey(AIInteraction, on_delete=models.SET_NULL, null=True, blank=True, related_name='precedents')
    intent = models.CharField(max_length=100)
    feedback_outcome = models.CharField(max_length=20, choices=AIFeedbackOutcome.choices)
    example_payload = models.JSONField(default=dict, blank=True)
    proposed_treatment = models.JSONField(default=dict, blank=True)
    final_treatment = models.JSONField(default=dict, blank=True)
    rationale = models.TextField(blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['workspace', 'intent', 'active']),
            models.Index(fields=['workspace', 'feedback_outcome', 'updated_at']),
        ]

    def __str__(self):
        return f'{self.workspace_id} {self.intent} {self.feedback_outcome}'
