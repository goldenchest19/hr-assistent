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
  ListItemText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  FilterList as FilterIcon,
  CloudUpload as ImportIcon,
  TextSnippet as TextIcon,
  UploadFile as FileIcon
} from '@mui/icons-material';
import CandidateCard from './CandidateCard';
import CandidateImport from './CandidateImport';

const CandidateList = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Обработчик изменения вкладки
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    filterCandidates(searchQuery, newValue);
  };
  
  // Обработчик поиска
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterCandidates(query, tabValue);
  };
  
  // Фильтрация кандидатов
  const filterCandidates = (query, tab) => {
    let statusFilter = null;
    if (tab === 1) statusFilter = 1;
    if (tab === 2) statusFilter = 2;
    if (tab === 3) statusFilter = 3;
    if (tab === 4) statusFilter = 4;

    setFilteredCandidates(
      candidates.filter(candidate =>
        (statusFilter ? candidate.candidateStatus?.id === statusFilter : true) &&
        (
          (candidate.name && candidate.name.toLowerCase().includes(query.toLowerCase())) ||
          (candidate.position && candidate.position.toLowerCase().includes(query.toLowerCase())) ||
          (Array.isArray(candidate.skills) && candidate.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase())))
        )
      )
    );
  };
  
  // Обработчики импорта
  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
  };
  
  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
  };
  
  const handleImportCandidate = (importedCandidate) => {
    const newCandidate = {
      ...importedCandidate,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    const updatedCandidates = [...candidates, newCandidate];
    setCandidates(updatedCandidates);
    filterCandidates(searchQuery, tabValue);
    
    showSnackbar('Резюме кандидата успешно импортировано', 'success');
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
  
  const fetchResumes = async () => {
    try {
      const auth = localStorage.getItem('hr_partner_auth');
      const token = auth ? JSON.parse(auth).token : null;
      const response = await fetch('http://localhost:8081/api/resumes', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) throw new Error('Ошибка загрузки резюме');
      const data = await response.json();
      setCandidates(data);
      setFilteredCandidates(data);
    } catch (err) {
      showSnackbar(err.message || 'Ошибка загрузки резюме', 'error');
    }
  };
  
  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Кандидаты
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={() => setImportDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Импорт
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Поиск по имени, должности или навыкам..."
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
        </Grid>
      </Paper>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`Все (${candidates.length})`} />
          <Tab label={`На рассмотрении (${candidates.filter(c => c.candidateStatus?.id === 1).length})`} />
          <Tab label={`Отклонены (${candidates.filter(c => c.candidateStatus?.id === 2).length})`} />
          <Tab label={`Автоподбор (${candidates.filter(c => c.candidateStatus?.id === 3).length})`} />
          <Tab label={`Оффер отправлен (${candidates.filter(c => c.candidateStatus?.id === 4).length})`} />
        </Tabs>
        <Divider />
        
        <Box sx={{ p: 2 }}>
          {filteredCandidates.length > 0 ? (
            <Grid container spacing={3}>
              {filteredCandidates.map(candidate => (
                <Grid item xs={12} md={6} key={candidate.id}>
                  <CandidateCard 
                    candidate={candidate} 
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                Кандидаты не найдены
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Попробуйте изменить параметры поиска
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Диалог импорта резюме */}
      {importDialogOpen && (
        <CandidateImport
          open={importDialogOpen}
          onClose={handleCloseImportDialog}
          onImport={handleImportCandidate}
        />
      )}
      
      {/* Уведомления */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CandidateList; 