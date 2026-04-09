from django.db import migrations


DEFAULT_MODULES = [
    'overview', 'members', 'groups', 'meetings',
    'calendar', 'files', 'permissions', 'settings',
    'email', 'marketing',
]

FINANCE_DEPARTMENT_TEMPLATES = [
    ('Controllership', 'Owns accounting policy, chart of accounts governance, journal oversight, and close quality.', 'FIN-CTRL-100'),
    ('Accounts Payable', 'Runs supplier operations, invoice workflows, payment approvals, and outbound obligations.', 'FIN-AP-110'),
    ('Accounts Receivable', 'Manages customer billing, collections, receivables aging, and cash application.', 'FIN-AR-120'),
    ('Treasury', 'Handles cash positioning, liquidity planning, banking operations, and payment execution.', 'FIN-TRSY-130'),
    ('Payroll', 'Coordinates payroll operations, pay runs, banking outputs, and payroll-linked obligations.', 'FIN-PAY-140'),
    ('Tax', 'Oversees tax calculations, monitoring, filings, deadlines, and cross-jurisdiction compliance.', 'FIN-TAX-150'),
    ('FP&A', 'Drives budgeting, forecasting, planning cycles, management targets, and variance analysis.', 'FIN-FPA-160'),
    ('Financial Reporting', 'Produces statements, management packs, analytics, board reporting, and formal financial outputs.', 'FIN-REP-170'),
    ('Risk, Audit, and Compliance', 'Owns audit readiness, compliance controls, risk visibility, approvals, and close governance.', 'FIN-RISK-180'),
    ('Intercompany and Consolidation', 'Coordinates intercompany operations, eliminations, consolidation control, and multi-entity reporting.', 'FIN-CONS-190'),
]


def backfill_entity_linked_workspaces(apps, schema_editor):
    Entity = apps.get_model('finances', 'Entity')
    Workspace = apps.get_model('workspaces', 'Workspace')
    WorkspaceGroup = apps.get_model('workspaces', 'WorkspaceGroup')
    WorkspaceMember = apps.get_model('workspaces', 'WorkspaceMember')
    WorkspaceModule = apps.get_model('workspaces', 'WorkspaceModule')

    for entity in Entity.objects.select_related('organization__owner'):
        workspace = Workspace.objects.filter(linked_entity_id=entity.id).first()
        if workspace is None:
            workspace = Workspace.objects.create(
                owner=entity.organization.owner,
                linked_entity_id=entity.id,
                name=entity.name,
                description=f'Collaboration workspace for {entity.name}',
                tier='free',
                status='active',
            )

        WorkspaceMember.objects.get_or_create(
            workspace_id=workspace.id,
            user_id=entity.organization.owner_id,
            defaults={'role': 'owner'},
        )

        for module_key in DEFAULT_MODULES:
            WorkspaceModule.objects.get_or_create(
                workspace_id=workspace.id,
                module_key=module_key,
                defaults={'enabled': True},
            )

        for name, description, cost_center in FINANCE_DEPARTMENT_TEMPLATES:
            WorkspaceGroup.objects.get_or_create(
                workspace_id=workspace.id,
                name=name,
                defaults={
                    'description': description,
                    'owner_id': entity.organization.owner_id,
                    'cost_center': cost_center,
                },
            )


class Migration(migrations.Migration):

    dependencies = [
        ('workspaces', '0003_workspace_linked_entity'),
        ('finances', '0028_rename_platform_foundation_indexes'),
    ]

    operations = [
        migrations.RunPython(backfill_entity_linked_workspaces, migrations.RunPython.noop),
    ]
