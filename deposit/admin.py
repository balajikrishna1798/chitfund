from django.contrib import admin

from deposit.models import deposit,payable,payment

# Register your models here.
@admin.register(deposit)
class kycModel(admin.ModelAdmin):
    list_display = ('kyc','amount','interest_type')
@admin.register(payable)
class payableModel(admin.ModelAdmin):
    list_display = ('deposit_id','payable_amount','paid_amount')
@admin.register(payment)
class paymentModel(admin.ModelAdmin):
    list_display = ['amount']