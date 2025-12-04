FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies (optional: for psycopg2, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
 && rm -rf /var/lib/apt/lists/*


COPY ./modelserve/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./modelserve .

# Expose FastAPI port
EXPOSE 8000

# Default command (overridden in docker-compose)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
