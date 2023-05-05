from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import TokenAuthentication
from shareholder.models import shareholder
from shareholder.serializers import shareholderSerializer
# Create your views here.
class shareholderViewSet(viewsets.ModelViewSet):
    queryset = shareholder.objects.all()
    serializer_class = shareholderSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)
