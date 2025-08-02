import { createTheme } from '@mui/material/styles';

// Material Design 3 Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#405ca8',
      light: '#7998c4',
      dark: '#002952',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5c98b6',
      light: '#b4cccaff',
      dark: '#344c4c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fcfcfc',
      paper: '#ffffff',
    },
    surface: {
      main: '#f2f9f9',
      dark: '#e6eded',
      light: '#ffffff',
    },
    text: {
      primary: '#161d1d',
      secondary: '#3f484a',
    },
    error: {
      main: '#ba1a1a',
      light: '#ffdad6',
      dark: '#93000a',
    },
    warning: {
      main: '#825500',
      light: '#ffdea6',
      dark: '#5c3f00',
    },
    success: {
      main: '#006e1c',
      light: '#b4f1b8',
      dark: '#004f0f',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 400,
      lineHeight: 1.167,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2.75rem',
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 400,
      lineHeight: 1.167,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 400,
      lineHeight: 1.235,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.334,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.75,
      letterSpacing: '0.00938em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Dark theme
const darkTheme = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode: 'dark',
    primary: {
      main: '#7998c4',
      light: '#9bb5e0',
      dark: '#405ca8',
      contrastText: '#000000',
    },
    secondary: {
      main: '#b4c8c9',
      light: '#d0e4e5',
      dark: '#667a7b',
      contrastText: '#000000',
    },
    background: {
      default: '#0f1515',
      paper: '#161d1d',
    },
    text: {
      primary: '#e1e3e3',
      secondary: '#bfc8ca',
    },
  },
});

export { theme, darkTheme };
