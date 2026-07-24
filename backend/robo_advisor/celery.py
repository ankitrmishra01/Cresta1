"""
Celery configuration for Cresta robo_advisor project.
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'robo_advisor.settings')

app = Celery('robo_advisor')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

from celery.schedules import crontab

# Beat schedule — daily ML refresh
app.conf.beat_schedule = {
    'daily-sentiment-precompute': {
        'task': 'advisor.tasks.precompute_sentiment',
        # Runs at 4:30 PM IST (11:00 UTC) Mon-Fri — after market close
        'schedule': crontab(hour=11, minute=0, day_of_week='mon-fri'),
    },
    'daily-lstm-pretrain': {
        'task': 'advisor.tasks.pretrain_lstm_models',
        # Runs at 5:00 PM IST (11:30 UTC) Mon-Fri
        'schedule': crontab(hour=11, minute=30, day_of_week='mon-fri'),
    },
    'check-price-alerts': {
        'task': 'advisor.tasks.check_price_alerts',
        # Every 15 mins during market hours only (UTC+5:30)
        'schedule': crontab(
            minute='*/15',
            hour='3-10',        # 8:30 AM - 4:30 PM IST
            day_of_week='mon-fri'
        ),
    },
    'daily-drift-check': {
        'task': 'advisor.tasks.check_model_drift',
        # Runs at 6:00 PM IST (12:30 UTC)
        'schedule': crontab(hour=12, minute=30, day_of_week='mon-fri'),
    },
}
app.conf.timezone = 'Asia/Kolkata'
