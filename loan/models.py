from django.db import models
from basemodel.utils import unique_slugify
from kyc.models import kyc
from basemodel.models import BaseModel
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from loan.utils import InterestTypes,Emi_Periods
from django.db.models import OuterRef,Exists

# Create your models here.
class loan(BaseModel):
    kyc = models.ForeignKey(kyc, on_delete=models.CASCADE,related_name="loan")
    amount = models.DecimalField(max_digits=10, decimal_places=4)
    interest_type = models.CharField(max_length=10,choices=InterestTypes.choices(), default=InterestTypes.Termloan)
    emi_period = models.CharField(max_length=10,choices=Emi_Periods.choices(),null=True,blank=True)
    loan_date_on = models.DateTimeField()
    active = models.BooleanField(default=True)
    roi = models.DecimalField(max_digits=10, decimal_places=4)
    loan_closed_on = models.DateTimeField()
    slug = models.SlugField(null=True,blank=True,unique=True)
    created_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='created_by_loan')
    updated_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by_loan')



class due(BaseModel):
    loan = models.ForeignKey(loan, on_delete=models.CASCADE,related_name="due")
    due_amount = models.DecimalField(max_digits=10, decimal_places=4)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=4,default=0)
    due_date =  models.DateTimeField()
    active = models.BooleanField(default=True)

class payment(BaseModel):
    due = models.ManyToManyField(due,null=True,blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=4)
    active = models.BooleanField(default=False)

@receiver(post_save,sender=payment)
def update_due_amount(sender,instance,created,**kwargs):
  if created:
         for instances in payment.objects.all():
            due.objects.annotate(is_loaner=Exists(payment.objects.filter(id=OuterRef('pk')))).update(due_amount=instance.amount)
            instance.save()

@receiver(post_save,sender=loan)
def add_slug(sender,instance,created,**kwargs):
    if created:
        if not instance.slug:
            slug_str = "%s %s" % ("RSL",instance.id)
            unique_slugify(instance, slug_str,queryset=instance.__class__._default_manager.all(),slug_separator="")
            instance.save()
