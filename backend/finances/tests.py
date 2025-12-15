from django.test import TestCase
from django.utils import timezone
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
