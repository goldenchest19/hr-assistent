import json
import os

import requests
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()


class ResumeNormalizer:
    """Сервис для нормализации резюме с помощью DeepSeek LLM"""

    def __init__(self, llm_api_url=None, llm_api_key=None, llm_model=None):
        """
        Инициализация нормализатора резюме
        
        Args:
            llm_api_url: URL API языковой модели
            llm_api_key: Ключ API для языковой модели
            llm_model: Название используемой модели
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

    def normalize_resume(self, resume_text: str, email: str):
        """
        Нормализует текст резюме с помощью DeepSeek LLM
        
        Args:
            resume_text: Текст резюме для нормализации
            email: Email пользователя (нужен для заполнения схемы)
            
        Returns:
            Нормализованные данные в формате JSON или None, если произошла ошибка
        """
        # Формируем промпт для LLM
        prompt = f"""
Проанализируй следующее резюме и извлеки из него структурированные данные в формате JSON по следующей схеме:

```json
{{
  "name": "ФИО пользователя или просто ФИ",
  "phone": "номер телефона",
  "role": "Желаемая должность (например, Java Developer, Python Developer и т.д.)",
  "hard_skills": ["Навык1", "Навык2", "Навык3"],
  "soft_skills": ["Навык1", "Навык2", "Навык3"],
  "education": [
    {{
      "degree": "степень образования (бакалавриат/магистратура/аспирантура)",
      "direction": "направление образования",
      "specialty": "специальность образования"
    }}
  ],
  "work_experience": [
    {{
      "start_date": "дата начала работы",
      "end_date": "дата окончания работы",
      "company_name": "Название компании",
      "achievements": ["Достижение1", "Достижение2"],
      "technologies": ["Технология1", "Технология2"]
    }}
  ]
}}
```

Важно:
1. Строго следуй этой структуре и названиям полей.
2. Для неизвестных значений используй пустые строки или пустые массивы.
3. Возвращай только JSON без пояснений и комментариев.
4. Для поля "role" определи наиболее подходящую должность по содержимому резюме.

Вот резюме для анализа:

{resume_text}
        """

        # Подготовка запроса к API
        headers = {
            "Authorization": f"Bearer {self.llm_api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": self.llm_model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1  # Низкая температура для более детерминированных результатов
        }

        try:
            # Отправка запроса и получение ответа
            response = requests.post(
                self.llm_api_url,
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

            # Проверяем, что обязательные поля присутствуют
            required_fields = ["name", "phone", "role"]
            for field in required_fields:
                if field not in normalized_data:
                    normalized_data[field] = ""

            # Проверяем списковые поля
            list_fields = ["hard_skills", "soft_skills"]
            for field in list_fields:
                if field not in normalized_data:
                    normalized_data[field] = []
                elif not isinstance(normalized_data[field], list):
                    # Если поле не является списком, преобразуем его в список с одним элементом
                    normalized_data[field] = [normalized_data[field]]

            # Проверяем структуру вложенных полей
            if "education" not in normalized_data:
                normalized_data["education"] = []

            if "work_experience" not in normalized_data:
                normalized_data["work_experience"] = []

            return normalized_data

        except Exception as e:
            print(f"Ошибка при нормализации резюме: {str(e)}")
            return None
