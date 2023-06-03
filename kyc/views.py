from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from kyc.models import kyc
from kyc.serializers import kycSerializer
from rest_framework import status,filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count,Sum
from django.db.models import OuterRef,Exists,Q
from shareholder.models import shareholder

# Create your views here.

class kycViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAdminUser]
    queryset = kyc.objects.all().annotate(deposit_count=Count("deposit", distinct=True),loan_count=Count("loan", distinct=True),due_count=Count("loan__due",filter=Q(loan__due__active=True),distinct=True),payable_count=Count("deposit__payable",filter=Q(loan__due__active=True),distinct=True),is_shareholder=Exists(shareholder.objects.filter(kyc=OuterRef('pk'))))
    
    serializer_class = kycSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name','pan','email','mobile_number','slug']

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
        qs = kyc.objects.annotate(is_shareholder=Exists(shareholder.objects.filter(kyc=OuterRef('pk')))).filter(is_shareholder=True)
        return Response(kycSerializer(qs,many=True).data)

