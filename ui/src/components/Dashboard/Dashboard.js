import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  CircularProgress,
  Alert
} from '@mui/material';
import StatisticCard from './StatisticCard';
import { 
  WorkOutline as VacancyIcon, 
  PersonOutline as CandidateIcon,
  CheckCircleOutline as MatchIcon,
  TrendingUp as TrendIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8081/api/vacancies/stats', {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('hr_partner_auth') ? {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('hr_partner_auth')).token}`
        } : {})
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки статистики');
        return res.json();
      })
      .then(data => setStats(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Добро пожаловать, {user?.name || 'пользователь'}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Панель управления HR Partner - ваш инструмент для эффективного подбора персонала
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : stats ? (
        <Grid container spacing={3}>
          {/* Статистика по вакансиям */}
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard
              title="Всего вакансий"
              value={stats.totalVacancies}
              icon={<VacancyIcon />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard
              title="Активные вакансии"
              value={stats.activeVacancies}
              icon={<VacancyIcon />}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard
              title="Кандидаты на собеседовании"
              value={stats.status5Vacancies}
              icon={<VacancyIcon />}
              color="#bdbdbd"
            />
          </Grid>
          {/* Статистика по кандидатам */}
          <Grid item xs={12} sm={6} md={3}>
            <StatisticCard
              title="Всего кандидатов"
              value={stats.totalCandidates}
              icon={<CandidateIcon />}
              color="#4caf50"
            />
          </Grid>
          {/* Кандидаты с высоким соответствием */}
          <Grid item xs={12} sm={6} md={6}>
            <StatisticCard
              title="Количество высоких соответствий"
              value={stats.highScoreCandidates}
              icon={<MatchIcon />}
              color="#ff9800"
              height={150}
            />
          </Grid>
          {/* Новые сопоставления за сегодня */}
          <Grid item xs={12} sm={6} md={6}>
            <StatisticCard
              title="Новые сопоставления за сегодня"
              value={stats.matchesToday}
              icon={<TrendIcon />}
              color="#f44336"
              height={150}
            />
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">Нет данных для отображения</Alert>
      )}
    </Container>
  );
};

export default Dashboard; 