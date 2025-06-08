import json
import os
import re

import requests
from dotenv import load_dotenv

# Загрузка переменных окружения из .env файла
load_dotenv()


class ResumeVacancyMatcher:
    """
    Класс для сопоставления резюме и вакансий с использованием 
    анализа текста и языковой модели
    """

    def __init__(self, llm_api_url=None, llm_api_key=None, llm_model=None):
        """
        Инициализация сопоставителя
        
        :param llm_api_url: URL API языковой модели
        :param llm_api_key: Ключ API для языковой модели
        :param llm_model: Название используемой модели
        """
        # Получаем значения из .env файла или используем переданные параметры
        self.llm_api_url = llm_api_url or os.getenv("LLM_API_URL")
        self.llm_api_key = llm_api_key or os.getenv("LLM_API_KEY")
        self.llm_model = llm_model or os.getenv("LLM_MODEL", "deepseek-ai/DeepSeek-V3")

        # Проверка наличия обязательных параметров
        if not self.llm_api_url:
            raise ValueError(
                "URL API языковой модели не указан. Укажите LLM_API_URL в .env файле или передайте параметр.")

        if not self.llm_api_key:
            raise ValueError(
                "Ключ API языковой модели не указан. Укажите LLM_API_KEY в .env файле или передайте параметр.")

    def get_llm_analysis(self, resume_dict: dict = None, vacancy_dict: dict = None):
        """
        Запрашивает анализ от языковой модели
        
        :param resume_dict: dict-структура резюме (опционально)
        :param vacancy_dict: dict-структура вакансии (опционально)
        :return: Кортеж из (текстовый анализ, оценка соответствия, плюсы, минусы, вердикт, и др.)
        """
        if resume_dict is not None and vacancy_dict is not None:
            prompt = (
                    "Ты — строгий HR-специалист с многолетним опытом подбора персонала в IT. "
                    "Тебе предоставлены структурированные данные о резюме и вакансии в формате JSON. "
                    "Твоя задача — строго и объективно проанализировать соответствие кандидата требованиям вакансии.\n\n"
                    "Данные резюме:\n" + json.dumps(resume_dict, ensure_ascii=False, indent=2) + "\n\n"
                                                                                                 "Данные вакансии:\n" + json.dumps(
                vacancy_dict, ensure_ascii=False, indent=2) + "\n\n"
                                                              "Требования к результату:\n"
                                                              "1. Проанализируй все поля из резюме и вакансии, а не только текстовые описания.\n"
                                                              "2. Учитывай: должность, опыт, навыки (hard и soft), образование, достижения, технологии, формат работы, зарплату и т.д.\n"
                                                              "3. Если каких-то данных не хватает — явно укажи это в минусах.\n"
                                                              "4. Будь максимально строгим и честным.\n"
                                                              "5. Если есть неочевидные моменты — добавь уточняющие вопросы.\n"
                                                              "6. Всегда возвращай только следующие поля:\n"
                                                              "\nФормат ответа (строго JSON, без пояснений):\n"
                                                              "```json\n"
                                                              "{\n"
                                                              "  \"matchedSkills\": [<строки>],\n"
                                                              "  \"unmatchedSkills\": [<строки>],\n"
                                                              "  \"llmComment\": \"<строка>\",\n"
                                                              "  \"score\": <float>,\n"
                                                              "  \"positives\": [<строки>],\n"
                                                              "  \"negatives\": [<строки>],\n"
                                                              "  \"verdict\": \"<строка>\",\n"
                                                              "  \"clarifyingQuestions\": [<строки>]\n"
                                                              "}\n"
                                                              "```\n"
                                                              "Пояснения и текст вне JSON не допускаются."
            )

        # Подготовка запроса к API
        headers = {
            "Authorization": f"Bearer {self.llm_api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": self.llm_model,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }

        # Отправка запроса и получение ответа
        response = requests.post(
            self.llm_api_url,
            headers=headers,
            json=data,
            timeout=60
        )
        response.raise_for_status()
        result = response.json()

        content = result['choices'][0]['message']['content']

        # Извлечение JSON из ответа
        try:
            # Ищем JSON в тексте, который может быть обернут в markdown блок кода
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Ищем JSON без обертки кода
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    raise ValueError("JSON не найден в ответе")

            analysis = json.loads(json_str)

            # Извлекаем компоненты ответа
            score = float(analysis.get("score", 0.5))  # По умолчанию 0.5, если оценка не указана
            positives = analysis.get("positives", [])
            negatives = analysis.get("negatives", [])
            verdict = analysis.get("verdict", "Нет вердикта")
            comment = analysis.get("llmComment", analysis.get("comment", content))  # поддержка обоих ключей
            matched_skills = analysis.get("matchedSkills", [])
            unmatched_skills = analysis.get("unmatchedSkills", [])
            clarifying_questions = analysis.get("clarifyingQuestions", [])

            return score, positives, negatives, verdict, comment, matched_skills, unmatched_skills, clarifying_questions
        except Exception as e:
            print(f"Ошибка при парсинге JSON из ответа: {str(e)}")
            # В случае ошибки парсинга возвращаем дефолтные значения для всех 8 переменных
            return 0.5, [], [], "Не удалось определить вердикт", "", [], [], []
