# Vacancy Management System

Простое REST API приложение для управления вакансиями, разработанное с использованием:
- Java 21
- Spring Boot
- PostgreSQL
- Gradle

## Требования

- Java 21
- PostgreSQL
- Gradle

## Настройка базы данных

1. Создайте базу данных PostgreSQL
2. Настройте подключение в `application.yml`:
   - URL: jdbc:postgresql://localhost:5433/postgres
   - Username: postgres
   - Password: postgres

## Запуск приложения

```bash
./gradlew bootRun
```

## API Endpoints

- `POST /api/vacancies` - Создание новой вакансии
- `GET /api/vacancies/{id}` - Получение вакансии по ID
- `GET /api/vacancies` - Получение списка всех вакансий
- `PUT /api/vacancies/{id}` - Обновление вакансии
- `DELETE /api/vacancies/{id}` - Удаление вакансии

## Новый эндпоинт: Генерация и сохранение вакансии через AI

POST `/api/vacancies/generate`

**Request body:**
```
{
  "position": "string",
  "company": "string",
  "requiredSkills": ["string"],
  "experienceYears": 0,
  "location": "string",
  "salaryRange": "string",
  "companyDescription": "string",
  "additionalInfo": "string"
}
```

**Описание:**
- Эндпоинт принимает данные для генерации вакансии, отправляет их на AI-сервис (`http://127.0.0.1:8000/parse/generate`), получает сгенерированную вакансию, сохраняет её в БД и возвращает результат в формате VacancyDto.

**Response:**
- Возвращает сгенерированную и сохранённую вакансию в формате VacancyDto.

## Пример запроса на создание вакансии

```json
{
    "title": "Java Developer",
    "description": "Looking for experienced Java developer",
    "requirements": "Java, Spring, PostgreSQL",
    "company": "Tech Company",
    "responsibilities": "Development of backend services",
    "skills": "Java, Spring Boot, REST API",
    "salaryFrom": 100000,
    "salaryTo": 200000,
    "location": "Moscow",
    "source": "hh.ru"
}
``` 