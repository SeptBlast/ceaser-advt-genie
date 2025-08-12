import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

interface ThemeAwareLogoProps {
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Force a specific theme regardless of current theme */
  forceTheme?: 'light' | 'dark';
  /** Disable automatic theme switching */
  disableThemeSwitch?: boolean;
}

const ThemeAwareLogo: React.FC<ThemeAwareLogoProps> = ({
  width = 60,
  height = 60,
  alt = "CeaserTheAdGenius Logo",
  className,
  style,
  forceTheme,
  disableThemeSwitch = false,
  ...props
}) => {
  const theme = useTheme();
  
  // Determine which theme to use
  let isDark = theme.palette.mode === 'dark';
  
  if (forceTheme) {
    isDark = forceTheme === 'dark';
  }

  // CSS filter to convert black logo to white in dark mode
  // For dark mode: invert(1) converts black to white
  // For light mode: no filter keeps the original black
  let logoFilter = 'none';
  
  if (!disableThemeSwitch) {
    logoFilter = isDark ? 'invert(1) brightness(1)' : 'none';
  }

  // Merge with custom style filter if provided
  const finalStyle = {
    ...style,
    filter: style?.filter || logoFilter,
  };

  return (
    <Box
      component="img"
      src="/assets/logo.svg"
      alt={alt}
      className={className}
      sx={{
        width,
        height,
        filter: finalStyle.filter,
        transition: 'filter 0.3s ease-in-out',
        ...style,
      }}
      {...props}
    />
  );
};

export default ThemeAwareLogo;
