import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Avatar,
  Rating,
  Link
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  School as EducationIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as ResumeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
  EventNote as InterviewIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Person as PersonIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import MatchingResults from '../Matching/MatchingResults';

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

const CandidateCard = ({ candidate, onEdit, onDelete, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState({});
  const [vacanciesOpen, setVacanciesOpen] = useState(false);
  const [matchingResult, setMatchingResult] = useState(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [allVacanciesOpen, setAllVacanciesOpen] = useState(false);
  const [allVacancies, setAllVacancies] = useState([]);
  const [vacanciesLoading, setVacanciesLoading] = useState(false);
  const [candidateStatuses, setCandidateStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  
  // Форматирование даты
  const formattedDate = React.useMemo(() => {
    try {
      return format(new Date(candidate.createdAt), 'dd MMMM yyyy', { locale: ru });
    } catch (error) {
      return 'Дата не указана';
    }
  }, [candidate.createdAt]);
  
  // Обработчики для меню действий
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Обработчики для меню статуса
  const handleStatusMenuOpen = async (event) => {
    setStatusAnchorEl(event.currentTarget);
    handleMenuClose();
    setStatusesLoading(true);
    try {
      const res = await fetch('http://localhost:8081/api/candidate-status', {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('hr_partner_auth') ? {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('hr_partner_auth')).token}`
          } : {})
        }
      });
      const data = await res.json();
      setCandidateStatuses(data);
    } catch {
      setCandidateStatuses([]);
    } finally {
      setStatusesLoading(false);
    }
  };
  
  const handleStatusMenuClose = () => {
    setStatusAnchorEl(null);
  };
  
  // Обработчики действий
  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) onEdit(candidate);
  };
  
  const handleDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };
  
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };
  
  const handleDeleteConfirmed = () => {
    setDeleteConfirmOpen(false);
    if (onDelete) onDelete(candidate.id);
  };
  
  const handleStatusChange = async (statusId) => {
    handleStatusMenuClose();
    try {
      await fetch('http://localhost:8081/api/resumes/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('hr_partner_auth') ? {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('hr_partner_auth')).token}`
          } : {})
        },
        body: JSON.stringify({
          resumeId: candidate.id,
          statusId
        })
      });
      if (onStatusChange) onStatusChange(candidate.id, statusId);
    } catch (e) {
      // Можно добавить обработку ошибки
    }
  };
  
  const handleViewResume = () => {
    window.open(candidate.resumeUrl, '_blank');
    handleMenuClose();
  };
  
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
  
  // Функция для форматирования периода работы
  const formatPeriod = (start, end) => {
    return `${start || ''}${start && end ? ' — ' : ''}${end || ''}`;
  };
  
  const handleToggleAchievements = (idx) => {
    setShowAllAchievements((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };
  
  const handleVacanciesOpen = () => setVacanciesOpen(true);
  const handleVacanciesClose = () => setVacanciesOpen(false);
  const handleResultClose = () => setResultOpen(false);
  
  const handleAllVacanciesOpen = () => { setAllVacanciesOpen(true); handleMenuClose(); };
  const handleAllVacanciesClose = () => setAllVacanciesOpen(false);
  
  // Функция для сопоставления резюме и вакансии
  const handleMatchVacancy = async (vacancyId) => {
    setMatchingLoading(true);
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
          resumeId: candidate.id,
          vacancyId
        })
      });
      if (!response.ok) throw new Error('Ошибка сопоставления');
      const data = await response.json();
      setMatchingResult(data);
      setResultOpen(true);
    } catch (e) {
      setMatchingResult({ error: e.message });
      setResultOpen(true);
    } finally {
      setMatchingLoading(false);
    }
  };
  
  // Загрузка вакансий при открытии окна
  useEffect(() => {
    if (allVacanciesOpen) {
      setVacanciesLoading(true);
      fetch('http://localhost:8081/api/vacancies', {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('hr_partner_auth') ? {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('hr_partner_auth')).token}`
          } : {})
        }
      })
        .then(res => res.json())
        .then(data => setAllVacancies(data?.data || data || []))
        .catch(() => setAllVacancies([]))
        .finally(() => setVacanciesLoading(false));
    }
  }, [allVacanciesOpen]);
  
  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: statusColors[candidate.status] || 'primary.main',
                  mr: 2
                }}
              >
                {getInitials(candidate.name)}
              </Avatar>
              <Box>
                <Typography variant="h6" component="h2">
                  {candidate.name}
                  {candidate.candidateStatus?.title || statusNames[candidate.status] ? (
                    <Chip 
                      label={candidate.candidateStatus?.title || statusNames[candidate.status]}
                      size="small"
                      sx={{
                        ml: 2,
                        bgcolor: `${statusColors[candidate.status]}20`,
                        color: statusColors[candidate.status],
                        fontWeight: 'bold',
                        fontSize: '1em',
                        height: 28
                      }}
                    />
                  ) : null}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button variant="outlined" size="small" onClick={handleVacanciesOpen} sx={{ minWidth: 0, fontWeight: 500 }}>
                Подходящие вакансии
              </Button>
              <IconButton 
                size="small" 
                onClick={handleMenuOpen} 
                aria-label="Действия"
                aria-controls="candidate-menu"
                aria-haspopup="true"
              >
                <MoreIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {/* Образование */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EducationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Образование:</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatEducation(candidate.education)}
            </Typography>
          </Box>
          {/* Опыт работы */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WorkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Опыт работы:</Typography>
            </Box>
            {Array.isArray(candidate.workExperience) && candidate.workExperience.length > 0 ? (
              candidate.workExperience.map((exp, idx) => (
                <Box key={idx} sx={{ mb: 2, pl: 1, borderLeft: '2px solid #eee' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {exp.company_name} <span style={{ color: '#888', fontWeight: 400 }}>({formatPeriod(exp.start_date, exp.end_date)})</span>
                  </Typography>
                  {exp.role && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 0.5 }}>
                      {exp.role}
                    </Typography>
                  )}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                      {exp.technologies.map((tech, i) => (
                        <Chip key={i} label={tech} size="small" color="default" variant="outlined" />
                      ))}
                    </Box>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <Box>
                      {(showAllAchievements[idx] ? exp.achievements : exp.achievements.slice(0, 2)).map((ach, i) => (
                        <Typography key={i} variant="body2" sx={{ fontSize: '0.95em', color: 'text.secondary', pl: 1, mb: 0.5 }}>
                          • {ach}
                        </Typography>
                      ))}
                      {exp.achievements.length > 2 && (
                        <Button size="small" onClick={() => handleToggleAchievements(idx)} sx={{ pl: 1, textTransform: 'none', minWidth: 0 }} color="primary">
                          {showAllAchievements[idx] ? 'Скрыть' : `Показать все (${exp.achievements.length})`}
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">{candidate.experience || 'Не указан'}</Typography>
            )}
          </Box>
          {/* Ожидания по ЗП */}
          {candidate.salary && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Ожидания по ЗП:
              </Typography>
              <Typography variant="body2">{candidate.salary}</Typography>
            </Box>
          )}
          {/* Навыки */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Навыки:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {(candidate.hardSkills || []).map((skill, index) => (
                <Chip key={index} label={skill} size="small" color="default" variant="outlined" />
              ))}
            </Box>
            {candidate.softSkills && candidate.softSkills.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {candidate.softSkills.map((skill, idx) => (
                  <Chip key={idx} label={skill} size="small" color="secondary" variant="filled" />
                ))}
              </Box>
            )}
            {(candidate.skills && candidate.skills.length > 0) && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {candidate.skills.map((skill, idx) => (
                  <Chip key={idx} label={skill} size="small" color="default" variant="outlined" />
                ))}
              </Box>
            )}
            {(!candidate.hardSkills && !candidate.softSkills && (!candidate.skills || candidate.skills.length === 0)) && (
              <Typography variant="body2" color="text.secondary">
                Навыки не указаны
              </Typography>
            )}
          </Box>
          {/* Контакты */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <EmailIcon color="primary" sx={{ mr: 0.5 }} />
            <Typography variant="body2" sx={{ mr: 2 }}>
              {candidate.email}
            </Typography>
            <PhoneIcon color="primary" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {candidate.phone}
            </Typography>
          </Box>
          {/* Дата добавления */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Добавлен: {formattedDate}
          </Typography>
          {/* Кнопки EMAIL и ПОЗВОНИТЬ */}
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EmailIcon />}
              fullWidth
              href={`mailto:${candidate.email}`}
              sx={{ fontWeight: 'bold', fontSize: '1em' }}
            >
              EMAIL
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PhoneIcon />}
              fullWidth
              href={`tel:${candidate.phone}`}
              sx={{ fontWeight: 'bold', fontSize: '1em' }}
            >
              ПОЗВОНИТЬ
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Меню действий */}
      <Menu
        id="candidate-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleAllVacanciesOpen}>
          <ListItemIcon>
            <WorkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Открыть вакансии</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleStatusMenuOpen}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Изменить статус</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteConfirm} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Меню статусов */}
      <Menu
        id="status-menu"
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={handleStatusMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {statusesLoading ? (
          <MenuItem disabled>Загрузка...</MenuItem>
        ) : candidateStatuses.length > 0 ? (
          candidateStatuses.map(status => (
            <MenuItem key={status.id} onClick={() => handleStatusChange(status.id)}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{status.title}</ListItemText>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>Нет статусов</MenuItem>
        )}
      </Menu>
      
      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Удаление кандидата</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить кандидата "{candidate.name}"? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Отмена
          </Button>
          <Button onClick={handleDeleteConfirmed} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Модальное окно с подходящими вакансиями */}
      <Dialog open={vacanciesOpen} onClose={handleVacanciesClose} maxWidth="sm" fullWidth>
        <DialogTitle>Подходящие вакансии</DialogTitle>
        <DialogContent>
          {Array.isArray(candidate.matchedVacancies) && candidate.matchedVacancies.length > 0 ? (
            candidate.matchedVacancies.map((vac) => (
              <Box key={vac.vacancyId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography>{vac.title}</Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleMatchVacancy(vac.vacancyId)}
                  disabled={matchingLoading}
                >
                  {matchingLoading ? 'Сопоставление...' : 'Сопоставить'}
                </Button>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">Нет подходящих вакансий</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVacanciesClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      
      {/* Модальное окно с результатом сопоставления */}
      <Dialog open={resultOpen} onClose={handleResultClose} maxWidth="md" fullWidth>
        <DialogTitle>Результаты сопоставления</DialogTitle>
        <DialogContent>
          {matchingResult && matchingResult.error ? (
            <Typography color="error">{matchingResult.error}</Typography>
          ) : matchingResult ? (
            <MatchingResults results={matchingResult} />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResultClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      
      {/* Модальное окно со всеми вакансиями */}
      <Dialog open={allVacanciesOpen} onClose={handleAllVacanciesClose} maxWidth="sm" fullWidth>
        <DialogTitle>Все вакансии</DialogTitle>
        <DialogContent>
          {vacanciesLoading ? (
            <Typography color="text.secondary">Загрузка...</Typography>
          ) : Array.isArray(allVacancies) && allVacancies.length > 0 ? (
            allVacancies.map((vac) => (
              <Box key={vac.vacancyId || vac.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography>{vac.title}</Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleMatchVacancy(vac.vacancyId || vac.id)}
                  disabled={matchingLoading}
                >
                  {matchingLoading ? 'Сопоставление...' : 'Сопоставить'}
                </Button>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">Нет вакансий</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAllVacanciesClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CandidateCard; 