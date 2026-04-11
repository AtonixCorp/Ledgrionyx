from django.db import migrations, models
import secrets


def backfill_member_codes(apps, schema_editor):
    WorkspaceMember = apps.get_model('workspaces', 'WorkspaceMember')
    existing_codes = set(
        WorkspaceMember.objects.exclude(member_code__isnull=True).exclude(member_code='').values_list('member_code', flat=True)
    )

    for member in WorkspaceMember.objects.filter(member_code__isnull=True).order_by('created_at', 'id'):
        candidate = None
        while candidate is None or candidate in existing_codes:
            candidate = f'{secrets.randbelow(1_000_000):06d}'
        member.member_code = candidate
        member.save(update_fields=['member_code'])
        existing_codes.add(candidate)


class Migration(migrations.Migration):

    dependencies = [
        ('workspaces', '0005_workspacemember_status_alter_workspacemember_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='workspacemember',
            name='member_code',
            field=models.CharField(blank=True, editable=False, max_length=6, null=True, unique=True),
        ),
        migrations.RunPython(backfill_member_codes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='workspacemember',
            name='member_code',
            field=models.CharField(editable=False, max_length=6, unique=True),
        ),
    ]