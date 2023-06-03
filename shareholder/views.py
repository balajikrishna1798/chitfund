from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import TokenAuthentication
from shareholder.models import shareholder
from shareholder.serializers import shareholderSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework import filters
import django_filters.rest_framework
from django.db.models import Count,Q,Sum


# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = 'page_size'
    max_page_size = 1000

class shareholderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = shareholder.objects.all().order_by("slug").annotate(deposit_count=Count("kyc__deposit", distinct=True),total_due_amount=Sum("kyc__loan__due__due_amount",filter=Q(kyc__loan__due__active=True),distinct=True),total_payable_amount=Sum("kyc__deposit__payable__payable_amount",filter=Q(kyc__deposit__payable__active=True),distinct=True),loan_count=Count("kyc__loan", distinct=True),due_count=Count("kyc__loan__due",filter=Q(kyc__loan__due__active=True), distinct=True))
    serializer_class = shareholderSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['slug','kyc__first_name','kyc__slug']

    def perform_create(self, serializer):
        user = self.request.user
        if(shareholder.objects.count()<=0):
            starting_share = 0
            ending_share = starting_share + self.request.data.get("number_of_shares")
        else:
            starting_share= shareholder.objects.all().last().ending_share
            ending_share = starting_share + self.request.data.get("number_of_shares")

        serializer.save(created_by=user,starting_share=starting_share+1,ending_share=ending_share)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)
