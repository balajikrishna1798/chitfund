import django_filters.rest_framework
from .models import *

class DepositFilter(django_filters.FilterSet):
   
    class Meta:
        model = deposit
        fields = ['deposited_on',"maturity_term"]
        filter_overrides = {
            models.DateTimeField: {
                'filter_class': django_filters.DateFromToRangeFilter,
                'extra': lambda f: {
                    'lookup_expr': 'icontains',
                },
            },
        }

class PayableFilter(django_filters.FilterSet):
  
    class Meta:
        model = payable
        fields = ['due_date']
        filter_overrides = {
            models.DateTimeField: {
                'filter_class': django_filters.DateFromToRangeFilter,
                'extra': lambda f: {
                    'lookup_expr': 'icontains',
                },
            },
        }

class PaymentFilter(django_filters.FilterSet):
  
    class Meta:
        model = payment
        fields = ['created_at']
        filter_overrides = {
            models.DateTimeField: {
                'filter_class': django_filters.DateFromToRangeFilter,
                'extra': lambda f: {
                    'lookup_expr': 'icontains',
                },
            },
        }