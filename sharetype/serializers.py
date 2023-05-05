from rest_framework import serializers

from sharetype.models import sharetype

class sharetypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = sharetype
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}


