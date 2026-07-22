import os
from django.apps import AppConfig


class AdvisorConfig(AppConfig):
    name = "advisor"
    default_auto_field = "django.db.models.BigAutoField"

    def ready(self):
        """Advisor app ready callback."""
        pass
