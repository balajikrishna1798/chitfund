from django.db import models
from basemodel.utils import unique_slugify
from kyc.models import kyc
from basemodel.models import BaseModel
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from loan.utils import InterestTypes,Emi_Periods


# Create your models here.
class loan(BaseModel):
    kyc = models.ForeignKey(kyc, on_delete=models.CASCADE,related_name="loan")
    amount = models.DecimalField(max_digits=10, decimal_places=4)
    interest_type = models.CharField(max_length=10,choices=InterestTypes.choices(), default=InterestTypes.Termloan)
    emi_period = models.CharField(max_length=10,choices=Emi_Periods.choices(),null=True,blank=True)
    loan_date_on = models.DateTimeField()
    active = models.BooleanField(default=True)
    roi = models.DecimalField(max_digits=10, decimal_places=4)
    maturity_term = models.DateTimeField(null=True,blank=True)
    slug = models.SlugField(null=True,blank=True,unique=True)
    created_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='created_by_loan')
    updated_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by_loan')

    def __str__(self) -> str:
        return str(self.id)
    

class due(BaseModel):
    loan = models.ForeignKey(loan, on_delete=models.CASCADE,related_name="due")
    due_amount = models.DecimalField(max_digits=10, decimal_places=4)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=4,default=0)
    due_date =  models.DateTimeField()
    active = models.BooleanField(default=True)
    
    def __str__(self) -> str:
        return str(self.id)
    

    
class receipt(BaseModel):
    due = models.ManyToManyField(due,null=True,blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=4)
    active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='created_by_receipt')
    updated_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by_receipt')
    def __str__(self) -> str:
        return str(self.due)
    

@receiver(post_save,sender=loan)
def add_slug(sender,instance,created,**kwargs):
    if created:
        if not instance.slug:
            slug_str = "%s %s" % ("RSL",instance.id)
            unique_slugify(instance, slug_str,queryset=instance.__class__._default_manager.all(),slug_separator="")
            instance.save()
