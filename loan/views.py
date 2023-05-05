from rest_framework import viewsets
from loan.models import loan
from loan.serializers import loanSerializer
from rest_framework.permissions import IsAdminUser

from rest_framework.authentication import TokenAuthentication


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