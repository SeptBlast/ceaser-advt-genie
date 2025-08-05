import React from 'react';
import { 
  Snackbar, 
  Alert, 
  Box, 
  Typography,
  styled,
  alpha,
} from '@mui/material';
import { keyframes } from '@mui/system';

// Tail wag animation for notifications
const tailWag = keyframes`
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
`;

// Happy bounce animation
const happyBounce = keyframes`
  0%, 100% { transform: translateY(0px); }
  25% { transform: translateY(-4px); }
  75% { transform: translateY(-2px); }
`;

const StyledCeaserAlert = styled(Alert)(({ theme, severity }) => ({
  borderRadius: '16px',
  border: `2px solid ${alpha(
    severity === 'success' ? theme.palette.success.main :
    severity === 'error' ? theme.palette.error.main :
    severity === 'warning' ? theme.palette.warning.main :
    theme.palette.info.main, 0.3
  )}`,
  
  background: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(8px)',
  
  // Add paw print pattern
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '8px',
    right: '15px',
    width: '16px',
    height: '16px',
    background: `radial-gradient(circle at 50% 30%, ${alpha(
      severity === 'success' ? theme.palette.success.main :
      severity === 'error' ? theme.palette.error.main :
      severity === 'warning' ? theme.palette.warning.main :
      theme.palette.info.main, 0.2
    )} 2px, transparent 2px),
                 radial-gradient(circle at 30% 60%, ${alpha(
      severity === 'success' ? theme.palette.success.main :
      severity === 'error' ? theme.palette.error.main :
      severity === 'warning' ? theme.palette.warning.main :
      theme.palette.info.main, 0.2
    )} 1.5px, transparent 1.5px),
                 radial-gradient(circle at 70% 60%, ${alpha(
      severity === 'success' ? theme.palette.success.main :
      severity === 'error' ? theme.palette.error.main :
      severity === 'warning' ? theme.palette.warning.main :
      theme.palette.info.main, 0.2
    )} 1.5px, transparent 1.5px),
                 radial-gradient(circle at 50% 80%, ${alpha(
      severity === 'success' ? theme.palette.success.main :
      severity === 'error' ? theme.palette.error.main :
      severity === 'warning' ? theme.palette.warning.main :
      theme.palette.info.main, 0.2
    )} 3px, transparent 3px)`,
    backgroundSize: '16px 16px',
    opacity: 0.6,
    animation: severity === 'success' 
      ? `${tailWag} 0.8s ease-in-out infinite`
      : severity === 'error'
      ? 'none'
      : `${happyBounce} 1s ease-in-out infinite`,
    pointerEvents: 'none',
  },
  
  '& .MuiAlert-icon': {
    fontSize: '1.5rem',
    animation: severity === 'success' 
      ? `${happyBounce} 1s ease-in-out infinite`
      : 'none',
  },
  
  '& .MuiAlert-message': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
}));

interface CeaserNotificationProps {
  open: boolean;
  onClose: () => void;
  severity?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  caeserMessage?: string;
  autoHideDuration?: number;
}

const CeaserNotification: React.FC<CeaserNotificationProps> = ({
  open,
  onClose,
  severity = 'success',
  title,
  message,
  caeserMessage,
  autoHideDuration = 5000,
}) => {
  const getCeaserMessage = (severity: string) => {
    switch (severity) {
      case 'success':
        return caeserMessage || "Woof! Good job! 🐕";
      case 'error':
        return caeserMessage || "Ruff... something went wrong 😔";
      case 'warning':
        return caeserMessage || "Woof woof! Pay attention! ⚠️";
      case 'info':
        return caeserMessage || "Arf! Here's some info 📋";
      default:
        return caeserMessage || "Woof! 🐾";
    }
  };

  const getCeaserIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return '🎾'; // Happy with ball
      case 'error':
        return '🦴'; // Sad but still hopeful
      case 'warning':
        return '👀'; // Alert and watching
      case 'info':
        return '📢'; // Barking with info
      default:
        return '🐕';
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbar-root': {
          transform: 'translateY(0)',
        }
      }}
    >
      <StyledCeaserAlert 
        onClose={onClose} 
        severity={severity}
        variant="filled"
        sx={{ 
          minWidth: 300,
          maxWidth: 400,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            sx={{
              fontSize: '1.5rem',
              marginTop: '2px',
              animation: severity === 'success' 
                ? `${tailWag} 1s ease-in-out infinite`
                : 'none',
            }}
          >
            {getCeaserIcon(severity)}
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 700,
                mb: 0.5,
                color: severity === 'success' ? 'success.dark' :
                       severity === 'error' ? 'error.dark' :
                       severity === 'warning' ? 'warning.dark' :
                       'info.dark'
              }}
            >
              {title}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.primary',
                mb: 0.5,
                lineHeight: 1.4,
              }}
            >
              {message}
            </Typography>
            
            <Typography 
              variant="caption" 
              sx={{ 
                color: severity === 'success' ? 'success.main' :
                       severity === 'error' ? 'error.main' :
                       severity === 'warning' ? 'warning.main' :
                       'info.main',
                fontStyle: 'italic',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <span style={{ fontSize: '0.8rem' }}>🐕</span>
              {getCeaserMessage(severity)}
            </Typography>
          </Box>
        </Box>
      </StyledCeaserAlert>
    </Snackbar>
  );
};

export default CeaserNotification;
