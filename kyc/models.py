from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator

from basemodel.models import BaseModel
# Create your models here.

class kyc(BaseModel):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    country = models.CharField(max_length=40)
    state = models.CharField(max_length=40)
    address = models.CharField(max_length=100)
    city = models.CharField(max_length=40)
    mobile_number =  models.CharField(max_length=15,unique=True,validators=[RegexValidator(
        '^(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[789]\d{9}|(\d[ -]?){10}\d$', message="Enter a Valid Indian Phone Number")])
    email = models.EmailField(max_length = 254,null=True,blank=True)
    pan = models.CharField(max_length=10,unique=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,
                related_name='created_by')
    updated_by =  models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by')
    
    def __str__(self) -> str:
        return str(self.id)