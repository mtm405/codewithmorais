FROM python:3.13-slim

# Working directory
WORKDIR /app

# Keep Python output unbuffered
ENV PYTHONUNBUFFERED=1

# Install system dependencies needed for building some Python packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code (do NOT COPY secrets like serviceAccountKey.json)
COPY . .

# Ensure start script is executable
RUN chmod +x /app/start.sh

# Cloud Run expects the container to listen on $PORT
ENV PORT=8080
EXPOSE 8080

# Use start.sh which will write SERVICE_ACCOUNT_JSON to disk if provided,
# then start gunicorn.
CMD ["/app/start.sh"]