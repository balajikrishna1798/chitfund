from __future__ import absolute_import,unicode_literals
import os

from celery import Celery
from django.conf import settings
from celery.schedules import crontab
# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chitfund.settings')

app = Celery('chitfund')

app.conf.enable_utc = False
app.conf.update(timezone='Asia/kolkata')
app.config_from_object(settings, namespace='CELERY')

# Load task modules from all registered Django apps.
app.conf.beat_schedule = {
    'check_loan':{
        'task':'loan.tasks.check_loan_task',
        'schedule':crontab(minute=0, hour=0)
    },
    'check_deposit':{
        'task':'loan.tasks.check_deposit_task',
        'schedule':crontab(minute=0, hour=0)
    }
}
app.autodiscover_tasks()

#celery -A chitfund.celery worker --pool=solo -l info
#celery -A chitfund beat -l INFO

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')