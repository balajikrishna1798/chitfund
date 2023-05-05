from rest_framework import routers
from django.urls import path,include
from .views import indexs

urlpatterns = [
    path("",indexs)
]
