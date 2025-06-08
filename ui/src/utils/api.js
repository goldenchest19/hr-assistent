import axios from 'axios';

// Базовый URL API
const API_BASE_URL = 'http://localhost:8081/api';

// Создание экземпляра axios с общими настройками
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('hr_partner_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API для работы с аутентификацией
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// API для работы с вакансиями
export const vacancyAPI = {
  getAll: () => api.get('/vacancies'),
  getById: (id) => api.get(`/vacancies/${id}`),
  create: (data) => api.post('/vacancies', data),
  update: (id, data) => api.put(`/vacancies/${id}`, data),
  delete: (id) => api.delete(`/vacancies/${id}`),
};

// API для работы с резюме
export const resumeAPI = {
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  create: (data) => api.post('/resumes', data),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
};

// API для работы с офферами
export const offerAPI = {
  getAll: () => api.get('/offers'),
  getById: (id) => api.get(`/offers/${id}`),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.put(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
};

// API для работы с откликами на вакансии
export const jobApplicationAPI = {
  getAll: () => api.get('/job-applications'),
  getById: (id) => api.get(`/job-applications/${id}`),
  create: (data) => api.post('/job-applications', data),
  update: (id, data) => api.put(`/job-applications/${id}`, data),
  delete: (id) => api.delete(`/job-applications/${id}`),
};

// API для работы с сопоставлением (matching)
export const matchingAPI = {
  // Сопоставление по файлу резюме (PDF) и URL вакансии
  matchResumeFileToVacancyUrl: (formData, vacancyUrl) => {
    const data = new FormData();
    data.append('resume', formData.file);
    data.append('email', formData.email);
    data.append('vacancyUrl', vacancyUrl);
    return api.post('/matching/resume-file', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  // Сопоставление по URL резюме и URL вакансии
  matchResumeUrlToVacancyUrl: (resumeUrl, vacancyUrl) => {
    return api.post('/matching/resume-url', { resumeUrl, vacancyUrl });
  },
  // Сопоставление по текстовому резюме и URL вакансии
  matchResumeTextToVacancyUrl: (resumeText, vacancyUrl) => {
    return api.post('/matching/resume-text-vacancy-url', { resumeText, vacancyUrl });
  },
  // Сопоставление по файлу резюме (PDF) и текстовой вакансии
  matchResumeFileToVacancyText: (formData, vacancyText) => {
    const data = new FormData();
    data.append('resume', formData.file);
    data.append('email', formData.email);
    data.append('vacancyText', vacancyText);
    return api.post('/matching/resume-file-vacancy-text', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  // Сопоставление по URL резюме и текстовой вакансии
  matchResumeUrlToVacancyText: (resumeUrl, vacancyText) => {
    return api.post('/matching/resume-url-vacancy-text', { resumeUrl, vacancyText });
  },
  // Сопоставление по текстовому резюме и текстовой вакансии
  matchResumeTextToVacancyText: (resumeText, vacancyText) => {
    return api.post('/matching/resume-text-vacancy-text', { resumeText, vacancyText });
  },
  // Получение истории сопоставлений
  getMatchingHistory: (params) => api.get('/resume-vacancy-matches', { params }),
  // Получение сохраненного сопоставления по ID
  getMatchingById: (id) => api.get(`/matching/${id}`),
};

export default api; 