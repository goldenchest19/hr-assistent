import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  OpenInNew as OpenIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useMatching } from '../../context/MatchingContext';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MatchingResults from './MatchingResults';

// Функция для форматирования даты
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Функция для определения цвета статуса оценки
const getScoreColor = (score) => {
  if (score >= 0.7) return '#4caf50';
  if (score >= 0.5) return '#ff9800';
  return '#f44336';
};

// Функция для форматирования числа в процентный формат
const formatPercent = (num) => {
  return `${Math.round(num * 100)}%`;
};

const MatchingHistory = () => {
  const navigate = useNavigate();
  const { 
    matchHistory, 
    loading, 
    error, 
    fetchMatchHistory, 
    fetchMatchById
  } = useMatching();
  
  // Локальное состояние для пагинации
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Добавляю модальное окно для просмотра деталей сопоставления
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchMatchHistory({ page: page + 1, limit: rowsPerPage });
  }, [page, rowsPerPage, fetchMatchHistory]);
  
  // Обработчики изменения пагинации
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Обработчик просмотра детальной информации о сопоставлении
  const handleViewMatch = async (id) => {
    try {
      const match = matchHistory.find((m) => m.id === id);
      setSelectedMatch(match);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching match details:', error);
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          Назад
        </Button>
        <Typography variant="h5" gutterBottom>
          История сопоставлений
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Резюме</TableCell>
                <TableCell>Вакансия</TableCell>
                <TableCell>Оценка</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={30} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : matchHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography color="text.secondary">
                        История сопоставлений пуста
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                matchHistory.map((match) => (
                  <TableRow key={match.id} hover>
                    <TableCell>{formatDate(match.createdAt)}</TableCell>
                    <TableCell>
                      {match.resumeName ? `${match.resumeName} (${match.resumeRole || ''})` : `ID: ${match.resumeId}`}
                    </TableCell>
                    <TableCell>
                      {match.vacancyTitle ? `${match.vacancyTitle} (${match.vacancyCompany || ''})` : `ID: ${match.vacancyId}`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatPercent(match.score)}
                        sx={{ 
                          bgcolor: getScoreColor(match.score) + '20',
                          color: getScoreColor(match.score),
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<OpenIcon />}
                        onClick={() => handleViewMatch(match.id)}
                      >
                        Просмотр
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={-1} // Сервер определяет общее количество
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to }) => `${from}-${to}`}
        />
      </Paper>
      
      {/* Модальное окно с деталями сопоставления */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Результаты сопоставления</DialogTitle>
        <DialogContent>
          {selectedMatch && <MatchingResults results={selectedMatch} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MatchingHistory; 