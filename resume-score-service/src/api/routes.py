from datetime import datetime

from fastapi import APIRouter, HTTPException

from src.models.schemas import ResumeVacancyFullMatchResponse, ResumeVacancyFullMatchRequest
from src.services.matcher import ResumeVacancyMatcher

# Создание роутера FastAPI
router = APIRouter()

# Инициализация сервисов
matcher = ResumeVacancyMatcher()

@router.post("/match-full", response_model=ResumeVacancyFullMatchResponse, tags=["Матчинг"])
def match_full(request: ResumeVacancyFullMatchRequest):
    """
    Сопоставление резюме и вакансии (расширенный формат)

    - **resume**: объект с данными резюме
    - **vacancy**: объект с данными вакансии

    Возвращает расширенный результат сопоставления.
    """
    try:
        resume = request.resume
        vacancy = request.vacancy
        resume_id = resume.id
        vacancy_id = vacancy.id

        # Формируем словари только с нужными полями
        resume_dict = {
            "hardSkills": resume.hardSkills,
            "softSkills": resume.softSkills,
            "education": [e.dict() for e in resume.education],
            "workExperience": [w.dict() for w in resume.workExperience],
            "role": resume.role
        }
        vacancy_dict = {
            "title": vacancy.title,
            "description": vacancy.description,
            "requirements": vacancy.requirements,
            "company": vacancy.company,
            "responsibilities": vacancy.responsibilities,
            "skills": vacancy.skills,
            "salaryFrom": vacancy.salaryFrom,
            "salaryTo": vacancy.salaryTo,
            "experience": vacancy.experience,
            "formatWork": vacancy.formatWork
        }

        score, positives, negatives, verdict, comment, matched_skills, unmatched_skills, clarifying_questions = matcher.get_llm_analysis(
            resume_dict=resume_dict, vacancy_dict=vacancy_dict
        )

        created_at = datetime.utcnow().isoformat()

        return ResumeVacancyFullMatchResponse(
            id=1,
            resumeId=resume_id,
            vacancyId=vacancy_id,
            matchedSkills=matched_skills,
            unmatchedSkills=unmatched_skills,
            llmComment=comment,
            createdAt=created_at,
            score=score,
            positives=positives,
            negatives=negatives,
            verdict=verdict,
            clarifyingQuestions=clarifying_questions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
