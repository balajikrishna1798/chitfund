from django.db import models
from deposit.utils import InterestTypes
from kyc.models import kyc
from basemodel.models import BaseModel
from django.contrib.auth.models import User
# Create your models here.
class deposit(BaseModel):
    kyc = models.ForeignKey(kyc, null=True, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2,null=False,blank=False)
    interest_type = models.CharField(max_length=10,choices=InterestTypes.choices(), default=InterestTypes.Monthly)
    deposited_on = models.DateTimeField(null=False)
    active = models.BooleanField(default=True)
    withdrawn_on = models.DateTimeField(null=False)
    created_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='created_by_deposit')
    updated_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by_deposit')
