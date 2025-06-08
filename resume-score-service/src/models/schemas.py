from typing import List, Optional

from pydantic import BaseModel


class EducationDTO(BaseModel):
    degree: Optional[str] = None
    direction: Optional[str] = None
    specialty: Optional[str] = None


class WorkExperienceDTO(BaseModel):
    end_date: Optional[str] = None
    start_date: Optional[str] = None
    achievements: Optional[List[str]] = []
    company_name: Optional[str] = None
    technologies: Optional[List[str]] = []


class ResumeDTO(BaseModel):
    id: Optional[int] = None
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    hardSkills: Optional[List[str]] = []
    softSkills: Optional[List[str]] = []
    education: Optional[List[EducationDTO]] = []
    workExperience: Optional[List[WorkExperienceDTO]] = []


class VacancyDTO(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    company: Optional[str] = None
    responsibilities: Optional[str] = None
    skills: Optional[List[str]] = []
    salaryFrom: Optional[int] = None
    salaryTo: Optional[int] = None
    location: Optional[str] = None
    source: Optional[str] = None
    createdAt: Optional[str] = None
    currency: Optional[str] = None
    experience: Optional[str] = None
    url: Optional[str] = None
    originalId: Optional[str] = None
    status: Optional[str] = None
    formatWork: Optional[str] = None


class ResumeVacancyFullMatchRequest(BaseModel):
    resume: ResumeDTO
    vacancy: VacancyDTO


class ResumeVacancyFullMatchResponse(BaseModel):
    """Расширенный ответ на сопоставление резюме и вакансии"""
    id: int
    resumeId: int
    vacancyId: int
    matchedSkills: List[str]
    unmatchedSkills: List[str]
    llmComment: str
    createdAt: str
    score: float
    positives: List[str]
    negatives: List[str]
    verdict: str
    clarifyingQuestions: List[str] = []
