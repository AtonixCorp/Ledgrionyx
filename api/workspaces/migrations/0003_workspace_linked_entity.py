from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('finances', '0028_rename_platform_foundation_indexes'),
        ('workspaces', '0002_workspacegroup_owner_cost_center'),
    ]

    operations = [
        migrations.AddField(
            model_name='workspace',
            name='linked_entity',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='linked_workspace', to='finances.entity'),
        ),
    ]