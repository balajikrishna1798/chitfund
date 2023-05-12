from rest_framework import routers
from django.urls import path,include
from .views import sharetypeViewSet
from sharetype import views

router = routers.DefaultRouter()
router.register('sharetype',sharetypeViewSet,basename="sharetype")

urlpatterns = [
    path("",include(router.urls)),
    path('ss/',views.SharetypeViews.as_view())
]
