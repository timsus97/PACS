#!/bin/sh

# Initialize the database
echo "Initializing database..."
python3 /app/init_db.py

# Start the Flask application with simple gunicorn config
echo "Starting Flask application..."
exec gunicorn --bind 0.0.0.0:5000 \
    --workers 1 \
    --timeout 120 \
    --preload \
    --log-level debug \
    app:app 