from django.contrib import admin

from kyc.models import kyc


# Register your models here.
@admin.register(kyc)
class kycModel(admin.ModelAdmin):
    list_display = ('first_name','pan')
