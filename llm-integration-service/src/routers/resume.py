import re
import uuid

from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Body

from src.schemas import MatchVacancyResponse, MatchVacancyRequest
from src.services.normalizer import ResumeNormalizer
from src.services.vacancy_generator import call_deepseek_api
from src.utils.pdf_extractor import PDFExtractor

# Инициализация сервисов
resume_normalizer = ResumeNormalizer()

resume_router = APIRouter()


def is_valid_email(email: str):
    """Проверяет, является ли строка валидным email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


@resume_router.post("/upload-resume", tags=["Резюме"])
async def upload_resume(
        file: UploadFile = File(...),
        email: str = Form(...),
):
    """
    Загрузка резюме в формате PDF с нормализацией (без сохранения в базу данных)
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Только PDF-файлы принимаются")

    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Некорректный формат email")

    try:
        pdf_content = await file.read()
        resume_text = PDFExtractor.extract_text_from_bytes(pdf_content)
        if not resume_text or len(resume_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Не удалось извлечь достаточно текста из PDF. Возможно, файл пустой или защищен."
            )
        resume_id = str(uuid.uuid4())
        normalized_data = resume_normalizer.normalize_resume(resume_text, email)
        if not normalized_data:
            raise HTTPException(
                status_code=500,
                detail="Не удалось нормализовать резюме. Попробуйте позже."
            )
        # Формируем ответ с нужными полями
        response = {"id": resume_id}
        response.update({
            "name": normalized_data.get("name", ""),
            "phone": normalized_data.get("phone", ""),
            "role": normalized_data.get("role", ""),
            "hard_skills": normalized_data.get("hard_skills", []),
            "soft_skills": normalized_data.get("soft_skills", []),
            "education": normalized_data.get("education", []),
            "work_experience": normalized_data.get("work_experience", [])
        })
        print(response)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при обработке файла: {str(e)}")


@resume_router.post("/match-vacancies", response_model=MatchVacancyResponse, tags=["Резюме"])
async def match_vacancies(
        request: MatchVacancyRequest = Body(...)
):
    resume = request.resume
    # Подсчет общего опыта (в годах)
    # Можно доработать, если нужен более точный расчет

    prompt = f"""
На вход поступают следующие данные:

Резюме кандидата:
{{
  \"id\": {resume.id},
  \"desired_role\": \"{resume.desired_role}\",
  \"experience\": {resume.workExperience}
}}

Список вакансий:
{[vac.dict() for vac in resume.vacancy]}

Твоя задача — определить, какие вакансии подходят этому кандидату на основании следующих критериев:

1. Название желаемой должности кандидата (`desired_role`) должно быть достаточно близко по смыслу к требуемой должности из вакансии (`required_role`). Учитывай синонимы, профессиональные термины и слабо различающиеся названия (например, \"Java-разработчик\", \"Java Software Engineer\" и \"Backend Developer (Java)\" считаются близкими).
2. Кандидат должен иметь опыт работы (`experience_years`), **не меньше** минимального опыта, указанного в вакансии (`required_experience_years`).
3. Отсортируй вакансии по степени соответствия и верни только их `id`.

Ответ должен быть в формате:
```json
{{
  \"matched_vacancy_ids\": [id1, id2, id3]
}}
"""
    llm_response = call_deepseek_api(prompt)
    matched_ids = llm_response.get("matched_vacancy_ids", [])
    return MatchVacancyResponse(matched_vacancy_ids=matched_ids)
