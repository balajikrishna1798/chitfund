from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import TokenAuthentication
from shareholder.models import shareholder
from shareholder.serializers import shareholderSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework import status,filters


# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 10000

class shareholderViewSet(viewsets.ModelViewSet):
    queryset = shareholder.objects.all()
    serializer_class = shareholderSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['slug']
    
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
