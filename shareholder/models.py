from django.db import models
from django.contrib.auth.models import User
from kyc.models import kyc
from sharetype.models import sharetype
from basemodel.models import BaseModel
from django.db.models.signals import post_save
from django.dispatch import receiver
from basemodel.utils import unique_slugify

# Create your models here.
class shareholder(BaseModel):
    kyc = models.ForeignKey(kyc, null=True, on_delete=models.CASCADE,related_name="shareholder")
    share_type = models.ForeignKey(sharetype, null=True, on_delete=models.CASCADE)
    number_of_shares = models.IntegerField(null=False,blank=False)
    starting_share = models.IntegerField(null=True,blank=True)
    ending_share = models.IntegerField(null=True,blank=True)
    active = models.BooleanField(default=True)
    slug = models.SlugField(null=True,blank=True,unique=True)
    created_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='created_by_shareholder')
    updated_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by_shareholder')

@receiver(post_save,sender=shareholder)
def add_slug(sender,instance,created,**kwargs):
    if created:
        if not instance.slug:
            slug_str = "%s %s" % ("RSSH",instance.id)
            unique_slugify(instance, slug_str,queryset=instance.__class__._default_manager.all(),slug_separator="")
            instance.save()