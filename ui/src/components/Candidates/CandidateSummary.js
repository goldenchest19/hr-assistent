import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar, 
  Chip, 
  Divider, 
  Grid, 
  Rating,
  Button,
  Link
} from '@mui/material';
import { 
  School as EducationIcon,
  Work as ExperienceIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MonetizationOn as SalaryIcon,
  Description as ResumeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusNames = {
  new: 'Новый',
  reviewing: 'На рассмотрении',
  interviewing: 'На собеседовании',
  offer: 'Предложение',
  rejected: 'Отклонен'
};

const statusColors = {
  new: '#2196f3', // синий
  reviewing: '#ff9800', // оранжевый
  interviewing: '#673ab7', // фиолетовый
  offer: '#4caf50', // зеленый
  rejected: '#f44336' // красный
};

const CandidateSummary = ({ candidate }) => {
  // Форматирование даты
  const formattedDate = React.useMemo(() => {
    try {
      return format(new Date(candidate.createdAt), 'dd MMMM yyyy', { locale: ru });
    } catch (error) {
      return 'Дата не указана';
    }
  }, [candidate.createdAt]);

  // Получение инициалов из имени
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Функция для форматирования образования
  const formatEducation = (education) => {
    if (Array.isArray(education)) {
      return education.map((edu, idx) =>
        [edu.degree, edu.direction, edu.specialty].filter(Boolean).join(', ')
      ).join('; ');
    }
    return education || 'Не указано';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Левая колонка с основной информацией */}
          <Box sx={{ flex: 1 }}>
            {/* Шапка с именем и аватаром */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: statusColors[candidate.status] || 'primary.main',
                  width: 64,
                  height: 64,
                  mr: 2,
                  fontSize: '1.5rem'
                }}
              >
                {getInitials(candidate.name)}
              </Avatar>
              <Box>
                <Typography variant="h5" component="h1">
                  {candidate.name}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {candidate.position}
                </Typography>
                <Chip 
                  label={candidate.candidateStatus?.title || statusNames[candidate.status] || 'Неизвестно'} 
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: `${statusColors[candidate.status]}20`,
                    color: statusColors[candidate.status],
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>

            {/* Контактная информация */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
              Контактная информация
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <Link href={`mailto:${candidate.email}`} underline="hover">
                      {candidate.email}
                    </Link>
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <Link href={`tel:${candidate.phone}`} underline="hover">
                      {candidate.phone}
                    </Link>
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SalaryIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {candidate.salary || 'Не указана'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* О кандидате */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
              О кандидате
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" paragraph>
              {candidate.about || 'Информация отсутствует'}
            </Typography>
            
            {/* Образование и опыт */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
              Образование и опыт
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <EducationIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2">
                      Образование
                    </Typography>
                    <Typography variant="body2">
                      {formatEducation(candidate.education)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <ExperienceIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2">
                      Опыт
                    </Typography>
                    <Typography variant="body2">
                      {candidate.experience || 'Не указан'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {/* Правая колонка с дополнительной информацией */}
          <Box sx={{ width: { xs: '100%', md: '30%' } }}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Навыки
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {[...(candidate.hardSkills || []), ...(candidate.softSkills || []), ...(candidate.skills || [])].map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {(!candidate.hardSkills && !candidate.softSkills && (!candidate.skills || candidate.skills.length === 0)) && (
                    <Typography variant="body2" color="text.secondary">
                      Навыки не указаны
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Информация о резюме
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Добавлен: {formattedDate}
                </Typography>
                {candidate.resumeUrl && (
                  <Button
                    startIcon={<ResumeIcon />}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    component={Link}
                    href={candidate.resumeUrl}
                    target="_blank"
                  >
                    Открыть резюме
                  </Button>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CandidateSummary; 