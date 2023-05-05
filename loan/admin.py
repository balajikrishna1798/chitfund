from django.contrib import admin
from loan.models import loan

# Register your models here.
@admin.register(loan)
class kycModel(admin.ModelAdmin):
    list_display = ('kyc','amount','interest_type')
