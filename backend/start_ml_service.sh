#!/bin/sh
# Start ML service with PORT from environment variable
PORT=${PORT:-8000}
exec uvicorn ml_service:app --host 0.0.0.0 --port $PORT
