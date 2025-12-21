#!/bin/sh
# Start Chatbot ML Service
PORT=${PORT:-8001}
exec python -m uvicorn chatbot_ml:app --host 0.0.0.0 --port $PORT
