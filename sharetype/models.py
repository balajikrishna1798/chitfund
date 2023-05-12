from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from basemodel.utils import unique_slugify
from basemodel.models import BaseModel
from .utils import ShareTypes
from django.contrib.auth.models import User
# Create your models here.
class sharetype(BaseModel):
    share_value = models.DecimalField(max_digits=10, decimal_places=4,null=False,blank=False)
    share_type = models.CharField(max_length=10,choices=ShareTypes.choices(), default=ShareTypes.Pref)
    slug = models.SlugField(null=True,blank=True,unique=True)
    created_by = models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='created_by_sharetype')
    updated_by =  models.ForeignKey(User, null= True, blank= True, on_delete=models.CASCADE,
                related_name='updated_by_sharetype')
    
    def __str__(self) -> str:
        return str(self.id)
    
@receiver(post_save,sender=sharetype)
def add_slug(sender,instance,created,**kwargs):
    if created:
        if not instance.slug:
            slug_str = "%s %s" % ("RSST",instance.id)
            unique_slugify(instance, slug_str,queryset=instance.__class__._default_manager.all(),slug_separator="")
            instance.save()