import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  MenuItem
} from '@mui/material';
import {
  ContentPaste as PasteIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

// Примеры форматов импорта
const sampleFormats = {
  text: `Название: Frontend-разработчик
Компания: Tech Solutions
Местоположение: Москва
Зарплата: 120 000 - 180 000 ₽
Опыт работы: 3-5 лет
Описание: Мы ищем опытного Frontend-разработчика со знанием React и TypeScript...
Навыки: React, JavaScript, TypeScript, CSS, HTML
`,
  
  link: 'https://example.com/job/frontend-developer'
};

const sources = [
  { label: 'HeadHunter', value: 'hh' },
  { label: 'Habr Career', value: 'habr' },
  { label: 'GetMatch', value: 'getmatch' },
];

const VacancyImport = ({ open, onClose, onImport }) => {
  const [source, setSource] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Обработчик изменения URL
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    if (error) setError(null);
  };
  
  // Обработчик импорта
  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!source) throw new Error('Пожалуйста, выберите источник');
      if (!url.trim()) throw new Error('Пожалуйста, введите ссылку');
      if (!url.startsWith('http')) throw new Error('Ссылка должна начинаться с http:// или https://');
      const auth = localStorage.getItem('hr_partner_auth');
      const token = auth ? JSON.parse(auth).token : null;
      const response = await fetch('http://localhost:8081/api/vacancies/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ source, url })
      });
      if (!response.ok) throw new Error('Ошибка при импорте вакансии');
      setSnackbarOpen(true);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик закрытия диалога
  const handleClose = () => {
    setSource('');
    setUrl('');
    setError(null);
    onClose();
  };
  
  // Обработчик закрытия снэкбара
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Импортировать вакансию
            <IconButton edge="end" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Источник"
              value={source}
              onChange={e => setSource(e.target.value)}
              fullWidth
              required
              disabled={loading}
            >
              {sources.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Ссылка на вакансию"
              value={url}
              onChange={e => setUrl(e.target.value)}
              fullWidth
              required
              placeholder="https://..."
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>Отмена</Button>
          <Button
            startIcon={loading ? <CircularProgress size={24} /> : <UploadIcon />}
            onClick={handleImport}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Импортирую...' : 'Импортировать'}
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
          Вакансия успешно обработана
        </Alert>
      </Snackbar>
    </>
  );
};

export default VacancyImport; 