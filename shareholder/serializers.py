from rest_framework import serializers
from shareholder.models import shareholder
from kyc.serializers import kycSerializer
from sharetype.serializers import sharetypeSerializer

class shareholderSerializer(serializers.ModelSerializer):
    kyc_detail = kycSerializer(read_only=True,source="kyc")
    share_detail = sharetypeSerializer(read_only=True,source="share_type")


    class Meta:
        model = shareholder
        fields = '__all__'
        extra_kwargs = {'created_by': {'default': serializers.CurrentUserDefault(),'read_only':True},'updated_by': {'default': serializers.CurrentUserDefault(),'read_only':True}}
        


