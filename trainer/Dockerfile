FROM python:3.13-slim

WORKDIR /app

# Install system deps for scientific libs
RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
 && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy training code
COPY . .

# Default command (overridden in docker-compose)
CMD ["python", "train.py"]
