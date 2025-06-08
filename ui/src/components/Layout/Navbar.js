import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Avatar, Menu, MenuItem } from '@mui/material';
import { Notifications, ExitToApp, AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Обработчик клика по аватару пользователя
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Обработчик закрытия меню
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Обработчик выхода из системы
  const handleLogout = () => {
    handleMenuClose();
    logout();
    // Перенаправление происходит автоматически через ProtectedRoute
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          HR Partner
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" size="large">
            <Notifications />
          </IconButton>
          
          <IconButton 
            color="inherit" 
            size="large" 
            onClick={handleMenuOpen}
            aria-controls="user-menu"
            aria-haspopup="true"
          >
            {user?.name ? (
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            ) : (
              <AccountCircle />
            )}
          </IconButton>
          
          <Menu
            id="user-menu"
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
            <MenuItem onClick={handleMenuClose}>Профиль</MenuItem>
            <MenuItem onClick={handleMenuClose}>Настройки</MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} fontSize="small" />
              Выход
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 