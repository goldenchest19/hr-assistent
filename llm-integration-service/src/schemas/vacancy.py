from pydantic import BaseModel
from typing import List, Optional

class VacancyInput(BaseModel):
    position: str
    company: str
    required_skills: List[str]
    experience_years: int
    location: str
    salary_range: str
    company_description: str
    additional_info: Optional[str] = None

class VacancyOutput(BaseModel):
    id: int
    title: str
    description: str
    requirements: str
    company: str
    responsibilities: str
    skills: List[str]
    salaryFrom: int
    salaryTo: int
    location: str
    source: str
    createdAt: str
    currency: str
    experience: str 