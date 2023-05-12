from kyc import views
from rest_framework import routers
from django.urls import path,include
from .views import kycViewSet,kycShareholder

router = routers.DefaultRouter()
router.register('kyc',kycViewSet,basename="kyc")

urlpatterns = [
    path("",include(router.urls)),
    path("all/",views.KycViews.as_view()),
    path("kycShareholder/",kycShareholder.as_view()),
    path('validation/',views.KycValidationView.as_view())
]
