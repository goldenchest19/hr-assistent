from fastapi import APIRouter, HTTPException

from src.models.schemas import VacancyRequest, Vacancy, VacancyResponse
from src.services.getmatch_parser import GetmatchVacancyParser
from src.services.habr_parser import HabrVacancyParser
from src.services.vacancy_parser import VacancyParser

# Создание роутера FastAPI
router = APIRouter()

# Инициализация сервисов
vacancy_parser = VacancyParser()
habr_vacancy_parser = HabrVacancyParser()
getmatch_vacancy_parser = GetmatchVacancyParser()


@router.post("/parse-vacancy", response_model=VacancyResponse, tags=["Вакансии"])
def parse_vacancy(request: VacancyRequest):
    """
    Парсинг вакансии с hh.ru
    
    - **url**: URL вакансии на hh.ru
    
    Возвращает данные о вакансии.
    """
    # Парсим вакансию
    vacancy_data, error = vacancy_parser.parse_vacancy(request.url)

    if error:
        raise HTTPException(status_code=400, detail=error)

    if not vacancy_data:
        raise HTTPException(status_code=500, detail="Не удалось распарсить вакансию")

    # Создаем объект вакансии
    vacancy = Vacancy(
        id=vacancy_data.get("id"),
        title=vacancy_data.get("title"),
        company=vacancy_data.get("company"),
        description=vacancy_data.get("description"),
        salary_from=vacancy_data.get("salary_from"),
        salary_to=vacancy_data.get("salary_to"),
        currency=vacancy_data.get("currency"),
        experience=vacancy_data.get("experience"),
        skills=vacancy_data.get("skills", []),
        url=vacancy_data.get("url"),
        created_at=vacancy_data.get("created_at"),
        work_format=vacancy_data.get("work_format")
    )

    # Создаем ответ
    response = VacancyResponse(
        vacancy_id=vacancy_data.get("id"),
        vacancy=vacancy,
        status="success",
        message="Вакансия успешно загружена"
    )

    return response

    # Выполняем сопоставление


@router.post("/parse-habr-vacancy", response_model=VacancyResponse, tags=["Вакансии"])
def parse_habr_vacancy(request: VacancyRequest):
    """
    Парсинг вакансии с career.habr.com
    
    - **url**: URL вакансии на career.habr.com
    
    Возвращает данные о вакансии в формате VacancyResponse.
    """
    vacancy_data, error = habr_vacancy_parser.parse_vacancy(request.url)

    if error:
        raise HTTPException(status_code=400, detail=error)

    if not vacancy_data:
        raise HTTPException(status_code=500, detail="Не удалось распарсить вакансию")

    vacancy = Vacancy(
        id=vacancy_data.get("id"),
        title=vacancy_data.get("title"),
        company=vacancy_data.get("company"),
        description=vacancy_data.get("description"),
        salary_from=vacancy_data.get("salary_from"),
        salary_to=vacancy_data.get("salary_to"),
        currency=vacancy_data.get("currency"),
        experience=vacancy_data.get("experience"),
        skills=vacancy_data.get("skills", []),
        url=vacancy_data.get("url"),
        created_at=vacancy_data.get("created_at"),
        work_format=vacancy_data.get("work_format")
    )

    response = VacancyResponse(
        vacancy_id=vacancy_data.get("id"),
        vacancy=vacancy,
        status="success",
        message="Вакансия успешно загружена"
    )

    return response


@router.post("/parse-getmatch-vacancy", response_model=VacancyResponse, tags=["Вакансии"])
def parse_getmatch_vacancy(request: VacancyRequest):
    """
    Парсинг вакансии с getmatch.ru
    
    - **url**: URL вакансии на getmatch.ru
    
    Возвращает данные о вакансии в формате VacancyResponse.
    """
    vacancy_data, error = getmatch_vacancy_parser.parse_vacancy(request.url)

    if error:
        raise HTTPException(status_code=400, detail=error)

    if not vacancy_data:
        raise HTTPException(status_code=500, detail="Не удалось распарсить вакансию")

    vacancy = Vacancy(
        id=vacancy_data.get("id"),
        title=vacancy_data.get("title"),
        company=vacancy_data.get("company"),
        description=vacancy_data.get("description"),
        salary_from=vacancy_data.get("salary_from"),
        salary_to=vacancy_data.get("salary_to"),
        currency=vacancy_data.get("currency"),
        experience=vacancy_data.get("experience"),
        skills=vacancy_data.get("skills", []),
        url=vacancy_data.get("url"),
        created_at=vacancy_data.get("created_at"),
        work_format=vacancy_data.get("work_format")
    )

    response = VacancyResponse(
        vacancy_id=vacancy_data.get("id"),
        vacancy=vacancy,
        status="success",
        message="Вакансия успешно загружена"
    )

    return response
