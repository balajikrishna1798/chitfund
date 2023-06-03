import django_filters.rest_framework
from .models import *

class LoanFilter(django_filters.FilterSet):
  
    class Meta:
        model = loan
        fields = ['loan_date_on',"maturity_term"]
        filter_overrides = {
            models.DateTimeField: {
                'filter_class': django_filters.DateFromToRangeFilter,
                'extra': lambda f: {
                    'lookup_expr': 'icontains',
                },
            },
        }

class DueFilter(django_filters.FilterSet):
  
    class Meta:
        model = due
        fields = ['due_date']
        filter_overrides = {
            models.DateTimeField: {
                'filter_class': django_filters.DateFromToRangeFilter,
                'extra': lambda f: {
                    'lookup_expr': 'icontains',
                },
            },
        }


class ReceiptFilter(django_filters.FilterSet):
  
    class Meta:
        model = receipt
        fields = ['created_at']
        filter_overrides = {
            models.DateTimeField: {
                'filter_class': django_filters.DateFromToRangeFilter,
                'extra': lambda f: {
                    'lookup_expr': 'icontains',
                },
            },
        }