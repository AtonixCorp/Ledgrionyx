from django.db import models


class Expense(models.Model):
    """Model for tracking expenses"""
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.description} - ${self.amount} ({self.category})"


class Income(models.Model):
    """Model for tracking income"""
    source = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.source} - ${self.amount}"


class Budget(models.Model):
    """Model for tracking budgets by category"""
    category = models.CharField(max_length=100, unique=True)
    limit = models.DecimalField(max_digits=10, decimal_places=2)
    spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    color = models.CharField(max_length=7, default='#3498db')  # Hex color code
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.category} - ${self.spent}/${self.limit}"

    @property
    def percentage_used(self):
        """Calculate percentage of budget used"""
        if self.limit > 0:
            return (self.spent / self.limit) * 100
        return 0

    @property
    def remaining(self):
        """Calculate remaining budget"""
        return self.limit - self.spent
