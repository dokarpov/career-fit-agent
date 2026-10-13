FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/app ./app
COPY selfhost_setup ./selfhost_setup
COPY telegram_miniapp ./telegram_miniapp
COPY telegram_bot ./telegram_bot
ENV CFA_DATA_DIR=/app/data
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000"]
