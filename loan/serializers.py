from loan.models import loan,due,receipt
from kyc.serializers import kycSerializer
from rest_framework import serializers, fields

class dueSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = due
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}

class loanSerializer(serializers.ModelSerializer):
    kyc_detail = kycSerializer(read_only=True,source="kyc")
    due = dueSerializer(read_only=True,many=True)
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

class receiptSerializer(serializers.ModelSerializer):
    due_detail = dueSerializer(read_only=True,source="due",many=True)
    due_amount = serializers.DecimalField(max_digits=10,decimal_places=4,read_only=True)

    class Meta:
        model = receipt
        fields = '__all__'
