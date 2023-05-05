from rest_framework import serializers
from deposit.models import deposit
from kyc.models import kyc
from kyc.serializers import kycSerializer

class depositSerializer(serializers.ModelSerializer):
    kyc_detail = kycSerializer(read_only=True,source="kyc")

    class Meta:
        model = deposit
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}
