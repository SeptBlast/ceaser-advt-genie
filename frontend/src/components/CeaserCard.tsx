import React from 'react';
import { Card, CardProps, styled, alpha } from '@mui/material';
import { keyframes } from '@mui/system';

// Gentle breathing animation for cards
const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.01); }
`;

// Paw print floating animation
const floatPaw = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% { 
    transform: translateY(-10px) rotate(5deg);
    opacity: 0.6;
  }
`;

const StyledCeaserCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  background: theme.palette.mode === 'light' 
    ? `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.05)})`
    : `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.1)})`,
  
  // Loyal border with soft glow
  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `
    0 4px 20px ${alpha(theme.palette.primary.main, 0.1)},
    0 2px 8px ${alpha(theme.palette.common.black, 0.05)},
    inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
  `,
  
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    boxShadow: `
      0 12px 40px ${alpha(theme.palette.primary.main, 0.2)},
      0 8px 16px ${alpha(theme.palette.common.black, 0.1)},
      inset 0 1px 0 ${alpha(theme.palette.common.white, 0.2)}
    `,
    animation: `${breathe} 3s ease-in-out infinite`,
  },
  
  // Paw print decorations
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '10px',
    right: '15px',
    width: '20px',
    height: '20px',
    background: `radial-gradient(circle at 50% 40%, ${alpha(theme.palette.primary.main, 0.15)} 3px, transparent 3px),
                 radial-gradient(circle at 30% 70%, ${alpha(theme.palette.primary.main, 0.15)} 2px, transparent 2px),
                 radial-gradient(circle at 70% 70%, ${alpha(theme.palette.primary.main, 0.15)} 2px, transparent 2px),
                 radial-gradient(circle at 50% 85%, ${alpha(theme.palette.primary.main, 0.15)} 4px, transparent 4px)`,
    backgroundSize: '20px 20px',
    opacity: 0.4,
    animation: `${floatPaw} 4s ease-in-out infinite`,
    pointerEvents: 'none',
  },
  
  // Creative variant
  '&.ceaser-creative': {
    background: theme.palette.mode === 'light'
      ? `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.secondary.main, 0.05)})`
      : `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.secondary.main, 0.1)})`,
    border: `2px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
    
    '&:hover': {
      border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
      boxShadow: `
        0 12px 40px ${alpha(theme.palette.secondary.main, 0.2)},
        0 8px 16px ${alpha(theme.palette.common.black, 0.1)}
      `,
    },
    
    '&::before': {
      background: `radial-gradient(circle at 50% 40%, ${alpha(theme.palette.secondary.main, 0.15)} 3px, transparent 3px),
                   radial-gradient(circle at 30% 70%, ${alpha(theme.palette.secondary.main, 0.15)} 2px, transparent 2px),
                   radial-gradient(circle at 70% 70%, ${alpha(theme.palette.secondary.main, 0.15)} 2px, transparent 2px),
                   radial-gradient(circle at 50% 85%, ${alpha(theme.palette.secondary.main, 0.15)} 4px, transparent 4px)`,
    },
  },
  
  // Playful variant with extra personality
  '&.ceaser-playful': {
    borderRadius: '25px',
    transform: 'rotate(-0.5deg)',
    
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02) rotate(0.5deg)',
      borderRadius: '15px',
    },
    
    '&::after': {
      content: '"🐾"',
      position: 'absolute',
      bottom: '10px',
      right: '15px',
      fontSize: '12px',
      opacity: 0.3,
      animation: `${floatPaw} 3s ease-in-out infinite reverse`,
    },
  },
  
  // Trustworthy variant for important content
  '&.ceaser-trustworthy': {
    border: `3px solid ${alpha(theme.palette.success.main, 0.2)}`,
    background: theme.palette.mode === 'light'
      ? `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.success.main, 0.03)})`
      : `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.success.main, 0.08)})`,
    
    '&:hover': {
      border: `3px solid ${alpha(theme.palette.success.main, 0.4)}`,
      boxShadow: `
        0 12px 40px ${alpha(theme.palette.success.main, 0.15)},
        0 8px 16px ${alpha(theme.palette.common.black, 0.1)}
      `,
    },
  },
}));

interface CeaserCardProps extends CardProps {
  caeserVariant?: 'loyal' | 'creative' | 'playful' | 'trustworthy';
}

const CeaserCard: React.FC<CeaserCardProps> = ({ 
  children, 
  caeserVariant = 'loyal',
  className,
  ...props 
}) => {
  const getClassName = () => {
    let classes = className || '';
    if (caeserVariant !== 'loyal') classes += ` ceaser-${caeserVariant}`;
    return classes.trim();
  };

  return (
    <StyledCeaserCard
      className={getClassName()}
      {...props}
    >
      {children}
    </StyledCeaserCard>
  );
};

export default CeaserCard;
