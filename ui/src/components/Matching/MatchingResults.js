import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Comment as CommentIcon
} from '@mui/icons-material';

// Функция для форматирования числа в процентный формат
const formatPercent = (num) => {
  return `${Math.round(num * 100)}%`;
};

// Функция для определения цвета индикатора оценки
const getScoreColor = (score) => {
  if (score >= 0.7) return '#4caf50';
  if (score >= 0.5) return '#ff9800';
  return '#f44336';
};

// Функция для определения текстового статуса соответствия
const getMatchStatus = (score) => {
  if (score >= 0.8) return 'Отличное соответствие';
  if (score >= 0.6) return 'Хорошее соответствие';
  if (score >= 0.4) return 'Среднее соответствие';
  return 'Низкое соответствие';
};

const MatchingResults = ({ results }) => {
  const {
    score,
    verdict,
    matchedSkills = [],
    unmatchedSkills = [],
    positives = [],
    negatives = [],
    llmComment = '',
    clarifyingQuestions = []
  } = results;

  const scoreColor = getScoreColor(score);
  const matchStatus = getMatchStatus(score);

  return (
    <Paper sx={{ p: 3, mb: 5 }}>
      <Typography variant="h5" gutterBottom>
        Результаты сопоставления
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* Общая оценка */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Оценка соответствия
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: scoreColor }}>
                  {formatPercent(score)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={score * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  mb: 2,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: scoreColor
                  }
                }}
              />
              <Typography variant="subtitle1" sx={{ color: scoreColor }}>
                {matchStatus}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {verdict}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Совпадающие навыки */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Совпадающие навыки
              </Typography>
              {matchedSkills.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {matchedSkills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      color="success"
                      variant="outlined"
                      icon={<CheckIcon />}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Совпадающие навыки не найдены
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Отсутствующие навыки */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Отсутствующие навыки
              </Typography>
              {unmatchedSkills.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {unmatchedSkills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      color="error"
                      variant="outlined"
                      icon={<CloseIcon />}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Отсутствующие навыки не найдены
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Позитивные факторы */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Сильные стороны
                </Typography>
              </Box>
              {positives.length > 0 ? (
                <List dense disablePadding>
                  {positives.map((positive, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={positive} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Сильные стороны не выявлены
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Негативные факторы */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Слабые стороны
                </Typography>
              </Box>
              {negatives.length > 0 ? (
                <List dense disablePadding>
                  {negatives.map((negative, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CloseIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={negative} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Слабых сторон не выявлено
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Комментарий ИИ */}
        {llmComment && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CommentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Комментарий ИИ
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {llmComment}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Вопросы для кандидата */}
        {clarifyingQuestions && clarifyingQuestions.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CommentIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Вопросы для кандидата
                  </Typography>
                </Box>
                <List dense>
                  {clarifyingQuestions.map((q, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon><CommentIcon color="secondary" fontSize="small" /></ListItemIcon>
                      <ListItemText primary={q} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default MatchingResults; 