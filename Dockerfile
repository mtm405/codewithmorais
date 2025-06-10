# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY requirements.txt .
COPY app.py .
# If you have a 'templates' folder, uncomment and add this line:
COPY templates/ templates/
# If you have a 'static' folder (for CSS/JS/images), uncomment and add this line:
COPY static/ static/
# Add any other folders your app needs to run (e.g., .env if you use it for production, but ideally set ENV vars on Cloud Run directly)
# COPY .env . # ONLY if you manage .env in production, otherwise use Cloud Run's ENV var config

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the application using Gunicorn.
# Cloud Run populates the PORT environment variable.
# We use 0.0.0.0 to bind to all available network interfaces.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
# Explanation of CMD:
# `app:app` -> first 'app' is your app.py file, second 'app' is your Flask app instance (e.g., app = Flask(__name__))
# `workers 1` -> For Cloud Run's concurrency model, usually 1 worker is sufficient, letting Gunicorn manage threads.
# `threads 8` -> Can adjust based on expected concurrent requests.
# `timeout 0` -> Essential for Cloud Run to prevent Gunicorn from prematurely timing out requests.