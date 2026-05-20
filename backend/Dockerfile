FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# System deps для Pillow (libjpeg, zlib) + psycopg
RUN apt-get update && apt-get install -y --no-install-recommends \
        libjpeg-dev zlib1g-dev libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn psycopg[binary]

COPY . .

RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Запуск: міграція БД → idempotent seed (тільки якщо порожня) → ensure SuperAdmin → gunicorn.
# seed_if_empty і ensure_superuser безпечні для повторних рестартів — пропускають
# роботу якщо все вже є. Дозволяє piattform-Free план без Shell-доступу
# (Render Free, тощо) автоматично заповнити demo-дані при першому деплої.
# $PORT задає платформа; локально fallback на 8000.
# $WEB_CONCURRENCY теж задає платформа (наприклад Render Free = 1); fallback на 2.
# JSON-форма CMD + sh -c — щоб `&&` і `${PORT}` правильно інтерпретувалися шеллом.
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py seed_if_empty && python manage.py ensure_superuser && exec gunicorn gym_project.wsgi --bind 0.0.0.0:${PORT:-8000} --workers ${WEB_CONCURRENCY:-2}"]
