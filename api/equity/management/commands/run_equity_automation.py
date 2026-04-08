from __future__ import annotations

import time

from django.core.management.base import BaseCommand
from django.utils import timezone

from equity.scenario_services import run_scenario_approval_sla_sweep
from equity.services import run_vesting_notification_sweep


class Command(BaseCommand):
    help = 'Run scheduled equity automation tasks such as vesting notifications and scenario approval SLA sweeps.'

    def add_arguments(self, parser):
        parser.add_argument('--interval-seconds', type=int, default=300, help='Polling interval when running continuously.')
        parser.add_argument('--loop', action='store_true', help='Keep running the automation sweep on an interval.')
        parser.add_argument('--reminder-days', nargs='*', type=int, default=[30, 7, 1], help='Reminder windows for upcoming vesting notifications.')
        parser.add_argument('--skip-vesting', action='store_true', help='Skip the vesting reminder sweep.')
        parser.add_argument('--skip-scenario-sla', action='store_true', help='Skip the scenario approval SLA sweep.')

    def handle(self, *args, **options):
        interval = max(int(options['interval_seconds']), 30)
        reminder_days = tuple(sorted({int(day) for day in options['reminder_days'] if int(day) >= 0}, reverse=True)) or (30, 7, 1)

        def run_once():
            outputs = {}
            if not options['skip_vesting']:
                outputs['vesting'] = run_vesting_notification_sweep(as_of=timezone.now().date(), reminder_days=reminder_days)
            if not options['skip_scenario_sla']:
                outputs['scenario_sla'] = run_scenario_approval_sla_sweep(as_of=timezone.now())
            self.stdout.write(self.style.SUCCESS(f"Equity automation sweep complete: {outputs}"))

        run_once()
        if not options['loop']:
            return

        self.stdout.write(self.style.WARNING(f'Running continuously every {interval} seconds. Press Ctrl+C to stop.'))
        while True:
            time.sleep(interval)
            run_once()