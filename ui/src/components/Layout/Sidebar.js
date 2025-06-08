import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Box,
  Typography
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  CompareArrows as CompareIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// Константа для ширины боковой панели
const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Обработчик навигации
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  // Пункты меню
  const menuItems = [
    { 
      text: 'Дашборд', 
      icon: <DashboardIcon />, 
      path: '/' 
    },
    { 
      text: 'Вакансии', 
      icon: <WorkIcon />, 
      path: '/vacancies' 
    },
    { 
      text: 'Кандидаты', 
      icon: <PersonIcon />, 
      path: '/candidates' 
    },
    { 
      text: 'Сопоставление', 
      icon: <CompareIcon />, 
      path: '/matching' 
    }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '16px'
      }}>
        <Typography variant="h6" component="div" color="primary">
          HR Partner
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 