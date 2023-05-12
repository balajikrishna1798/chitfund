from rest_framework import serializers
from kyc.models import kyc
class kycSerializer(serializers.ModelSerializer):
    is_shareholder = serializers.BooleanField(read_only=True)
    loan_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = kyc
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}



