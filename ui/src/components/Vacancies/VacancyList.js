import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Button,
  Grid,
  Tabs,
  Tab,
  Divider,
  TextField,
  InputAdornment,
  Fab,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  FilterList as FilterIcon,
  CloudUpload as ImportIcon,
  Link as LinkIcon,
  TextSnippet as TextIcon
} from '@mui/icons-material';
import VacancyCard from './VacancyCard';
import VacancyForm from './VacancyForm';
import VacancyImport from './VacancyImport';
import VacancyGenerate from './VacancyGenerate';
import { vacancyAPI } from '../../utils/api';

const VacancyList = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [vacancies, setVacancies] = useState([]);
  const [filteredVacancies, setFilteredVacancies] = useState([]);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [currentVacancy, setCurrentVacancy] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [importMenuAnchorEl, setImportMenuAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Загрузка вакансий с сервера
  const fetchVacancies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vacancyAPI.getAll();
      setVacancies(response.data);
      filterVacancies(searchQuery, tabValue, response.data);
    } catch (err) {
      setError('Ошибка загрузки вакансий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
    // eslint-disable-next-line
  }, []);
  
  // Фильтрация вакансий
  const filterVacancies = (query, tab, sourceVacancies = vacancies) => {
    let statusFilter = '';
    if (tab === 1) statusFilter = 'active';
    if (tab === 2) statusFilter = 'closed';
    setFilteredVacancies(
      sourceVacancies.filter(vacancy => {
        // Фильтрация по статусу
        let statusOk = true;
        if (statusFilter) {
          const s = (vacancy.status || '').toLowerCase();
          if (statusFilter === 'active') statusOk = s === 'active' || s === 'активная' || s === 'open' || s === 'открыта';
          if (statusFilter === 'closed') statusOk = s === 'closed' || s === 'закрыта';
        }
        // Фильтрация по названию
        const titleOk = (vacancy.title || '').toLowerCase().includes(query.toLowerCase());
        return statusOk && titleOk;
      })
    );
  };
  
  // Обработчик изменения вкладки
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    filterVacancies(searchQuery, newValue);
  };
  
  // Обработчик поиска
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterVacancies(query, tabValue);
  };
  
  // Обработчик открытия формы
  const handleOpenForm = (vacancy = null) => {
    setCurrentVacancy(vacancy);
    setFormDialogOpen(true);
  };
  
  // Обработчик закрытия формы
  const handleCloseForm = async (formData) => {
    setFormDialogOpen(false);
    
    if (formData && formData !== true) {
      try {
      if (currentVacancy) {
          await vacancyAPI.update(currentVacancy.id, formData);
        showSnackbar('Вакансия успешно обновлена', 'success');
      } else {
          await vacancyAPI.create(formData);
        showSnackbar('Вакансия успешно создана', 'success');
        }
        fetchVacancies();
      } catch (err) {
        showSnackbar('Ошибка при сохранении вакансии', 'error');
      }
    }
    
    setCurrentVacancy(null);
  };
  
  // Обработчик удаления вакансии
  const handleDeleteVacancy = async (id) => {
    try {
      await vacancyAPI.delete(id);
    showSnackbar('Вакансия удалена', 'success');
      fetchVacancies();
    } catch (err) {
      showSnackbar('Ошибка при удалении вакансии', 'error');
    }
  };
  
  // Обработчик дублирования вакансии
  const handleDuplicateVacancy = async (vacancy) => {
    try {
      const { id, createdAt, ...rest } = vacancy;
      await vacancyAPI.create({ ...rest, title: `${vacancy.title} (копия)` });
    showSnackbar('Вакансия успешно дублирована', 'success');
      fetchVacancies();
    } catch (err) {
      showSnackbar('Ошибка при дублировании вакансии', 'error');
    }
  };
  
  // Обработчик изменения статуса вакансии
  const handleStatusChange = async (id, newStatus) => {
    try {
      const vacancy = vacancies.find(v => v.id === id);
      if (!vacancy) return;
      await vacancyAPI.update(id, { ...vacancy, status: newStatus });
      showSnackbar(newStatus === 'active' ? 'Вакансия активирована' : 'Вакансия закрыта', 'success');
      fetchVacancies();
    } catch (err) {
      showSnackbar('Ошибка при изменении статуса', 'error');
    }
  };
  
  // Обработчики импорта
  const handleImportMenuOpen = (event) => {
    setImportMenuAnchorEl(event.currentTarget);
  };
  
  const handleImportMenuClose = () => {
    setImportMenuAnchorEl(null);
  };
  
  const handleOpenImportDialog = () => {
    handleImportMenuClose();
    setImportDialogOpen(true);
  };
  
  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
  };
  
  const handleImportVacancy = async (importedVacancy) => {
    try {
      await vacancyAPI.create(importedVacancy);
    showSnackbar('Вакансия успешно импортирована', 'success');
      fetchVacancies();
    } catch (err) {
      showSnackbar('Ошибка при импорте вакансии', 'error');
    }
  };
  
  // Функция показа уведомления
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  useEffect(() => {
    filterVacancies(searchQuery, tabValue);
    // eslint-disable-next-line
  }, [vacancies, searchQuery, tabValue]);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Вакансии</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ImportIcon />}
              onClick={handleOpenImportDialog}
              sx={{ mr: 2, minWidth: 140 }}
            >
              ИМПОРТ
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setGenerateDialogOpen(true)}
              sx={{ mr: 2, minWidth: 240 }}
            >
              Сгенерировать вакансию с помощью ИИ
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              sx={{ minWidth: 240 }}
            >
              ДОБАВИТЬ ВАКАНСИЮ
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
              <Tab label="ВСЕ" />
              <Tab label="АКТИВНЫЕ" />
              <Tab label="ЗАКРЫТЫЕ" />
        </Tabs>
        <Divider />
        
        <Box sx={{ p: 2 }}>
          {filteredVacancies.length > 0 ? (
                <Grid container spacing={3} direction="column">
              {filteredVacancies.map(vacancy => (
                    <Grid item xs={12} key={vacancy.id}>
                  <VacancyCard 
                    vacancy={vacancy} 
                    onEdit={() => handleOpenForm(vacancy)}
                    onDelete={handleDeleteVacancy}
                    onDuplicate={handleDuplicateVacancy}
                    onStatusChange={handleStatusChange}
                        sx={{ minHeight: 350, width: '100%' }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                Вакансии не найдены
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Попробуйте изменить параметры поиска или создать новую вакансию
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      <Fab 
        color="primary" 
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenForm()}
      >
        <AddIcon />
      </Fab>
      
      {/* Форма добавления/редактирования вакансии */}
      <VacancyForm
        open={formDialogOpen}
        onClose={handleCloseForm}
        vacancy={currentVacancy}
      />
      
      {/* Диалог импорта вакансий */}
      <VacancyImport
        open={importDialogOpen}
        onClose={handleCloseImportDialog}
        onImport={handleImportVacancy}
      />
      
      {/* Диалог генерации вакансии */}
      <VacancyGenerate
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
      />
      
      {/* Уведомления */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
        </>
      )}
    </Container>
  );
};

export default VacancyList; 