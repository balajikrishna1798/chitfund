from celery import shared_task
from .models import loan,due
from django.utils import timezone
from datetime import timedelta
@shared_task(bind=True)
def check_loan_task(self):
    loans = loan.objects.all()
    for every_loan in loans:
        date = every_loan.maturity_term
        current = timezone.now()
        one_day_from_now = current + timedelta(days=1)
        if (current <= date < one_day_from_now):
            due.objects.create(loan=every_loan, due_amount=every_loan.amount, paid_amount=0, due_date=every_loan.maturity_term)
            every_loan.save()
    return 'Done!!'
