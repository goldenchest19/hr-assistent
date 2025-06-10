import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from src.api.routes import router

# Загрузка переменных окружения из .env файла
load_dotenv()

# Создание экземпляра FastAPI
app = FastAPI(
    title="Resume-Vacancy Matcher API",
    description="API для сопоставления резюме с вакансиями и нормализации резюме с помощью искусственного интеллекта",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Маршрут с информацией о сервисе
@app.get("/info", tags=["Система"])
def service_info():
    """
    Эндпоинт с информацией о сервисе
    
    Возвращает базовую информацию о сервисе и доступных эндпоинтах.
    """
    return {
        "service": "Resume-Vacancy Matcher API",
        "version": "1.0.0",
        "description": "API для сопоставления резюме с вакансиями",
        "documentation": "/docs",
        "redoc": "/redoc",
        "endpoints": []
    }


# Регистрация роутера
app.include_router(router, prefix="/api")
