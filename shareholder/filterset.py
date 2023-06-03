import django_filters.rest_framework
from sharetype.models import sharetype
from .models import *
from django.db.models import Q

class SharetypeFilter(django_filters.FilterSet):

    class Meta:
        model = sharetype
        fields = ['share_type']
        filter_overrides = {
            models.CharField: {
                'filter_class': django_filters.CharFilter,
                'extra': lambda f: {
                    'lookup_expr': 'gte',
                },
            },  
        }
