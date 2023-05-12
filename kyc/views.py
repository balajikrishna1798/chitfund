from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from kyc.models import kyc
from kyc.serializers import kycSerializer
from rest_framework import status,filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from rest_framework.pagination import PageNumberPagination
from django.db.models import OuterRef,Exists
from shareholder.models import shareholder

# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 10000

class kycViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAdminUser]
    queryset = kyc.objects.all().annotate(loan_count=Count("loan"))
    serializer_class = kycSerializer
    pagination_class = StandardResultsSetPagination

    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'mobile_number','slug']
    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)

class KycViews(APIView):
    def get(self, request, format=None):
       queryset = kyc.objects.all()
       serializer = kycSerializer(queryset, many=True)
       return Response(serializer.data)
    
class KycValidationView(APIView):
    def post(self, request):
        pan = request.data.get('pan')
        existing_pan = kyc.objects.filter(pan=pan).first()
        if existing_pan:
            return Response({'pan_error': 'Pan already exists'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'Success'}, status=status.HTTP_200_OK)
        
class kycShareholder(APIView):
    permission_classes = [IsAdminUser]
    def get(self,request):
        qs = kyc.objects.annotate(is_shareholder=Exists(shareholder.objects.filter(kyc_id=OuterRef('pk')))).filter(is_shareholder=True)
        return Response(kycSerializer(qs,many=True).data)

