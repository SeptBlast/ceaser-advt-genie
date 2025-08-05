import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Stack,
  useTheme,
  alpha,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  Analytics,
  AutoAwesome,
  ArrowForward,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useThemeMode } from '../ThemeProvider';
import CeaserButton from '../components/CeaserButton';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();

  const features = [
    {
      icon: <AutoAwesome />,
      title: 'AI-Powered Campaigns',
      description: 'Create high-converting ad campaigns with intelligent automation.',
    },
    {
      icon: <Analytics />,
      title: 'Advanced Analytics',
      description: 'Track performance with real-time insights and optimization.',
    },
    {
      icon: <TrendingUp />,
      title: 'Performance Optimization',
      description: 'Maximize ROI with machine learning-driven improvements.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Simple Navigation Header */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'transparent',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '1.2rem',
              }}
            >
              🐕
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              CeaserTheAdGenius
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Clean Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            textAlign: 'center',
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 3,
              lineHeight: 1.2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI-Powered Advertising Platform
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              mb: 5,
              color: 'text.secondary',
              fontWeight: 400,
              lineHeight: 1.6,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Create, optimize, and scale advertising campaigns with intelligent automation and real-time analytics.
          </Typography>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mb: 8 }}
          >
            <CeaserButton
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/signup')}
              sx={{ px: 4, py: 1.5 }}
            >
              Get Started
            </CeaserButton>
            <CeaserButton
              variant="outlined"
              size="large"
              startIcon={<Dashboard />}
              onClick={() => navigate('/dashboard')}
              sx={{ px: 4, py: 1.5 }}
            >
              View Demo
            </CeaserButton>
          </Stack>
        </Box>

        {/* Simple Features Grid */}
        <Box sx={{ py: 8 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Everything you need to succeed
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    bgcolor: 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    {React.cloneElement(feature.icon, {
                      sx: { fontSize: 28, color: 'primary.main' },
                    })}
                  </Box>
                  
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
                  >
                    {feature.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Simple CTA Section */}
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Ready to get started?
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'text.secondary',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Join thousands of businesses already using our platform to create better advertising campaigns.
          </Typography>
          
          <CeaserButton
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/signup')}
            sx={{ px: 4, py: 1.5 }}
          >
            Start Free Trial
          </CeaserButton>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
