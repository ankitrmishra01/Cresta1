FROM python:3.12-slim

WORKDIR /app

# System deps for psycopg2, torch
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install ML dependencies first (larger, changes less often)
COPY mlmodel/requirements.txt /tmp/ml-requirements.txt
RUN pip install --no-cache-dir -r /tmp/ml-requirements.txt

# Install backend dependencies
COPY backend/requirements.txt /tmp/backend-requirements.txt
RUN pip install --no-cache-dir -r /tmp/backend-requirements.txt gunicorn psycopg2-binary celery redis whitenoise

# Copy mlmodel/recommender so 'from recommender.*' imports work
COPY mlmodel/recommender/ /app/mlmodel/recommender/

# Copy chatbot module
COPY chatbot/ /app/chatbot/

# Copy backend application code
COPY backend/ /app/

# Add mlmodel to Python path so 'from recommender.*' resolves
ENV PYTHONPATH="/app/mlmodel:${PYTHONPATH}"

# Collect static files
RUN python manage.py collectstatic --noinput 2>/dev/null || true

# Create dirs for model storage
RUN mkdir -p saved_models mlmodel/recommender/saved_models

EXPOSE 8000

CMD ["gunicorn", "robo_advisor.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
