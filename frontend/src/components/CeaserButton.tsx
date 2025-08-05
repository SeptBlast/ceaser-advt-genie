import React from 'react';
import { Button, ButtonProps, styled } from '@mui/material';
import { keyframes } from '@mui/system';

// Tail wag animation
const tailWag = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(3deg); }
  75% { transform: rotate(-3deg); }
`;

// Paw bounce animation
const pawBounce = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
`;

const StyledCeaserButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: '16px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  
  // Add paw print shadow
  boxShadow: variant === 'contained' 
    ? `0 4px 12px ${theme.palette.primary.main}40, 0 0 0 1px ${theme.palette.primary.main}20`
    : 'none',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    animation: `${tailWag} 0.6s ease-in-out`,
    boxShadow: variant === 'contained'
      ? `0 8px 24px ${theme.palette.primary.main}50, 0 0 0 2px ${theme.palette.primary.main}30`
      : `0 4px 12px ${theme.palette.primary.main}30`,
  },
  
  '&:active': {
    animation: `${pawBounce} 0.3s ease`,
  },
  
  // Add subtle paw print pattern
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle at 20% 20%, ${theme.palette.primary.main}08 1px, transparent 1px),
                 radial-gradient(circle at 80% 20%, ${theme.palette.primary.main}08 1px, transparent 1px),
                 radial-gradient(circle at 50% 40%, ${theme.palette.primary.main}08 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    opacity: 0.5,
    pointerEvents: 'none',
  },
  
  // Loyal blue variant
  ...(variant === 'contained' && {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    },
  }),
  
  // Creative orange variant
  '&.ceaser-creative': {
    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
    color: theme.palette.secondary.contrastText,
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
    },
  },
  
  // Playful variant with extra animations
  '&.ceaser-playful': {
    borderRadius: '20px',
    '&:hover': {
      borderRadius: '8px',
      transform: 'translateY(-2px) rotate(1deg)',
    },
  },
}));

interface CeaserButtonProps extends ButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  caeserVariant?: 'loyal' | 'creative' | 'playful';
}

const CeaserButton: React.FC<CeaserButtonProps> = ({ 
  children, 
  variant = 'contained',
  caeserVariant = 'loyal',
  className,
  ...props 
}) => {
  const getClassName = () => {
    let classes = className || '';
    if (caeserVariant === 'creative') classes += ' ceaser-creative';
    if (caeserVariant === 'playful') classes += ' ceaser-playful';
    return classes.trim();
  };

  return (
    <StyledCeaserButton
      variant={variant}
      className={getClassName()}
      {...props}
    >
      {children}
    </StyledCeaserButton>
  );
};

export default CeaserButton;
