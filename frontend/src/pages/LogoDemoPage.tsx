import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Stack,
  IconButton,
  Card,
  CardContent,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Brightness6,
} from '@mui/icons-material';
import { useThemeMode } from '../ThemeProvider';
import ThemeAwareLogo from '../components/ThemeAwareLogo';

const LogoDemoPage: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();

  const demoSections = [
    {
      title: "Default Behavior",
      description: "Logo automatically adapts to current theme",
      demos: [
        { size: 32, label: "Small (32px)" },
        { size: 48, label: "Medium (48px)" },
        { size: 64, label: "Large (64px)" },
        { size: 80, label: "Extra Large (80px)" },
      ]
    },
    {
      title: "Force Theme Override",
      description: "Force specific appearance regardless of current theme",
      demos: [
        { size: 48, forceTheme: 'light' as const, label: "Force Light" },
        { size: 48, forceTheme: 'dark' as const, label: "Force Dark" },
        { size: 48, style: { filter: 'brightness(0) invert(1)' }, label: "Force White" },
        { size: 48, disableThemeSwitch: true, label: "No Auto-Switch" },
      ]
    },
    {
      title: "Gradient Backgrounds",
      description: "Logo appearance on colored backgrounds",
      demos: [
        { 
          size: 48, 
          label: "Primary Gradient",
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          style: { filter: 'brightness(0) invert(1)' }
        },
        { 
          size: 48, 
          label: "Dark Background",
          background: theme.palette.grey[900],
          forceTheme: 'dark' as const
        },
        { 
          size: 48, 
          label: "Light Background",
          background: theme.palette.grey[100],
          forceTheme: 'light' as const
        },
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
          <ThemeAwareLogo width={64} height={64} />
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Theme-Aware Logo Demo
          </Typography>
        </Stack>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          CeaserTheAdGenius logo automatically adapts to light and dark themes
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <Chip 
            label={`Current Theme: ${mode}`} 
            color="primary" 
            icon={mode === 'light' ? <LightMode /> : <DarkMode />}
          />
          <IconButton 
            onClick={toggleTheme}
            sx={{ 
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <Brightness6 />
          </IconButton>
        </Stack>
      </Box>

      {/* Demo Sections */}
      <Stack spacing={6}>
        {demoSections.map((section, sectionIndex) => (
          <Paper 
            key={sectionIndex}
            sx={{ 
              p: 4, 
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {section.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {section.description}
            </Typography>

            <Grid container spacing={3}>
              {section.demos.map((demo, demoIndex) => (
                <Grid item xs={12} sm={6} md={3} key={demoIndex}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: demo.background || 'transparent',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        transition: 'transform 0.2s ease'
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Box sx={{ mb: 2, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ThemeAwareLogo 
                          width={demo.size} 
                          height={demo.size}
                          forceTheme={demo.forceTheme}
                          disableThemeSwitch={demo.disableThemeSwitch}
                          style={demo.style}
                        />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {demo.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {demo.size}×{demo.size}px
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        ))}
      </Stack>

      {/* Technical Details */}
      <Paper 
        sx={{ 
          mt: 6, 
          p: 4, 
          borderRadius: 3,
          bgcolor: alpha(theme.palette.info.main, 0.05),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          How It Works
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Light Mode:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <code>filter: none</code> - Keeps original black logo
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Dark Mode:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <code>filter: invert(1) brightness(1)</code> - Converts black to white
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Transition:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <code>transition: filter 0.3s ease-in-out</code> - Smooth 300ms animation
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LogoDemoPage;
