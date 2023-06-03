from rest_framework import serializers
from shareholder.models import shareholder
from kyc.serializers import kycSerializer
from sharetype.serializers import sharetypeSerializer
from loan.serializers import loanSerializer

class shareholderSerializer(serializers.ModelSerializer):
    kyc_detail = kycSerializer(read_only=True,source="kyc")
    share_detail = sharetypeSerializer(read_only=True,source="share_type")
    total_due_amount = serializers.IntegerField(read_only=True)
    total_payable_amount = serializers.IntegerField(read_only=True)
    deposit_count = serializers.IntegerField(read_only=True)
    loan_count = serializers.IntegerField(read_only=True)
    due_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = shareholder
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}
        


