from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import TokenAuthentication
from sharetype.models import sharetype
from sharetype.serializers import sharetypeSerializer
# Create your views here.
class sharetypeViewSet(viewsets.ModelViewSet):
    queryset = sharetype.objects.all()
    serializer_class = sharetypeSerializer
    permission_classes = [IsAdminUser]
    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)
