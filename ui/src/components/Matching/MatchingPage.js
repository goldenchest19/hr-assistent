import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  Box,
  Tabs,
  Tab,
  TextField,
  Paper,
  CircularProgress,
  FormControl,
  Input,
  IconButton,
  Alert,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Link as LinkIcon,
  Close as CloseIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import MatchingResults from './MatchingResults';
import { useMatching } from '../../context/MatchingContext';
import { Link } from 'react-router-dom';
import { resumeAPI, vacancyAPI } from '../../utils/api';

// Кастомные стили
const styles = {
  uploadBox: {
    border: '2px dashed #ccc',
    padding: '20px',
    textAlign: 'center',
    borderRadius: '8px',
    marginBottom: '20px',
    transition: 'all 0.3s',
    '&:hover': {
      borderColor: '#1976d2',
      backgroundColor: '#f0f4ff',
    }
  }
};

const MatchingPage = () => {
  // Состояния для вкладок
  const [resumeTabValue, setResumeTabValue] = useState(0);
  const [vacancyTabValue, setVacancyTabValue] = useState(0);

  // Состояния для данных форм
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeEmail, setResumeEmail] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [vacancyUrl, setVacancyUrl] = useState('');
  const [vacancyText, setVacancyText] = useState('');

  // Новые состояния для списков и выбранных элементов
  const [resumes, setResumes] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [matchingResult, setMatchingResult] = useState(null);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Получение состояния и функций из контекста
  const { currentMatch, loading, error: matchingError, performMatching } = useMatching();
  
  // Локальная ошибка (для валидации форм)
  const [error, setError] = useState(null);

  // Новое состояние для модального окна
  const [resultOpen, setResultOpen] = useState(false);

  // Загрузка резюме и вакансий при монтировании
  useEffect(() => {
    setLoadingDropdowns(true);
    Promise.all([
      resumeAPI.getAll(),
      vacancyAPI.getAll()
    ]).then(([resumesRes, vacanciesRes]) => {
      setResumes(resumesRes.data || []);
      setVacancies(vacanciesRes.data || []);
    }).catch(() => {
      setError('Ошибка загрузки резюме или вакансий');
    }).finally(() => setLoadingDropdowns(false));
  }, []);

  // Обработчики изменения вкладок
  const handleResumeTabChange = (event, newValue) => {
    setResumeTabValue(newValue);
  };

  const handleVacancyTabChange = (event, newValue) => {
    setVacancyTabValue(newValue);
  };

  // Обработчики изменения файла и полей ввода
  const handleResumeFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setResumeFile(event.target.files[0]);
    }
  };

  const handleResumeUrlChange = (event) => {
    setResumeUrl(event.target.value);
  };

  const handleResumeTextChange = (event) => {
    setResumeText(event.target.value);
  };

  const handleResumeEmailChange = (event) => {
    setResumeEmail(event.target.value);
  };

  const handleVacancyUrlChange = (event) => {
    setVacancyUrl(event.target.value);
  };

  const handleVacancyTextChange = (event) => {
    setVacancyText(event.target.value);
  };

  // Валидация форм
  const validateForms = () => {
    setError(null);

    // Валидация формы резюме
    if (resumeTabValue === 0) { // Файл
      if (!resumeFile) {
        setError('Пожалуйста, выберите PDF файл резюме');
        return false;
      }
      if (!resumeEmail || !resumeEmail.includes('@')) {
        setError('Пожалуйста, введите корректный email');
        return false;
      }
    } else if (resumeTabValue === 1) { // URL
      const cleanUrl = resumeUrl.startsWith('@') ? resumeUrl.substring(1) : resumeUrl.trim();
      if (!cleanUrl || !cleanUrl.match(/^https?:\/\/(www\.)?hh\.ru\/resume\/\w+/)) {
        setError('Пожалуйста, введите корректную ссылку на резюме с hh.ru');
        return false;
      }
    } else { // Текст
      if (!resumeText || resumeText.length < 50) {
        setError('Пожалуйста, введите текст резюме (минимум 50 символов)');
        return false;
      }
    }

    // Валидация формы вакансии
    if (vacancyTabValue === 0) { // URL
      const cleanUrl = vacancyUrl.startsWith('@') ? vacancyUrl.substring(1) : vacancyUrl.trim();
      if (!cleanUrl || !cleanUrl.match(/^https?:\/\/(www\.)?hh\.ru\/vacancy\/\d+/)) {
        setError('Пожалуйста, введите корректную ссылку на вакансию с hh.ru');
        return false;
      }
    } else { // Текст
      if (!vacancyText || vacancyText.length < 50) {
        setError('Пожалуйста, введите текст вакансии (минимум 50 символов)');
        return false;
      }
    }

    return true;
  };

  // Обработчик запроса на сопоставление
  const handleMatch = async () => {
    if (!validateForms()) {
      return;
    }

    try {
      let resumeType, resumeData, vacancyType, vacancyData;

      // Определение типа резюме и данных
      if (resumeTabValue === 0) { // Файл
        resumeType = 'file';
        resumeData = {
          file: resumeFile,
          email: resumeEmail
        };
      } else if (resumeTabValue === 1) { // URL
        resumeType = 'url';
        resumeData = resumeUrl;
      } else { // Текст
        resumeType = 'text';
        resumeData = resumeText;
      }

      // Определение типа вакансии и данных
      if (vacancyTabValue === 0) { // URL
        vacancyType = 'url';
        vacancyData = vacancyUrl;
      } else { // Текст
        vacancyType = 'text';
        vacancyData = vacancyText;
      }

      // Вызов функции из контекста для выполнения сопоставления
      await performMatching(resumeType, resumeData, vacancyType, vacancyData);
    } catch (error) {
      console.error('Error during matching:', error);
      setError('Произошла ошибка при выполнении сопоставления. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Обработчик очистки форм
  const handleClearForms = () => {
    setResumeFile(null);
    setResumeEmail('');
    setResumeUrl('');
    setResumeText('');
    setVacancyUrl('');
    setVacancyText('');
    setError(null);
  };

  // Новый обработчик сопоставления по id
  const handleIdMatch = async () => {
    if (!selectedResume || !selectedVacancy) {
      setError('Пожалуйста, выберите резюме и вакансию');
      return;
    }
    setError(null);
    setMatchingResult(null);
    setLoadingDropdowns(true);
    try {
      const response = await fetch('http://localhost:8081/api/resume-vacancy-matches/full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('hr_partner_auth') ? {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('hr_partner_auth')).token}`
          } : {})
        },
        body: JSON.stringify({
          resumeId: selectedResume.id,
          vacancyId: selectedVacancy.id
        })
      });
      if (!response.ok) throw new Error('Ошибка сопоставления');
      const data = await response.json();
      setMatchingResult(data);
      setResultOpen(true);
    } catch (e) {
      setError('Ошибка сопоставления: ' + e.message);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Сопоставление резюме и вакансий
        </Typography>
        
        <Button
          component={Link}
          to="/matching/history"
          variant="outlined"
          startIcon={<HistoryIcon />}
        >
          История сопоставлений
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {matchingError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {matchingError}
        </Alert>
      )}

      {/* Центрируем формы */}
      <Grid container spacing={3} justifyContent="center" alignItems="center">
        <Grid item xs={12} md={8} lg={6}>
          <Grid container spacing={3} justifyContent="center" alignItems="flex-start">
            {/* Колонка с резюме */}
            <Grid item xs={12} sm={6}>
              <Card>
                <CardHeader
                  title="Резюме"
                  sx={{ bgcolor: '#1976d2', color: 'white' }}
                />
                <CardContent>
                  <Autocomplete
                    options={resumes}
                    getOptionLabel={(option) => option && option.name && option.role ? `${option.name} (${option.role})` : option && option.name ? option.name : ''}
                    loading={loadingDropdowns}
                    value={selectedResume}
                    onChange={(_, value) => setSelectedResume(value)}
                    noOptionsText={loadingDropdowns ? 'Загрузка...' : 'Нет доступных резюме'}
                    renderInput={(params) => (
                      <TextField {...params} label="Выберите резюме" placeholder="Начните вводить имя..." fullWidth />
                    )}
                    isOptionEqualToValue={(option, value) => option && value && option.id === value.id}
                    sx={{ minWidth: 240 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            {/* Колонка с вакансией */}
            <Grid item xs={12} sm={6}>
              <Card>
                <CardHeader
                  title="Вакансия"
                  sx={{ bgcolor: '#1976d2', color: 'white' }}
                />
                <CardContent>
                  <Autocomplete
                    options={vacancies}
                    getOptionLabel={(option) => option && option.title && option.company ? `${option.title} (${option.company})` : option && option.title ? option.title : ''}
                    loading={loadingDropdowns}
                    value={selectedVacancy}
                    onChange={(_, value) => setSelectedVacancy(value)}
                    noOptionsText={loadingDropdowns ? 'Загрузка...' : 'Нет доступных вакансий'}
                    renderInput={(params) => (
                      <TextField {...params} label="Выберите вакансию" placeholder="Начните вводить название..." fullWidth />
                    )}
                    isOptionEqualToValue={(option, value) => option && value && option.id === value.id}
                    sx={{ minWidth: 240 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {/* Кнопка по центру */}
          <Box sx={{ mt: 3, mb: 5, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleIdMatch}
              disabled={loadingDropdowns || loading}
            >
              {loadingDropdowns ? 'Выполняется сопоставление...' : 'Выполнить сопоставление'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Индикатор загрузки поверх экрана */}
      {loadingDropdowns && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(255,255,255,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Модальное окно с результатом сопоставления */}
      <Dialog open={resultOpen} onClose={() => setResultOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Результаты сопоставления</DialogTitle>
        <DialogContent>
          {matchingResult && <MatchingResults results={matchingResult} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MatchingPage; 