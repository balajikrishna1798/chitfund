from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from kyc.models import kyc
from kyc.serializers import kycSerializer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
# Create your views here.
class kycViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = kyc.objects.all()
    serializer_class = kycSerializer

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)


class KycView(APIView):
    def post(self, request):
        pan = request.data.get('pan')
        mobile_number = request.data.get('mobile_number')
        existing_pan = kyc.objects.filter(pan=pan).first()
        existing_mobile_number = kyc.objects.filter(mobile_number=mobile_number).first()
        if existing_pan:
            return Response({'pan_error': 'Pan already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if existing_mobile_number:
            return Response({'mobile_error': 'Mobile Number already exists'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'Success'}, status=status.HTTP_200_OK)
        
    

