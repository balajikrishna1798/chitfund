from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import TokenAuthentication
from sharetype.models import sharetype
from sharetype.serializers import sharetypeSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 10000

class sharetypeViewSet(viewsets.ModelViewSet):
    queryset = sharetype.objects.all()
    serializer_class = sharetypeSerializer
    # permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)

class SharetypeViews(APIView):
    def get(self, request, format=None):
       queryset = sharetype.objects.all()
       serializer = sharetypeSerializer(queryset, many=True)
       return Response(serializer.data)