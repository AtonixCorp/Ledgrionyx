from django.test import TestCase
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from decimal import Decimal
from .models import Expense, Income, Budget


class ExpenseModelTest(TestCase):
    def test_create_expense(self):
        expense = Expense.objects.create(
            description="Test Expense",
            amount=Decimal("50.00"),
            category="Food",
            date=timezone.now().date()
        )
        self.assertEqual(expense.description, "Test Expense")
        self.assertEqual(expense.amount, Decimal("50.00"))


class IncomeModelTest(TestCase):
    def test_create_income(self):
        income = Income.objects.create(
            source="Test Income",
            amount=Decimal("1000.00"),
            date=timezone.now().date()
        )
        self.assertEqual(income.source, "Test Income")
        self.assertEqual(income.amount, Decimal("1000.00"))


class BudgetModelTest(TestCase):
    def test_create_budget(self):
        budget = Budget.objects.create(
            category="Food",
            limit=Decimal("500.00"),
            spent=Decimal("200.00")
        )
        self.assertEqual(budget.remaining, Decimal("300.00"))
        self.assertEqual(budget.percentage_used, 40.0)


class PlatformIntegrationViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_endpoint_is_public(self):
        response = self.client.get('/api/health/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'ok')
        self.assertEqual(response.data['checks']['database'], 'ok')

    @override_settings(PLATFORM_EVENT_TOKEN='test-platform-token')
    def test_platform_event_requires_token(self):
        response = self.client.post(
            '/api/platform/events/',
            {'event_type': 'deployment', 'source': 'bitbucket', 'environment': 'dev', 'status': 'succeeded'},
            format='json',
        )

        self.assertEqual(response.status_code, 401)

    @override_settings(PLATFORM_EVENT_TOKEN='test-platform-token')
    def test_platform_event_accepts_valid_payload(self):
        response = self.client.post(
            '/api/platform/events/',
            {
                'event_type': 'deployment',
                'source': 'bitbucket',
                'environment': 'dev',
                'status': 'succeeded',
                'service': 'backend',
            },
            format='json',
            HTTP_AUTHORIZATION='Bearer test-platform-token',
        )

        self.assertEqual(response.status_code, 202)
        self.assertTrue(response.data['accepted'])
