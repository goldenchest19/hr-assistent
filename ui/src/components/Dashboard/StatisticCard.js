import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const StatisticCard = ({ title, value, icon, color = '#1976d2', height = 120 }) => {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        height: height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderTop: `4px solid ${color}`,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          right: -10, 
          top: -10, 
          opacity: 0.1,
          transform: 'rotate(-15deg)',
          fontSize: '100px'
        }}
      >
        {icon}
      </Box>
      
      <Box sx={{ p: 2, zIndex: 1 }}>
        <Typography 
          variant="subtitle2" 
          color="textSecondary" 
          gutterBottom
        >
          {title}
        </Typography>
        
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            color: color
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatisticCard; 