from django.contrib import admin
from loan.models import loan,due,payment

# Register your models here.
@admin.register(loan)
class loanModel(admin.ModelAdmin):
    list_display = ('kyc','amount','interest_type')

@admin.register(due)
class dueModel(admin.ModelAdmin):
    list_display = ('loan','due_amount','paid_amount')

@admin.register(payment)
class paymentModel(admin.ModelAdmin):
    list_display = ['amount']
