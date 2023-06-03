from celery import shared_task
from .models import loan,due
from datetime import datetime
from django.utils import timezone
from dateutil.relativedelta import relativedelta

@shared_task(bind=True)
def check_loan_task(self):
    loans = loan.objects.all()
    for every_loan in loans:
        date = every_loan.maturity_term
        current = timezone.now()
        if (date < current):
            due.objects.create(loan=every_loan,due_amount=every_loan.amount,paid_amount=0,due_date=every_loan.maturity_term)
            every_loan.save()
    return 'Done!!'
