import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Контексты
import { AuthProvider, useAuth } from './context/AuthContext';
import { MatchingProvider } from './context/MatchingContext';

// Макеты
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Страницы
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import VacancyList from './components/Vacancies/VacancyList';
import CandidateList from './components/Candidates/CandidateList';
import MatchingPage from './components/Matching/MatchingPage';
import MatchingHistory from './components/Matching/MatchingHistory';
import MatchingDetails from './components/Matching/MatchingDetails';

// Стили
import { Box, CircularProgress } from '@mui/material';

// Создаем тему
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// Временный компонент-заглушка не используется в текущей версии
// const Placeholder = ({ name }) => {
//   return (
//     <div style={{ 
//       padding: '20px', 
//       textAlign: 'center', 
//       margin: '20px', 
//       backgroundColor: '#fff',
//       borderRadius: '8px',
//       boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//     }}>
//       <h2>Компонент {name} в разработке</h2>
//       <p>Эта страница будет доступна в ближайшее время.</p>
//     </div>
//   );
// };

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Основной компонент приложения
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex' }}>
      {isAuthenticated && <Sidebar />}
      <Box sx={{ flexGrow: 1 }}>
        {isAuthenticated && <Navbar />}
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: isAuthenticated ? 8 : 0 }}>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
            
            {/* Защищенные маршруты */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/vacancies" element={
              <ProtectedRoute>
                <VacancyList />
              </ProtectedRoute>
            } />
            <Route path="/candidates" element={
              <ProtectedRoute>
                <CandidateList />
              </ProtectedRoute>
            } />

            {/* Маршруты для сопоставления */}
            <Route path="/matching" element={
              <ProtectedRoute>
                <MatchingPage />
              </ProtectedRoute>
            } />
            <Route path="/matching/history" element={
              <ProtectedRoute>
                <MatchingHistory />
              </ProtectedRoute>
            } />
            <Route path="/matching/details" element={
              <ProtectedRoute>
                <MatchingDetails />
              </ProtectedRoute>
            } />
            
            {/* Перенаправление для несуществующих маршрутов */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <MatchingProvider>
          <Router>
            <AppContent />
          </Router>
        </MatchingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
