from rest_framework import viewsets
from loan.models import loan,due,payment
from kyc.models import kyc
from loan.serializers import loanSerializer,dueSerializer,paymentSerializer
from kyc.serializers import kycSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from shareholder.models import shareholder
from django.db.models import OuterRef,Exists
# Create your views here.
class loanViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = loan.objects.all()
    serializer_class = loanSerializer

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)

class kycShareholder(APIView):
    permission_classes = [IsAdminUser]
    def get(self,request):
        qs = kyc.objects.annotate(is_shareholder=Exists(shareholder.objects.filter(kyc_id=OuterRef('pk')))).filter(is_shareholder=True)
        return Response(kycSerializer(qs,many=True).data)
    
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