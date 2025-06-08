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
  Input,
  InputLabel,
  FormControl
} from '@mui/material';
import {
  ContentPaste as PasteIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
  Description as FileIcon
} from '@mui/icons-material';

// Примеры форматов импорта
const sampleFormats = {
  text: `ФИО: Алексей Иванов
Должность: Frontend-разработчик
Местоположение: Москва
Зарплата: 150 000 ₽
Опыт работы: 4 года
Образование: Высшее, МГТУ им. Баумана
О себе: Опытный frontend-разработчик с опытом создания современных веб-приложений...
Навыки: React, JavaScript, TypeScript, HTML, CSS
Email: alexey@example.com
Телефон: +7 (900) 123-45-67
`
};

const CandidateImport = ({ open, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [email, setEmail] = useState('');
  
  // Обработчик изменения файла
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      if (error) setError(null);
    }
  };
  
  // Обработчик изменения email
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };
  
  // Обработчик импорта
  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!file) {
        throw new Error('Пожалуйста, выберите файл для импорта');
      }
      if (!email) {
        throw new Error('Пожалуйста, укажите email для резюме');
      }
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Поддерживаются только файлы форматов PDF, DOC и DOCX');
      }
      const formData = new FormData();
      formData.append('email', email);
      formData.append('file', file);
      const auth = localStorage.getItem('hr_partner_auth');
      const token = auth ? JSON.parse(auth).token : null;
      const response = await fetch('http://localhost:8081/api/resumes/upload', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });
      if (!response.ok) throw new Error('Ошибка при загрузке резюме');
      if (onImport) {
        onImport(); // Триггер обновления списка
      }
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
    setFile(null);
    setError(null);
    setEmail('');
    onClose();
  };
  
  // Обработчик закрытия снэкбара
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Импортировать резюме кандидата
            <IconButton edge="end" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email кандидата"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              required
            />
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
              disabled={loading}
            >
              Загрузить PDF
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Typography variant="body2" color="text.secondary">{file.name}</Typography>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Отмена
          </Button>
          <Button
            startIcon={loading ? <CircularProgress size={24} /> : <UploadIcon />}
            onClick={handleImport}
            variant="contained"
            color="primary"
            disabled={loading || !file || !email}
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
          Резюме кандидата успешно импортировано
        </Alert>
      </Snackbar>
    </>
  );
};

export default CandidateImport; 