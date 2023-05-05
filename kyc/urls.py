from kyc import views
from rest_framework import routers
from django.urls import path,include
from .views import kycViewSet
router = routers.DefaultRouter()
router.register('kyc',kycViewSet,basename="kyc")

urlpatterns = [
    path("",include(router.urls)),
    path('validation/',views.KycView.as_view())
]
