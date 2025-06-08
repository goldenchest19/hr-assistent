import React, { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Autocomplete,
  IconButton,
  Divider,
  Rating
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Временные данные для выпадающих списков
const locations = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 
  'Казань', 'Нижний Новгород', 'Челябинск', 'Удаленно'
];

const positions = [
  'Frontend-разработчик', 'Backend-разработчик', 'Fullstack-разработчик',
  'UI/UX Designer', 'Product Manager', 'Project Manager',
  'DevOps Engineer', 'QA Engineer', 'Data Analyst', 'Data Scientist',
  'HR Manager', 'Marketing Specialist', 'Content Manager'
];

const commonSkills = [
  // IT
  'JavaScript', 'React', 'Angular', 'Vue.js', 'TypeScript', 'Node.js', 'Python', 'Java',
  'C#', 'PHP', 'SQL', 'NoSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'HTML', 'CSS',
  'Git', 'CI/CD', 'REST API', 'GraphQL',
  
  // Дизайн
  'UI/UX', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
  
  // Общие навыки
  'Project Management', 'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence',
  'Time Management', 'Team Leadership', 'Presentation Skills', 'English (B2)'
];

const initialFormState = {
  name: '',
  position: '',
  location: '',
  experience: '',
  salary: '',
  education: '',
  skills: [],
  about: '',
  email: '',
  phone: '',
  status: 'new',
  resumeUrl: '',
  rating: 3
};

// Функция для форматирования образования
const formatEducation = (education) => {
  if (Array.isArray(education)) {
    return education.map((edu, idx) =>
      [edu.degree, edu.direction, edu.specialty].filter(Boolean).join(', ')
    ).join('; ');
  }
  return education || '';
};

const CandidateForm = ({ open, onClose, candidate = null }) => {
  // Если передан кандидат, используем его данные, иначе начальное состояние
  const [formData, setFormData] = useState(candidate || initialFormState);
  const [errors, setErrors] = useState({});

  // Проверка является ли форма режимом редактирования
  const isEditMode = !!candidate;
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Обработчик изменения для rating
  const handleRatingChange = (event, newValue) => {
    setFormData(prevState => ({
      ...prevState,
      rating: newValue
    }));
  };
  
  // Обработчик изменения для skills (массив)
  const handleSkillsChange = (event, newValue) => {
    setFormData(prevState => ({
      ...prevState,
      skills: newValue
    }));
  };
  
  // Валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Имя кандидата обязательно';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Должность обязательна';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    
    if (formData.phone && !/^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/.test(formData.phone)) {
      newErrors.phone = 'Некорректный формат телефона';
    }
    
    if (formData.resumeUrl && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(formData.resumeUrl)) {
      newErrors.resumeUrl = 'Некорректный формат ссылки';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обработчик отправки формы
  const handleSubmit = () => {
    if (validateForm()) {
      const allSkills = [
        ...(formData.skills || []),
        ...(formData.hardSkills || []),
        ...(formData.softSkills || [])
      ];
      const data = {
        ...formData,
        skills: allSkills
      };
      onClose(data);
    }
  };
  
  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {isEditMode ? 'Редактирование кандидата' : 'Добавление нового кандидата'}
          <IconButton edge="end" onClick={() => onClose()}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Имя кандидата"
              fullWidth
              required
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={positions}
              value={formData.position}
              onChange={(e, newValue) => {
                setFormData(prev => ({ ...prev, position: newValue }));
                if (errors.position) {
                  setErrors(prev => ({ ...prev, position: '' }));
                }
              }}
              freeSolo
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Должность" 
                  required
                  error={!!errors.position}
                  helperText={errors.position}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={locations}
              value={formData.location}
              onChange={(e, newValue) => {
                setFormData(prev => ({ ...prev, location: newValue }));
              }}
              freeSolo
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Местоположение" 
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="experience"
              label="Опыт работы"
              placeholder="Например: 3 года"
              fullWidth
              value={formData.experience}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="salary"
              label="Ожидаемая зарплата"
              placeholder="Например: 150 000 ₽"
              fullWidth
              value={formData.salary}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="education"
              label="Образование"
              placeholder="Например: Высшее, МГУ, Факультет ВМК"
              fullWidth
              value={Array.isArray(formData.education) ? formatEducation(formData.education) : (formData.education || '')}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="phone"
              label="Телефон"
              placeholder="+7 (999) 123-45-67"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="about"
              label="О кандидате"
              multiline
              rows={3}
              fullWidth
              value={formData.about}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={commonSkills}
              value={formData.skills}
              onChange={handleSkillsChange}
              freeSolo
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Навыки"
                  placeholder="Добавить навык"
                />
              )}
            />
            <Typography variant="caption" color="textSecondary">
              Выберите навыки из списка или добавьте свои
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="resumeUrl"
              label="Ссылка на резюме"
              fullWidth
              value={formData.resumeUrl}
              onChange={handleChange}
              error={!!errors.resumeUrl}
              helperText={errors.resumeUrl}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography component="legend" sx={{ mr: 2 }}>Рейтинг кандидата:</Typography>
              <Rating
                name="rating"
                value={formData.rating}
                onChange={handleRatingChange}
                precision={0.5}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Статус кандидата</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                label="Статус кандидата"
                onChange={handleChange}
              >
                <MenuItem value="new">Новый</MenuItem>
                <MenuItem value="reviewing">На рассмотрении</MenuItem>
                <MenuItem value="interviewing">На собеседовании</MenuItem>
                <MenuItem value="offer">Предложение</MenuItem>
                <MenuItem value="rejected">Отклонен</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => onClose()} color="inherit">
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          color="primary"
        >
          {isEditMode ? 'Сохранить' : 'Добавить кандидата'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CandidateForm; 