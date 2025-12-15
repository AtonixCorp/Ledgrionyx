from rest_framework import serializers
from .models import Expense, Income, Budget


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'description', 'amount', 'category', 'date', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id', 'source', 'amount', 'date', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class BudgetSerializer(serializers.ModelSerializer):
    percentage_used = serializers.ReadOnlyField()
    remaining = serializers.ReadOnlyField()

    class Meta:
        model = Budget
        fields = ['id', 'category', 'limit', 'spent', 'color', 'percentage_used', 'remaining', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
