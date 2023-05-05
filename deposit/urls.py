from rest_framework import routers
from django.urls import path,include
from .views import depositViewSet
router = routers.DefaultRouter()
router.register('deposit',depositViewSet,basename="deposit")

urlpatterns = [
    path("",include(router.urls))
]
