#!/bin/bash
# Script to start the ML service

echo "Starting ML Price Prediction Service..."
cd "$(dirname "$0")"
python3 -m uvicorn ml_service:app --host 0.0.0.0 --port 8000

