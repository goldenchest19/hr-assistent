import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Divider,
  Alert,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useMatching } from '../../context/MatchingContext';
import MatchingResults from './MatchingResults';
import { useNavigate, Link } from 'react-router-dom';

const MatchingDetails = () => {
  const navigate = useNavigate();
  const { currentMatch, error } = useMatching();
  
  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Форматирование информации о резюме
  const getResumeInfo = () => {
    if (!currentMatch) return 'Нет данных';
    
    if (currentMatch.resumeType === 'file') {
      return `Файл: ${currentMatch.resumeFileName || 'Нет имени файла'}`;
    } else if (currentMatch.resumeType === 'url') {
      return `URL: ${currentMatch.resumeUrl || 'Нет ссылки'}`;
    } else {
      return 'Текстовое резюме';
    }
  };
  
  // Форматирование информации о вакансии
  const getVacancyInfo = () => {
    if (!currentMatch) return 'Нет данных';
    
    if (currentMatch.vacancyType === 'url') {
      return `URL: ${currentMatch.vacancyUrl || 'Нет ссылки'}`;
    } else {
      return 'Текстовая вакансия';
    }
  };
  
  // Обработчик возврата к списку сопоставлений
  const handleGoBack = () => {
    navigate('/matching/history');
  };
  
  if (!currentMatch) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          Информация о сопоставлении не найдена. Пожалуйста, вернитесь и выберите сопоставление из списка.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            Вернуться к списку
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Хлебные крошки */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <MuiLink component={Link} to="/matching" underline="hover" color="inherit">
          Сопоставление
        </MuiLink>
        <MuiLink component={Link} to="/matching/history" underline="hover" color="inherit">
          История
        </MuiLink>
        <Typography color="text.primary">Детали</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Детали сопоставления
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          Назад
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Информация
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Дата сопоставления
            </Typography>
            <Typography variant="body1">
              {formatDate(currentMatch.createdAt)}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Идентификатор
            </Typography>
            <Typography variant="body1">
              {currentMatch.id}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Резюме
            </Typography>
            <Typography variant="body1">
              {getResumeInfo()}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Вакансия
            </Typography>
            <Typography variant="body1">
              {getVacancyInfo()}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Результаты сопоставления */}
      <MatchingResults results={currentMatch} />
    </Container>
  );
};

export default MatchingDetails; 