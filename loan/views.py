from rest_framework import viewsets
from loan.models import loan,due,payment
from loan.serializers import loanSerializer,dueSerializer,paymentSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 10000


class loanViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = loan.objects.all()
    serializer_class = loanSerializer
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)

class LoanViews(APIView):
    def get(self, request, format=None):
       queryset = loan.objects.all()
       serializer = loanSerializer(queryset, many=True)
       return Response(serializer.data)
    
class dueViewSet(viewsets.ModelViewSet):
    queryset = due.objects.all()
    serializer_class = dueSerializer

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)

class paymentViewSet(viewsets.ModelViewSet):
    queryset = payment.objects.all()
    serializer_class = paymentSerializer
    
    def perform_create(self, serializer):
       
       
        serializer.save()
        

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)