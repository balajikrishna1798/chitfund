from rest_framework import viewsets
from deposit.models import deposit,payable,payment
from deposit.serializers import depositSerializer,payableSerializer,paymentSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework import filters
from datetime import datetime
from dateutil.relativedelta import relativedelta
from rest_framework import filters
from .filterset import DepositFilter,PayableFilter,PaymentFilter
import django_filters.rest_framework
from rest_framework.views import APIView

from rest_framework.response import Response

# Create your views here.
class depositViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = deposit.objects.all().order_by("-id")
    serializer_class = depositSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend,filters.SearchFilter]
    filterset_class = DepositFilter
    search_fields = ["kyc__first_name","slug","kyc__slug","kyc__shareholder__slug"]
    def perform_create(self, serializer):
        user = self.request.user
        deposited_on = self.request.data.get("deposited_on")
        interest_type = self.request.data.get("interest_type")
        month = int(interest_type[0])
        original_datetime = datetime.fromisoformat(deposited_on[:-1])  # Removing 'Z' from the timestamp
        new_datetime = original_datetime + relativedelta(months=month,days=-1)
        print(new_datetime)
        new_timestamp = new_datetime.isoformat() + "Z"
        serializer.save(created_by=user,maturity_term=new_timestamp)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)

class DepositViews(APIView):
    def get(self, request, format=None):
        queryset = deposit.objects.all()
        serializer = depositSerializer(queryset, many=True)
        return Response(serializer.data)


class payableViewSet(viewsets.ModelViewSet):
    queryset = payable.objects.all().filter(active=True)
    serializer_class = payableSerializer
    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend, filters.SearchFilter]
    filterset_class = PayableFilter
    search_fields = ['loan__slug', 'loan__kyc__first_name', 'loan__kyc__slug']

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)


    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)

class paymentViewSet(viewsets.ModelViewSet):
    queryset = payment.objects.all()
    serializer_class = paymentSerializer
    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend, filters.SearchFilter]
    filterset_class = PaymentFilter
    search_fields = ['due__loan__slug',
                     'due__loan__kyc__first_name', 'due__loan__kyc__slug']

    def perform_create(self, serializer):
        user = self.request.user
        get_deposit_id = self.request.data.get("deposit")
        get_amount = self.request.data.get("amount")
        payable_id = payable.objects.filter(deposit_id=get_deposit_id,active=True)
        ids = []
        for i in payable_id:
            rem_payable_amount = i.payable_amount - i.paid_amount
            if i.payable_amount <= get_amount:
                i.paid_amount = i.payable_amount
                get_amount = get_amount - i.paid_amount
                i.active = False
                i.save()
                ids.append(i.pk)

            elif (rem_payable_amount <= get_amount):
                i.paid_amount = i.payable_amount
                get_amount = get_amount - rem_payable_amount
                i.active = False
                i.save()
                ids.append(i.pk)

            elif (get_amount == rem_payable_amount):
                i.paid_amount = i.payable_amount
                get_amount = get_amount - i.paid_amount
                i.active = False
                i.save()
                ids.append(i.pk)
                break

            else:
                i.paid_amount += get_amount
                i.save()
                print("2", get_amount)
                ids.append(i.pk)
                break
        serializer.save(created_by=user,payable=ids)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)