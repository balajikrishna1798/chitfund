from django.db import models
from kyc.models import kyc
from basemodel.models import BaseModel
from django.contrib.auth.models import User

from loan.utils import InterestTypes
# Create your models here.
class loan(BaseModel):
    kyc = models.ForeignKey(kyc, null=True, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    interest_type = models.CharField(max_length=10,choices=InterestTypes.choices(), default=InterestTypes.Emi)
    loan_date_on = models.DateTimeField()
    active = models.BooleanField(default=True)
    loan_closed_on = models.DateTimeField()
    created_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='created_by_loan')
    updated_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by_loan')
