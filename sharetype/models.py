from django.db import models

from basemodel.models import BaseModel
from .utils import ShareTypes
from django.contrib.auth.models import User
# Create your models here.
class sharetype(BaseModel):
    share_value = models.DecimalField(max_digits=10, decimal_places=2,null=False,blank=False)
    share_type = models.CharField(max_length=10,choices=ShareTypes.choices(), default=ShareTypes.Pref)
    created_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='created_by_sharetype')
    updated_by =  models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by_sharetype')
    
    def __str__(self) -> str:
        return str(self.id)
    