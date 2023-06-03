import django_filters.rest_framework
from sharetype.models import sharetype
from .models import *

class KycFilter(django_filters.FilterSet):
    class Meta:
        model = sharetype
        fields = ['share_type']
        filter_overrides = {
            models.CharField: {
                'filter_class': django_filters.CharFilter,
                'extra': lambda f: {
                    'lookup_expr': 'icontains',
                },
            },
            
        }
