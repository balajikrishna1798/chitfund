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
    kyc = models.ForeignKey(kyc, on_delete=models.CASCADE,related_name="kyc")
    amount = models.DecimalField(max_digits=10, decimal_places=4,null=False,blank=False)
    interest_type = models.CharField(max_length=10,choices=InterestTypes.choices(), default=InterestTypes.Monthly)
    deposited_on = models.DateTimeField(null=False)
    active = models.BooleanField(default=True)
    withdrawn_on = models.DateTimeField(null=False)
    roi = models.IntegerField()
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
