from celery import shared_task
from .models import deposit,payable
from django.utils import timezone
from datetime import timedelta

@shared_task(bind=True)
def check_deposit_task(self):
    deposits = deposit.objects.all()
    for every_deposit in deposits:
        date = every_deposit.maturity_term
        current = timezone.now()
        one_day_from_now = current + timedelta(days=1)
        if (current <= date < one_day_from_now):
            payable.objects.create(deposit=every_deposit,payable_amount=every_deposit.amount,paid_amount=0,due_date=every_deposit.maturity_term)
            every_deposit.save()
    return 'Done!!'