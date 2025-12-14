@echo off
REM Script to start the ML service on Windows

echo Starting ML Price Prediction Service...
cd /d "%~dp0"
python -m uvicorn ml_service:app --host 0.0.0.0 --port 8000
pause

