import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Upload as UploadIcon } from '@mui/icons-material';

const initialState = {
  position: '',
  company: '',
  requiredSkills: '',
  experienceYears: '',
  location: '',
  salaryRange: '',
  companyDescription: '',
  additionalInfo: ''
};

const VacancyGenerate = ({ open, onClose }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Валидация
      if (!form.position || !form.company || !form.requiredSkills || !form.experienceYears || !form.location) {
        throw new Error('Пожалуйста, заполните обязательные поля');
      }
      const auth = localStorage.getItem('hr_partner_auth');
      const token = auth ? JSON.parse(auth).token : null;
      const body = {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        experienceYears: Number(form.experienceYears)
      };
      const response = await fetch('http://localhost:8081/api/vacancies/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error('Ошибка при генерации вакансии');
      setSnackbarOpen(true);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(initialState);
    setError(null);
    onClose();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Сгенерировать вакансию с помощью ИИ</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="position"
              label="Должность"
              value={form.position}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="company"
              label="Компания"
              value={form.company}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="requiredSkills"
              label="Требуемые навыки (через запятую)"
              value={form.requiredSkills}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="experienceYears"
              label="Требуемый опыт (лет)"
              value={form.experienceYears}
              onChange={handleChange}
              required
              type="number"
              fullWidth
            />
            <TextField
              name="location"
              label="Локация"
              value={form.location}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="salaryRange"
              label="Зарплатный диапазон"
              value={form.salaryRange}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="companyDescription"
              label="Описание компании"
              value={form.companyDescription}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="additionalInfo"
              label="Дополнительная информация"
              value={form.additionalInfo}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>Отмена</Button>
          <Button
            startIcon={loading ? <CircularProgress size={24} /> : <UploadIcon />}
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Генерирую...' : 'Сгенерировать'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Вакансия успешно сгенерирована
        </Alert>
      </Snackbar>
    </>
  );
};

export default VacancyGenerate; 