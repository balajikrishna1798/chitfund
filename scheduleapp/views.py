from django.shortcuts import render
from django.shortcuts import HttpResponse
from loan.tasks import check_loan_task
# Create your views here.


def checkloan(request):
    check_loan_task.delay()
    return HttpResponse("Sent!")