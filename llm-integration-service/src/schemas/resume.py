from typing import List, Optional, Dict, Any

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


class ResumeNormalizationResponse(BaseModel):
    """Ответ на нормализацию резюме"""
    resume_id: str
    normalized_data: NormalizedResume
    status: str = "success"
    message: str = "Резюме успешно нормализовано и сохранено"


class VacancyForMatch(BaseModel):
    id: int
    required_role: Optional[str] = None
    required_experience_years: Optional[str] = None


class ResumeForMatch(BaseModel):
    id: int
    desired_role: Optional[str] = None
    workExperience: List[Dict[str, Any]]
    vacancy: List[VacancyForMatch]


class MatchVacancyRequest(BaseModel):
    resume: ResumeForMatch


class MatchVacancyResponse(BaseModel):
    matched_vacancy_ids: List[int]
