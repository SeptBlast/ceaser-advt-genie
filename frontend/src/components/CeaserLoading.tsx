import React from 'react';
import { Box, CircularProgress, Typography, styled } from '@mui/material';
import { keyframes } from '@mui/system';

// Tail wag animation
const tailWag = keyframes`
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
`;

// Paw step animation
const pawStep = keyframes`
  0%, 25% { opacity: 0.3; transform: scale(0.8); }
  12.5% { opacity: 1; transform: scale(1); }
  50%, 100% { opacity: 0.3; transform: scale(0.8); }
`;

// Ear flop animation
const earFlop = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
`;

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(4),
  
  '& .ceaser-face': {
    position: 'relative',
    width: '80px',
    height: '80px',
    marginBottom: theme.spacing(2),
  },
  
  '& .ceaser-ear': {
    position: 'absolute',
    width: '15px',
    height: '25px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
    animation: `${earFlop} 2s ease-in-out infinite`,
    
    '&.left': {
      left: '15px',
      top: '5px',
      transform: 'rotate(-20deg)',
      animationDelay: '0s',
    },
    
    '&.right': {
      right: '15px',
      top: '5px',
      transform: 'rotate(20deg)',
      animationDelay: '0.3s',
    },
  },
  
  '& .ceaser-head': {
    position: 'absolute',
    top: '10px',
    left: '20px',
    width: '40px',
    height: '40px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '20px',
      left: '10px',
      width: '20px',
      height: '15px',
      backgroundColor: theme.palette.primary.light,
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
    },
    
    '&::after': {
      content: '"• •"',
      position: 'absolute',
      top: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '8px',
      color: theme.palette.background.paper,
    },
  },
  
  '& .ceaser-tail': {
    position: 'absolute',
    right: '-5px',
    top: '35px',
    width: '3px',
    height: '20px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
    transformOrigin: 'top center',
    animation: `${tailWag} 0.6s ease-in-out infinite`,
  },
  
  '& .paw-prints': {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    
    '& .paw': {
      width: '12px',
      height: '12px',
      position: 'relative',
      
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '4px',
        height: '4px',
        backgroundColor: theme.palette.primary.main,
        borderRadius: '50%',
      },
      
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '8px',
        height: '6px',
        backgroundColor: theme.palette.primary.main,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      },
      
      '&:nth-of-type(1)': { animation: `${pawStep} 1.2s infinite`, animationDelay: '0s' },
      '&:nth-of-type(2)': { animation: `${pawStep} 1.2s infinite`, animationDelay: '0.3s' },
      '&:nth-of-type(3)': { animation: `${pawStep} 1.2s infinite`, animationDelay: '0.6s' },
      '&:nth-of-type(4)': { animation: `${pawStep} 1.2s infinite`, animationDelay: '0.9s' },
    },
  },
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  textAlign: 'center',
  animation: `${earFlop} 3s ease-in-out infinite`,
}));

interface CeaserLoadingProps {
  message?: string;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const CeaserLoading: React.FC<CeaserLoadingProps> = ({ 
  message = "Ceaser is fetching your data...",
  showProgress = true,
  size = 'medium'
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return { face: 60, progress: 40 };
      case 'large': return { face: 120, progress: 80 };
      default: return { face: 80, progress: 60 };
    }
  };

  const dimensions = getSize();

  const loadingMessages = [
    "Ceaser is sniffing out your data...",
    "Good boy Ceaser is working hard...",
    "Ceaser's tail is wagging with excitement...",
    "Woof! Almost there...",
    "Ceaser is being a very good assistant...",
  ];

  const [currentMessage, setCurrentMessage] = React.useState(message);

  React.useEffect(() => {
    if (message === "Ceaser is fetching your data...") {
      const interval = setInterval(() => {
        setCurrentMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [message]);

  return (
    <LoadingContainer>
      <Box position="relative">
        {showProgress && (
          <CircularProgress 
            size={dimensions.progress}
            thickness={2}
            sx={{ 
              color: 'primary.main',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
        
        <Box 
          className="ceaser-face" 
          sx={{ 
            width: dimensions.face, 
            height: dimensions.face,
            transform: `scale(${size === 'small' ? 0.8 : size === 'large' ? 1.2 : 1})`
          }}
        >
          <div className="ceaser-ear left"></div>
          <div className="ceaser-ear right"></div>
          <div className="ceaser-head"></div>
          <div className="ceaser-tail"></div>
        </Box>
      </Box>
      
      <LoadingText variant={size === 'small' ? 'body2' : 'h6'}>
        {currentMessage}
      </LoadingText>
      
      <Box className="paw-prints">
        <div className="paw"></div>
        <div className="paw"></div>
        <div className="paw"></div>
        <div className="paw"></div>
      </Box>
    </LoadingContainer>
  );
};

export default CeaserLoading;
