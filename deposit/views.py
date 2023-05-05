from rest_framework import viewsets
from deposit.models import deposit
from deposit.serializers import depositSerializer
from rest_framework.permissions import IsAdminUser

# Create your views here.
class depositViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]

    queryset = deposit.objects.all()
    serializer_class = depositSerializer

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)