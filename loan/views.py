from rest_framework import viewsets
from loan.models import loan, due, receipt
from loan.serializers import loanSerializer, dueSerializer, receiptSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
from dateutil.relativedelta import relativedelta
import django_filters.rest_framework
from rest_framework import filters
from .filterset import LoanFilter, DueFilter, ReceiptFilter
from celery import shared_task
from django.db.models import Sum

# Create your views here.


class loanViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAdminUser]
    queryset = loan.objects.all()
    serializer_class = loanSerializer
    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend, filters.SearchFilter]
    filterset_class = LoanFilter
    search_fields = ['slug', 'kyc__first_name',
                     'kyc__slug', 'kyc__shareholder__slug']

    def perform_create(self, serializer):
        user = self.request.user
        loan_date_on = self.request.data.get("loan_date_on")
        interest_type = self.request.data.get("interest_type")
        if (interest_type == "EMI"):
            emi_period = self.request.data.get("emi_period")
            month = int(emi_period[0])
            original_datetime = datetime.fromisoformat(
                loan_date_on[:-1])  # Removing 'Z' from the timestamp
            new_datetime = original_datetime + \
                relativedelta(months=month, days=-1)
            new_timestamp = new_datetime.isoformat() + "Z"

        elif (interest_type == "Term Loan"):
            original_datetime = datetime.fromisoformat(
                loan_date_on[:-1])  # Removing 'Z' from the timestamp
            new_datetime = original_datetime + relativedelta(months=1, days=-1)
            new_timestamp = new_datetime.isoformat() + "Z"

        serializer.save(created_by=user, maturity_term=new_timestamp)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)


class LoanViews(APIView):
    def get(self, request, format=None):
        queryset = loan.objects.all()
        serializer = loanSerializer(queryset, many=True)
        return Response(serializer.data)


class dueViewSet(viewsets.ModelViewSet):
    queryset = due.objects.all().filter(active=True)
    serializer_class = dueSerializer
    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend, filters.SearchFilter]
    filterset_class = DueFilter
    search_fields = ['loan__slug', 'loan__kyc__first_name', 'loan__kyc__slug']

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)


class receiptViewSet(viewsets.ModelViewSet):

    queryset = receipt.objects.all().annotate(due_amount=Sum("due__due_amount"))
    serializer_class = receiptSerializer
    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend, filters.SearchFilter]
    filterset_class = ReceiptFilter
    search_fields = ['due__loan__slug',
                     'due__loan__kyc__first_name', 'due__loan__kyc__slug']

    def perform_create(self, serializer):
        user = self.request.user
        get_loan_id = self.request.data.get("loan")
        get_amount = self.request.data.get("amount")
        due_id = due.objects.filter(loan_id=get_loan_id, active=True)
        ids = []

        for i in due_id:
            rem_due_amount = i.due_amount - i.paid_amount

            if i.due_amount <= get_amount:
                i.paid_amount = i.due_amount
                get_amount = get_amount - i.paid_amount
                i.active = False
                i.save()
                ids.append(i.pk)

            elif (rem_due_amount <= get_amount):
                i.paid_amount = i.due_amount
                get_amount = get_amount - rem_due_amount
                i.active = False
                i.save()
                ids.append(i.pk)

            elif (get_amount == rem_due_amount):
                i.paid_amount = i.due_amount
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

        print("outer", get_amount)
        serializer.save(created_by=user, due=ids)

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)
