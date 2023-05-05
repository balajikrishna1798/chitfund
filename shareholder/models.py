from django.db import models
from django.contrib.auth.models import User
from kyc.models import kyc
from sharetype.models import sharetype
from basemodel.models import BaseModel

# Create your models here.
class shareholder(BaseModel):
    kyc = models.ForeignKey(kyc, null=True, on_delete=models.CASCADE)
    number_of_shares = models.IntegerField(null=False,blank=False)
    starting_share = models.IntegerField(null=False,blank=False)
    ending_share = models.IntegerField(null=False,blank=False)
    share_type = models.ForeignKey(sharetype, null=True, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='created_by_shareholder')
    updated_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by_shareholder')
