from rest_framework import serializers
from loan.models import loan,due,payment
from kyc.serializers import kycSerializer


class loanSerializer(serializers.ModelSerializer):
    kyc_detail = kycSerializer(read_only=True,source="kyc")

    class Meta:
        model = loan
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}

class dueSerializer(serializers.ModelSerializer):
    loan_detail = loanSerializer(read_only=True,source="loan")
    class Meta:
        model = due
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}

class paymentSerializer(serializers.ModelSerializer):
    kyc_detail = kycSerializer(read_only=True,source="kyc")
    due_detail = dueSerializer(read_only=True,source="due",many=True)

    class Meta:
        model = payment
        fields = '__all__'
