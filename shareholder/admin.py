from django.contrib import admin
from shareholder.models import shareholder

# Register your models here.
@admin.register(shareholder)
class shareholderModel(admin.ModelAdmin):
    list_display = ['number_of_shares']
