# Import celery app so it's loaded when Django starts
# Conditional: only import if celery is installed (production)
try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except ImportError:
    # Celery not installed — dev mode, skip async tasks
    pass
