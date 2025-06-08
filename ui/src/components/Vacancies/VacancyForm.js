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
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Временные данные для выпадающих списков
const locations = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 
  'Казань', 'Нижний Новгород', 'Челябинск', 'Удаленно'
];

const experienceLevels = [
  'Без опыта', '1-3 года', '3-5 лет', '5+ лет'
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
  'Time Management', 'Team Leadership', 'Presentation Skills', 'Negotiation',
  'Critical Thinking', 'Problem Solving', 'Communication Skills', 'Microsoft Office'
];

const initialFormState = {
  title: '',
  company: '',
  location: '',
  salaryFrom: '',
  salaryTo: '',
  currency: '',
  experience: '',
  description: '',
  skills: [],
  status: 'Активная',
  source: ''
};

const VacancyForm = ({ open, onClose, vacancy = null }) => {
  // Если передана вакансия, используем её данные, иначе начальное состояние
  const [formData, setFormData] = useState(vacancy || initialFormState);
  const [errors, setErrors] = useState({});

  // Проверка является ли форма режимом редактирования
  const isEditMode = !!vacancy;
  
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Название вакансии обязательно';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Название компании обязательно';
    }
    
    if (!formData.location) {
      newErrors.location = 'Местоположение обязательно';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание вакансии обязательно';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обработчик отправки формы
  const handleSubmit = () => {
    if (validateForm()) {
      // Привести salaryFrom/salaryTo к числу, если возможно
      const data = {
        ...formData,
        salaryFrom: formData.salaryFrom ? Number(formData.salaryFrom) : undefined,
        salaryTo: formData.salaryTo ? Number(formData.salaryTo) : undefined,
        status: 'Активная',
      };
      onClose(data);
    }
  };
  
  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {isEditMode ? 'Редактирование вакансии' : 'Добавление новой вакансии'}
          <IconButton edge="end" onClick={() => onClose()}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      
      <DialogContent>
        <Grid container spacing={3} direction="column" sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Название вакансии"
              fullWidth
              required
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              placeholder="Например: Java Developer"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="company"
              label="Название компании"
              fullWidth
              required
              value={formData.company}
              onChange={handleChange}
              error={!!errors.company}
              helperText={errors.company}
              placeholder="Tech Company"
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={locations}
              value={formData.location}
              onChange={(e, newValue) => {
                setFormData(prev => ({ ...prev, location: newValue }));
                if (errors.location) {
                  setErrors(prev => ({ ...prev, location: '' }));
                }
              }}
              freeSolo
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Местоположение" 
                  required
                  error={!!errors.location}
                  helperText={errors.location}
                  placeholder="Москва"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="salaryFrom"
              label="Зарплата от"
              type="number"
              value={formData.salaryFrom}
              onChange={handleChange}
              fullWidth
              placeholder="100000"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="salaryTo"
              label="Зарплата до"
              type="number"
              value={formData.salaryTo}
              onChange={handleChange}
              fullWidth
              placeholder="200000"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="currency"
              label="Валюта"
              value={formData.currency}
              onChange={handleChange}
              fullWidth
              placeholder="₽, $, € и т.д."
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="experience-label">Опыт работы</InputLabel>
              <Select
                labelId="experience-label"
                name="experience"
                value={formData.experience}
                label="Опыт работы"
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="" disabled>
                  <em>Выберите опыт работы</em>
                </MenuItem>
                {experienceLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Описание вакансии"
              multiline
              rows={4}
              fullWidth
              required
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="Опишите обязанности, требования и условия..."
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
                  helperText="Выберите навыки из списка или добавьте свои"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="source"
              label="Источник"
              fullWidth
              value={formData.source}
                onChange={handleChange}
              placeholder="hh.ru, Внутренняя база и т.д."
              helperText="Укажите источник вакансии"
            />
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
          {isEditMode ? 'Сохранить' : 'Добавить вакансию'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VacancyForm; 