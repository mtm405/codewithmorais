FROM python:3.11-slim

# Create app directory
WORKDIR /app

# Install build dependencies and runtime deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . /app

# Expose the port the app runs on
ENV PORT=8080
EXPOSE 8080

# Start command (Cloud Run will set $PORT)
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8080", "--workers", "2"]
