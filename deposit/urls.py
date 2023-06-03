from rest_framework import routers
from django.urls import path,include
from .views import depositViewSet,payableViewSet,paymentViewSet,DepositViews
router = routers.DefaultRouter()
router.register('deposit',depositViewSet,basename="deposit")
router.register('payable',payableViewSet,basename="payable")
router.register('payment',paymentViewSet,basename="payment")

urlpatterns = [
    path("",include(router.urls)),
    path("all/",DepositViews.as_view())
]
