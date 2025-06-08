import React, { useState } from 'react';
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
  Button
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  Business as CompanyIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Close as CloseIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const VacancyCard = ({ vacancy, onEdit, onDelete, onDuplicate, onStatusChange, sx }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Форматирование даты
  const formattedDate = React.useMemo(() => {
    try {
      return format(new Date(vacancy.createdAt), 'dd MMMM yyyy', { locale: ru });
    } catch (error) {
      return 'Дата не указана';
    }
  }, [vacancy.createdAt]);
  
  // Приведение skills к массиву
  const skillsArray = React.useMemo(() => {
    if (Array.isArray(vacancy.skills)) {
      if (vacancy.skills.length === 0) return [];
      const arr = vacancy.skills.map((s, i) => {
        let skill = s;
        if (i === 0) skill = skill.replace(/^\[/, '');
        if (i === vacancy.skills.length - 1) skill = skill.replace(/\]$/, '');
        return skill.trim();
      });
      return arr.filter(Boolean);
    }
    if (typeof vacancy.skills === 'string') {
      try {
        if (vacancy.skills.trim().startsWith('[') && vacancy.skills.trim().endsWith(']')) {
          return JSON.parse(vacancy.skills.replace(/'/g, '"'));
        }
      } catch (e) {}
      return vacancy.skills.split(',').map(s => s.replace(/\[|\]/g, '').trim()).filter(Boolean);
    }
    return [];
  }, [vacancy.skills]);
  
  // Форматирование зарплаты
  const salaryString = React.useMemo(() => {
    if (vacancy.salaryFrom && vacancy.salaryTo) {
      return `от ${vacancy.salaryFrom} до ${vacancy.salaryTo}${vacancy.currency ? ' ' + vacancy.currency : ''}`;
    }
    if (vacancy.salaryFrom) {
      return `от ${vacancy.salaryFrom}${vacancy.currency ? ' ' + vacancy.currency : ''}`;
    }
    if (vacancy.salaryTo) {
      return `до ${vacancy.salaryTo}${vacancy.currency ? ' ' + vacancy.currency : ''}`;
    }
    return 'Не указана';
  }, [vacancy.salaryFrom, vacancy.salaryTo, vacancy.currency]);
  
  // Приведение статуса к единому виду
  const statusLabel = React.useMemo(() => {
    if (!vacancy.status) return 'Неизвестно';
    const s = vacancy.status.toLowerCase();
    if (s === 'active' || s === 'активная') return 'Активная';
    if (s === 'closed' || s === 'закрыта') return 'Закрыта';
    return vacancy.status;
  }, [vacancy.status]);
  const statusColor = React.useMemo(() => {
    if (!vacancy.status) return 'default';
    const s = vacancy.status.toLowerCase();
    if (s === 'active' || s === 'активная') return 'success';
    return 'default';
  }, [vacancy.status]);
  
  // Обработчики для меню
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Обработчики действий
  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) onEdit(vacancy);
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
    if (onDelete) onDelete(vacancy.id);
  };
  
  const handleDuplicate = () => {
    handleMenuClose();
    if (onDuplicate) onDuplicate(vacancy);
  };
  
  const handleStatusChange = () => {
    handleMenuClose();
    const newStatus = vacancy.status === 'active' ? 'closed' : 'active';
    if (onStatusChange) onStatusChange(vacancy.id, newStatus);
  };
  
  const handleView = () => {
    console.log('View vacancy details:', vacancy);
    handleMenuClose();
  };
  
  return (
    <>
      <Card sx={{ height: '100%', minHeight: 350, maxWidth: 700, width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', ...sx }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {vacancy.title}
            </Typography>
            
            <Box>
              <IconButton 
                size="small" 
                onClick={handleMenuOpen} 
                aria-label="Действия"
                aria-controls="vacancy-menu"
                aria-haspopup="true"
              >
                <MoreIcon />
              </IconButton>
              <Menu
                id="vacancy-menu"
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
                <MenuItem onClick={handleView}>
                  <ListItemIcon>
                    <ViewIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Просмотреть</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleEdit}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Редактировать</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDuplicate}>
                  <ListItemIcon>
                    <DuplicateIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Дублировать</ListItemText>
                </MenuItem>
                <Divider />
                {vacancy.status === 'active' ? (
                  <MenuItem onClick={handleStatusChange}>
                    <ListItemIcon>
                      <CloseIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Закрыть вакансию</ListItemText>
                  </MenuItem>
                ) : (
                  <MenuItem onClick={handleStatusChange}>
                    <ListItemIcon>
                      <ViewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Активировать</ListItemText>
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleDeleteConfirm} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Удалить</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CompanyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {vacancy.company}
            </Typography>
          </Box>
          
          {/* Источник */}
          {vacancy.source && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Источник:</strong> {vacancy.source}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {vacancy.location}
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2 }} color="text.primary">
            <strong>Зарплата:</strong> {salaryString}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }} color="text.primary">
            <strong>Опыт:</strong> {vacancy.experience}
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              color: 'text.secondary',
              wordBreak: 'break-word',
              whiteSpace: 'pre-line',
            }}
          >
            {vacancy.description}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {skillsArray.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary">
              Создано: {formattedDate}
            </Typography>
            
            <Chip 
              label={statusLabel}
              color={statusColor}
              size="small"
            />
          </Box>
        </CardContent>
      </Card>
      
      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Удаление вакансии</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить вакансию "{vacancy.title}"? Это действие нельзя будет отменить.
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
    </>
  );
};

export default VacancyCard; 