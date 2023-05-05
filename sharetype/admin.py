from django.contrib import admin

from sharetype.models import sharetype

# Register your models here.
@admin.register(sharetype)
class kycModel(admin.ModelAdmin):
    list_display = ('share_type','share_value')