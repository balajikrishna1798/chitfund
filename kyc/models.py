from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from basemodel.utils import unique_slugify
from basemodel.models import BaseModel
# Create your models here.

class kyc(BaseModel):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    country = models.CharField(max_length=40)
    state = models.CharField(max_length=40)
    address = models.CharField(max_length=100)
    city = models.CharField(max_length=40)
    mobile_number = models.CharField(max_length=15)
    email = models.EmailField(max_length=254, null=True, blank=True)
    pan = models.CharField(max_length=10, unique=True)
    active = models.BooleanField(default=True)
    balance = models.IntegerField(default=0)
    slug = models.SlugField(unique=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,
                                   related_name='created_by')
    updated_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE,
                                   related_name='updated_by')

    def __str__(self) -> str:
        return str(self.id)


@receiver(post_save, sender=kyc)
def add_slug(sender, instance, created, **kwargs):
    if created:
        if not instance.slug:
            slug_str = "%s %s" % ("RSK", instance.id)
            unique_slugify(
                instance, slug_str, queryset=instance.__class__._default_manager.all(), slug_separator="")
            instance.save()
