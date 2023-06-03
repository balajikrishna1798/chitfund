from rest_framework import serializers
from deposit.models import deposit,payable,payment
from kyc.models import kyc
from kyc.serializers import kycSerializer

class payableSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = payable
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}

class depositSerializer(serializers.ModelSerializer):
    kyc_detail = kycSerializer(read_only=True,source="kyc")
    payable = payableSerializer(read_only=True,many=True)

    class Meta:
        model = deposit
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}


class payableSerializer(serializers.ModelSerializer):
    deposit_detail = depositSerializer(read_only=True,source="deposit")
    
    class Meta:
        model = payable
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}

class paymentSerializer(serializers.ModelSerializer):
    payable_detail = payableSerializer(read_only=True,source="payable",many=True)

    class Meta:
        model = payment
        fields = '__all__'