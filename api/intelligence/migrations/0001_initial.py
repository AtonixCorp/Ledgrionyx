import django.db.models.deletion
import uuid

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('finances', '0028_rename_platform_foundation_indexes'),
        ('workspaces', '0004_backfill_entity_linked_workspaces'),
    ]

    operations = [
        migrations.CreateModel(
            name='GlobalKnowledgeDocument',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('source_type', models.CharField(default='text', max_length=50)),
                ('source', models.CharField(max_length=500)),
                ('jurisdiction', models.CharField(default='GLOBAL', max_length=50)),
                ('topic', models.CharField(max_length=100)),
                ('effective_date', models.DateField(blank=True, null=True)),
                ('content', models.TextField()),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['jurisdiction', 'topic', '-effective_date', '-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='WorkspaceAIProfile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('tax_preferences', models.JSONField(blank=True, default=dict)),
                ('equity_policies', models.JSONField(blank=True, default=dict)),
                ('compliance_profile', models.JSONField(blank=True, default=dict)),
                ('risk_tolerance', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium', max_length=20)),
                ('language_preferences', models.JSONField(blank=True, default=dict)),
                ('tone_preferences', models.JSONField(blank=True, default=dict)),
                ('feedback_history', models.JSONField(blank=True, default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('workspace', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='ai_profile', to='workspaces.workspace')),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='WorkspaceKnowledgeChunk',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('source_type', models.CharField(max_length=50)),
                ('source_id', models.CharField(blank=True, default='', max_length=100)),
                ('text', models.TextField()),
                ('embedding_vector', models.JSONField(blank=True, default=list)),
                ('embedding_model', models.CharField(blank=True, default='', max_length=100)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ai_knowledge_chunks', to='workspaces.workspace')),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='GlobalKnowledgeChunk',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('chunk_index', models.PositiveIntegerField(default=0)),
                ('text', models.TextField()),
                ('embedding_vector', models.JSONField(blank=True, default=list)),
                ('embedding_model', models.CharField(blank=True, default='', max_length=100)),
                ('jurisdiction', models.CharField(default='GLOBAL', max_length=50)),
                ('topic', models.CharField(max_length=100)),
                ('source', models.CharField(max_length=500)),
                ('effective_date', models.DateField(blank=True, null=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('document', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chunks', to='intelligence.globalknowledgedocument')),
            ],
            options={
                'ordering': ['jurisdiction', 'topic', 'chunk_index'],
                'unique_together': {('document', 'chunk_index')},
            },
        ),
        migrations.CreateModel(
            name='AIInteraction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('intent', models.CharField(max_length=100)),
                ('input_payload', models.JSONField(blank=True, default=dict)),
                ('claude_request', models.JSONField(blank=True, default=dict)),
                ('claude_response', models.JSONField(blank=True, default=dict)),
                ('raw_claude_response', models.JSONField(blank=True, default=dict)),
                ('tools_used', models.JSONField(blank=True, default=list)),
                ('output_payload', models.JSONField(blank=True, default=dict)),
                ('model_name', models.CharField(blank=True, default='', max_length=100)),
                ('prompt_version', models.CharField(blank=True, default='', max_length=100)),
                ('status', models.CharField(choices=[('succeeded', 'Succeeded'), ('fallback', 'Fallback'), ('failed', 'Failed')], default='succeeded', max_length=20)),
                ('confidence', models.CharField(blank=True, default='', max_length=20)),
                ('feedback_outcome', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('overridden', 'Overridden'), ('flagged', 'Flagged')], default='pending', max_length=20)),
                ('feedback_payload', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('entity', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ai_interactions', to='finances.entity')),
                ('organization', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ai_interactions', to='finances.organization')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ai_interactions', to=settings.AUTH_USER_MODEL)),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ai_interactions', to='workspaces.workspace')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='WorkspaceAIPrecedent',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('intent', models.CharField(max_length=100)),
                ('feedback_outcome', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('overridden', 'Overridden'), ('flagged', 'Flagged')], max_length=20)),
                ('example_payload', models.JSONField(blank=True, default=dict)),
                ('proposed_treatment', models.JSONField(blank=True, default=dict)),
                ('final_treatment', models.JSONField(blank=True, default=dict)),
                ('rationale', models.TextField(blank=True, default='')),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('interaction', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='precedents', to='intelligence.aiinteraction')),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ai_precedents', to='workspaces.workspace')),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
        migrations.AddIndex(
            model_name='globalknowledgedocument',
            index=models.Index(fields=['jurisdiction', 'topic'], name='intelligenc_jurisd_3a0ef3_idx'),
        ),
        migrations.AddIndex(
            model_name='globalknowledgedocument',
            index=models.Index(fields=['is_active', 'effective_date'], name='intelligenc_is_acti_a2720c_idx'),
        ),
        migrations.AddIndex(
            model_name='workspaceknowledgechunk',
            index=models.Index(fields=['workspace', 'source_type'], name='intelligenc_workspa_537fc7_idx'),
        ),
        migrations.AddIndex(
            model_name='workspaceknowledgechunk',
            index=models.Index(fields=['workspace', 'updated_at'], name='intelligenc_workspa_5ec996_idx'),
        ),
        migrations.AddIndex(
            model_name='globalknowledgechunk',
            index=models.Index(fields=['jurisdiction', 'topic'], name='intelligenc_jurisd_37054a_idx'),
        ),
        migrations.AddIndex(
            model_name='globalknowledgechunk',
            index=models.Index(fields=['effective_date'], name='intelligenc_effecti_88997f_idx'),
        ),
        migrations.AddIndex(
            model_name='aiinteraction',
            index=models.Index(fields=['workspace', 'intent', 'created_at'], name='intelligenc_workspa_028f32_idx'),
        ),
        migrations.AddIndex(
            model_name='aiinteraction',
            index=models.Index(fields=['workspace', 'feedback_outcome'], name='intelligenc_workspa_2ad83d_idx'),
        ),
        migrations.AddIndex(
            model_name='aiinteraction',
            index=models.Index(fields=['organization', 'created_at'], name='intelligenc_organiz_e69ed8_idx'),
        ),
        migrations.AddIndex(
            model_name='workspaceaiprecedent',
            index=models.Index(fields=['workspace', 'intent', 'active'], name='intelligenc_workspa_c1255d_idx'),
        ),
        migrations.AddIndex(
            model_name='workspaceaiprecedent',
            index=models.Index(fields=['workspace', 'feedback_outcome', 'updated_at'], name='intelligenc_workspa_d5be58_idx'),
        ),
    ]