from rest_framework import routers
from django.urls import path,include
from .views import *
router = routers.DefaultRouter()
router.register('loan',loanViewSet,basename="loan")
router.register('due',dueViewSet,basename="due")
router.register('receipt',receiptViewSet,basename="receipt")


urlpatterns = [
    path("",include(router.urls)),
    path("all/",LoanViews.as_view())
]
