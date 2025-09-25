# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (if needed, e.g., for some Python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and folders
COPY app.py .
COPY templates/ templates/
COPY static/ static/
COPY src/ src/
COPY lessons/ lessons/
COPY firebase_web_config.json .

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Set environment variable for Flask and Gunicorn
ENV PORT=8080

# Run the application using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "1", "--threads", "8", "--timeout", "0", "app:app"]
