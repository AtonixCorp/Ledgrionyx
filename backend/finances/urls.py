from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, IncomeViewSet, BudgetViewSet

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet)
router.register(r'income', IncomeViewSet)
router.register(r'budgets', BudgetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
