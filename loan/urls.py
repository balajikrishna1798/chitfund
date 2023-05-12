from rest_framework import routers
from django.urls import path,include
from .views import *
router = routers.DefaultRouter()
router.register('loan',loanViewSet,basename="loan")
router.register('due',dueViewSet,basename="due")
router.register('payment',paymentViewSet,basename="payment")

urlpatterns = [
    path("",include(router.urls)),
    path("kycShareholder/",kycShareholder.as_view())
]
