from typing import List, Optional

from pydantic import BaseModel


class Education(BaseModel):
    """Модель образования"""
    degree: str
    direction: str
    specialty: str


class WorkExperience(BaseModel):
    """Модель опыта работы"""
    start_date: str
    end_date: Optional[str] = None
    company_name: str
    achievements: List[str] = []
    technologies: List[str] = []


class NormalizedResume(BaseModel):
    """Модель нормализованного резюме"""
    name: str
    email: str
    phone: Optional[str] = None
    vacancy_name: Optional[str] = None
    languages: List[str] = []
    frameworks: List[str] = []
    education: List[Education] = []
    work_experience: List[WorkExperience] = []


class VacancyRequest(BaseModel):
    """Запрос на парсинг вакансии с hh.ru"""
    url: str


class Vacancy(BaseModel):
    """Модель вакансии"""
    id: str
    title: str
    company: str
    description: str
    salary_from: Optional[int] = None
    salary_to: Optional[int] = None
    currency: Optional[str] = None
    experience: Optional[str] = None
    skills: List[str] = []
    url: str
    created_at: Optional[str] = None
    work_format: Optional[str] = None  # Формат работы (удаленно, офис, гибрид и т.д.)


class VacancyResponse(BaseModel):
    """Ответ на запрос парсинга вакансии"""
    vacancy_id: str
    vacancy: Vacancy
    status: str = "success"
    message: str = "Вакансия успешно загружена и сохранена"
