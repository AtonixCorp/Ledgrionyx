from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def seed_existing_department_metadata(apps, schema_editor):
    WorkspaceGroup = apps.get_model('workspaces', 'WorkspaceGroup')
    Workspace = apps.get_model('workspaces', 'Workspace')

    cost_centers = {
        'Controllership': 'FIN-CTRL-100',
        'Accounts Payable': 'FIN-AP-110',
        'Accounts Receivable': 'FIN-AR-120',
        'Treasury': 'FIN-TRSY-130',
        'Payroll': 'FIN-PAY-140',
        'Tax': 'FIN-TAX-150',
        'FP&A': 'FIN-FPA-160',
        'Financial Reporting': 'FIN-REP-170',
        'Risk, Audit, and Compliance': 'FIN-RISK-180',
        'Intercompany and Consolidation': 'FIN-CONS-190',
    }

    for department in WorkspaceGroup.objects.select_related('workspace').all():
        updates = []
        if not department.owner_id:
            workspace = Workspace.objects.get(pk=department.workspace_id)
            department.owner_id = workspace.owner_id
            updates.append('owner')
        if not department.cost_center:
            department.cost_center = cost_centers.get(department.name, '')
            updates.append('cost_center')
        if updates:
            department.save(update_fields=updates)


class Migration(migrations.Migration):

    dependencies = [
        ('workspaces', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='workspacegroup',
            name='cost_center',
            field=models.CharField(blank=True, default='', max_length=64),
        ),
        migrations.AddField(
            model_name='workspacegroup',
            name='owner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='workspace_department_ownerships', to=settings.AUTH_USER_MODEL),
        ),
        migrations.RunPython(seed_existing_department_metadata, migrations.RunPython.noop),
    ]
