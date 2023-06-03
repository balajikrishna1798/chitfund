from django.db import models
from deposit.utils import InterestTypes
from kyc.models import kyc
from basemodel.models import BaseModel
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from basemodel.utils import unique_slugify

# Create your models here.
class deposit(BaseModel):
    kyc = models.ForeignKey(kyc, on_delete=models.CASCADE,related_name="deposit")
    amount = models.DecimalField(max_digits=10, decimal_places=4)
    interest_type = models.CharField(max_length=10,choices=InterestTypes.choices(), default=InterestTypes.TwelveMonths)
    deposited_on = models.DateTimeField(null=False)
    active = models.BooleanField(default=True)
    maturity_term = models.DateTimeField(null=True,blank=True)
    roi = models.DecimalField(max_digits=10, decimal_places=4)
    slug = models.SlugField(null=True,blank=True,unique=True)
    created_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='created_by_deposit')
    updated_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by_deposit')

@receiver(post_save,sender=deposit)
def add_slug(sender,instance,created,**kwargs):
    if created:
        if not instance.slug:
            slug_str = "%s %s" % ("RSD",instance.id)
            unique_slugify(instance, slug_str,queryset=instance.__class__._default_manager.all(),slug_separator="")
            instance.save()


class payable(BaseModel):
    deposit = models.ForeignKey(deposit, on_delete=models.CASCADE,related_name="payable")
    payable_amount = models.DecimalField(max_digits=10, decimal_places=4)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=4,default=0)
    due_date =  models.DateTimeField()
    active = models.BooleanField(default=True)
    
    def __str__(self) -> str:
        return str(self.id)
    
class payment(BaseModel):
    payable = models.ManyToManyField(payable,null=True,blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=4)
    active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='created_by_payment')
    updated_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by_payment')
    def __str__(self) -> str:
        return str(self.id)
    