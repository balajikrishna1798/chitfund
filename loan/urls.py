from rest_framework import routers
from django.urls import path,include
from .views import loanViewSet
router = routers.DefaultRouter()
router.register('loan',loanViewSet,basename="loan")

urlpatterns = [
    path("",include(router.urls))
]
