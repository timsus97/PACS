#!/bin/sh

# Wait for PostgreSQL to be ready (if using PostgreSQL)
# while ! nc -z db_pacs 5432; do
#   echo "Waiting for PostgreSQL to be ready..."
#   sleep 1
# done

# Initialize the database
echo "Initializing database..."
python3 /app/init_db.py

# Start the Flask application with gunicorn
echo "Starting Flask application..."
exec gunicorn --bind 0.0.0.0:5000 \
    --workers 4 \
    --threads 2 \
    --timeout 120 \
    --access-logfile /var/log/flask_auth/access.log \
    --error-logfile /var/log/flask_auth/error.log \
    --log-level info \
    app:app 