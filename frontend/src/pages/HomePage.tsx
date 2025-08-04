import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  Grid,
  Stack,
  Chip,
  useTheme,
  alpha,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  Speed,
  Security,
  Analytics,
  Campaign,
  AutoAwesome,
  Psychology,
  ArrowForward,
  Groups,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useThemeMode } from '../ThemeProvider';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();

  const features = [
    {
      icon: <Psychology />,
      title: 'AI Campaign Generation',
      description: 'Create data-driven advertising campaigns with our advanced AI engine that analyzes market trends and consumer behavior.',
      color: theme.palette.primary.main,
    },
    {
      icon: <Analytics />,
      title: 'Real-time Analytics',
      description: 'Monitor campaign performance with comprehensive dashboards, conversion tracking, and predictive insights.',
      color: theme.palette.secondary.main,
    },
    {
      icon: <AutoAwesome />,
      title: 'Creative Studio',
      description: 'Generate high-converting ad creatives, copy variations, and visual assets using generative AI technology.',
      color: theme.palette.success.main,
    },
    {
      icon: <TrendingUp />,
      title: 'Performance Optimization',
      description: 'Automatically optimize campaigns using machine learning algorithms to maximize ROI and engagement rates.',
      color: theme.palette.warning.main,
    },
    {
      icon: <Groups />,
      title: 'Multi-tenant Management',
      description: 'Enterprise-grade platform supporting multiple clients with isolated data and customizable workflows.',
      color: theme.palette.info.main,
    },
    {
      icon: <Security />,
      title: 'Enterprise Security',
      description: 'Bank-level security with SOC 2 Type II compliance, end-to-end encryption, and audit logging.',
      color: theme.palette.error.main,
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Campaigns', icon: <Campaign /> },
    { value: '2.4x', label: 'Average CTR Improvement', icon: <TrendingUp /> },
    { value: '99.9%', label: 'Platform Uptime', icon: <Speed /> },
    { value: '500+', label: 'Enterprise Clients', icon: <Groups /> },
  ];

  const testimonials = [
    {
      quote: "AdGenius transformed our advertising strategy. We've seen a 3x improvement in campaign performance.",
      author: "Sarah Chen",
      role: "Marketing Director",
      company: "TechCorp Inc.",
      avatar: "S"
    },
    {
      quote: "The AI-powered creative generation saved us countless hours while improving our conversion rates.",
      author: "Michael Rodriguez", 
      role: "Growth Lead",
      company: "StartupXYZ",
      avatar: "M"
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Navigation Header */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <img 
                src="/assets/logo.svg" 
                alt="AdGenius Logo" 
                style={{ 
                  width: 40, 
                  height: 40,
                  filter: 'brightness(0) invert(1)' // Make logo white
                }} 
              />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AdGenius
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/dashboard')}
              sx={{ borderRadius: 2 }}
            >
              Dashboard
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate('/dashboard')}
              sx={{ borderRadius: 2 }}
            >
              Get Started
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 25% 25%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 800,
                  mb: 3,
                  lineHeight: 1.1,
                }}
              >
                The Future of{' '}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  AI-Powered
                </Box>{' '}
                Advertising
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Transform your advertising strategy with generative AI. Create, optimize, and scale campaigns that convert at unprecedented rates.
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Chip 
                  label="✨ AI-Generated Creatives" 
                  color="primary" 
                  sx={{ borderRadius: 2 }}
                />
                <Chip 
                  label="📊 Real-time Analytics" 
                  variant="outlined" 
                  sx={{ borderRadius: 2 }}
                />
                <Chip 
                  label="🚀 Enterprise Ready" 
                  variant="outlined" 
                  sx={{ borderRadius: 2 }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Dashboard />}
                  onClick={() => navigate('/analytics')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  View Demo
                </Button>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: 300,
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' },
                      '100%': { transform: 'scale(1)' },
                    },
                  }}
                >
                  <Psychology sx={{ fontSize: 60, color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  AI-Powered Campaign Engine
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                  Experience the next generation of advertising technology
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Powerful Features for Modern Advertisers
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Everything you need to create, manage, and optimize high-performing advertising campaigns
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 40px ${alpha(feature.color, 0.15)}`,
                      borderColor: alpha(feature.color, 0.3),
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(feature.color, 0.1)}, ${alpha(feature.color, 0.2)})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    {React.cloneElement(feature.icon, {
                      sx: { fontSize: 32, color: feature.color },
                    })}
                  </Box>
                  
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {feature.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ lineHeight: 1.7 }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Trusted by Industry Leaders
          </Typography>
          <Typography variant="h6" color="text.secondary">
            See what our customers are saying about AdGenius
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  height: '100%',
                }}
              >
                <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{testimonial.quote}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                    {testimonial.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {testimonial.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}, {testimonial.company}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          py: 8,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 20% 20%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%)`,
          }}
        />
        
        <Container maxWidth="lg" sx={{ textAlign: 'center', position: 'relative' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Transform Your Advertising?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of businesses using AdGenius to scale their advertising efforts
          </Typography>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                borderRadius: 3,
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.9),
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/settings')}
              sx={{
                borderColor: 'white',
                color: 'white',
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                borderRadius: 3,
                borderWidth: 2,
                '&:hover': {
                  borderColor: 'white',
                  borderWidth: 2,
                  bgcolor: alpha('#ffffff', 0.1),
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Contact Sales
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <img 
                    src="/assets/logo.svg" 
                    alt="AdGenius Logo" 
                    style={{ 
                      width: 30, 
                      height: 30,
                      filter: 'brightness(0) invert(1)' // Make logo white
                    }} 
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  AdGenius
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                © 2024 AdGenius. All rights reserved. Built for the future of advertising.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
