from rest_framework import serializers

from loan.models import loan
from kyc.serializers import kycSerializer


class loanSerializer(serializers.ModelSerializer):
    # rate_of_interest = serializers.SerializerMethodField()
    kyc_detail = kycSerializer(read_only=True,source="kyc")
    class Meta:
        model = loan
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}

