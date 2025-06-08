import os
from datetime import datetime
import uuid

from dotenv import load_dotenv

from src.schemas.vacancy import VacancyInput, VacancyOutput
import requests
import json

# Загрузка переменных окружения из .env файла
load_dotenv()

LLM_API_URL = os.getenv("LLM_API_URL")
LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "deepseek-ai/DeepSeek-V3")


def call_deepseek_api(prompt: str) -> dict:
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": LLM_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    try:
        response = requests.post(
            LLM_API_URL,
            headers=headers,
            json=data,
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        # Извлекаем ответ модели
        llm_response = result['choices'][0]['message']['content']

        # Попытка извлечь JSON из ответа
        # Сначала проверяем, есть ли в ответе блок кода
        if "```json" in llm_response:
            json_str = llm_response.split("```json")[1].split("```")[0].strip()
        elif "```" in llm_response:
            json_str = llm_response.split("```")[1].split("```")[0].strip()
        else:
            json_str = llm_response.strip()

        # Парсим JSON
        normalized_data = json.loads(json_str)

        return normalized_data
    except Exception as e:
        # В случае ошибки возвращаем заглушку
        return { }


def build_prompt(vacancy_input: VacancyInput) -> str:
    json_format = '{"title": Название вакансии, "description": ..., "requirements": ..., "company": ..., "responsibilities": ..., "skills": [...], "salaryFrom": ..., "salaryTo": ..., "location": ..., "source": "genAI", "currency": "RUB", "experience": ...}'
    prompt = f"""
        Сгенерируй подробную вакансию на позицию \"{vacancy_input.position}\" в компании \"{vacancy_input.company}\".
        Описание компании: {vacancy_input.company_description}
        Требуемые навыки: {', '.join(vacancy_input.required_skills)}
        Опыт: {vacancy_input.experience_years} лет
        Локация: {vacancy_input.location}
        Зарплата: {vacancy_input.salary_range}
        Дополнительная информация: {vacancy_input.additional_info or '-'}

        Требования к вакансии:
        - Сформируй развернутое, профессиональное описание вакансии, даже если входные данные минимальны.
        - Обязательно добавь дополнительные навыки, которые обычно требуются для такой позиции, помимо указанных.
        - Подробно опиши обязанности и требования к кандидату.
        - Описание должно быть полным и привлекательным для соискателя.
        - Все поля должны быть заполнены максимально подробно.
        - Ответ верни только в виде валидного JSON по следующему шаблону:
        {json_format}
        Язык — русский.
        """
    return prompt

def generate_vacancy(vacancy_input: VacancyInput) -> VacancyOutput:
    prompt = build_prompt(vacancy_input)
    vacancy_data = call_deepseek_api(prompt)
    return VacancyOutput(
        id=uuid.uuid4().int % 10000,
        title=vacancy_data["title"],
        description=vacancy_data["description"],
        requirements=vacancy_data["requirements"],
        company=vacancy_data["company"],
        responsibilities=vacancy_data["responsibilities"],
        skills=vacancy_data["skills"],
        salaryFrom=vacancy_data["salaryFrom"],
        salaryTo=vacancy_data["salaryTo"],
        location=vacancy_data["location"],
        source=vacancy_data["source"],
        createdAt=datetime.now().isoformat(),
        currency=vacancy_data["currency"],
        experience=vacancy_data["experience"]
    )
