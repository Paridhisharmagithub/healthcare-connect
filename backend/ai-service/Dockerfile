FROM python:3.11-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends tesseract-ocr \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY app.py ./

ENV PORT=8080
ENV TESSERACT_PATH=/usr/bin/tesseract

EXPOSE 8080

CMD exec gunicorn --bind :${PORT} --workers 1 --threads 4 --timeout 120 app:app
