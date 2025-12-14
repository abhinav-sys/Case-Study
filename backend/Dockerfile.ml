# ML Service Dockerfile (Python)
FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY ml_service.py .
COPY complex_price_model_v2.pkl .

# Verify model file exists
RUN ls -la complex_price_model_v2.pkl || echo "Warning: Model file not found"

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start ML service
CMD ["uvicorn", "ml_service:app", "--host", "0.0.0.0", "--port", "8000"]

