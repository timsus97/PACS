# Dockerfile for Flask Authorization Service
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    FLASK_APP=app.py \
    FLASK_ENV=production \
    FLASK_DEBUG=0

# Create and set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/data /var/log/flask_auth && \
    chmod +x entrypoint.sh

# Set permissions for data and log directories
RUN chown -R nobody:nogroup /app/data /var/log/flask_auth

# Switch to non-root user
USER nobody

# Expose port
EXPOSE 5000

# Healthcheck (optional, can also be done in docker-compose)
# HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:5000/health || exit 1

# Command to run the application using Gunicorn for production
# This will be executed after entrypoint.sh finishes.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "3", "app:app"]

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"] 