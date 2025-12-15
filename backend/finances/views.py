from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Expense, Income, Budget
from .serializers import ExpenseSerializer, IncomeSerializer, BudgetSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing expenses
    """
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    def perform_create(self, serializer):
        """Update budget spent amount when creating expense"""
        expense = serializer.save()
        # Update budget if category matches
        try:
            budget = Budget.objects.get(category=expense.category)
            budget.spent += expense.amount
            budget.save()
        except Budget.DoesNotExist:
            pass

    def perform_destroy(self, instance):
        """Update budget spent amount when deleting expense"""
        # Update budget if category matches
        try:
            budget = Budget.objects.get(category=instance.category)
            budget.spent = max(0, budget.spent - instance.amount)
            budget.save()
        except Budget.DoesNotExist:
            pass
        instance.delete()

    @action(detail=False, methods=['get'])
    def total(self, request):
        """Get total expenses"""
        total = self.queryset.aggregate(Sum('amount'))['amount__sum'] or 0
        return Response({'total': total})

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get expenses grouped by category"""
        from django.db.models import Sum
        expenses_by_category = (
            self.queryset.values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        return Response(expenses_by_category)


class IncomeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing income
    """
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer

    @action(detail=False, methods=['get'])
    def total(self, request):
        """Get total income"""
        total = self.queryset.aggregate(Sum('amount'))['amount__sum'] or 0
        return Response({'total': total})


class BudgetViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing budgets
    """
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get budget summary"""
        budgets = self.queryset.all()
        total_limit = sum(b.limit for b in budgets)
        total_spent = sum(b.spent for b in budgets)
        return Response({
            'total_limit': total_limit,
            'total_spent': total_spent,
            'total_remaining': total_limit - total_spent,
            'count': budgets.count()
        })
