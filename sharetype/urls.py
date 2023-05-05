from rest_framework import routers
from django.urls import path,include
from .views import sharetypeViewSet
router = routers.DefaultRouter()
router.register('sharetype',sharetypeViewSet,basename="sharetype")

urlpatterns = [
    path("",include(router.urls))
]
