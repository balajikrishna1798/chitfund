from rest_framework import routers
from django.urls import path,include
from .views import shareholderViewSet
router = routers.DefaultRouter()
router.register('shareholder',shareholderViewSet,basename="shareholder")

urlpatterns = [
    path("",include(router.urls))
]
