from fastapi import APIRouter

from src.schemas.vacancy import VacancyInput, VacancyOutput
from src.services.normalizer import ResumeNormalizer
from src.services.vacancy_generator import generate_vacancy

# Инициализация сервисов
resume_normalizer = ResumeNormalizer()

router = APIRouter()


@router.post("/generate", response_model=VacancyOutput)
def generate_vacancy_endpoint(vacancy_input: VacancyInput):
    return generate_vacancy(vacancy_input)