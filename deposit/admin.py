from django.contrib import admin

from deposit.models import deposit

# Register your models here.
@admin.register(deposit)
class kycModel(admin.ModelAdmin):
    list_display = ('kyc','amount','interest_type')
