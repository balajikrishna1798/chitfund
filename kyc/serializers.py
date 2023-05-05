from rest_framework import serializers
from kyc.models import kyc
class kycSerializer(serializers.ModelSerializer):
    class Meta:
        model = kyc
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}



