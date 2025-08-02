import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import {
  Rocket,
  TrendingUp,
  Speed,
  Security,
  Analytics,
  Campaign,
  AutoAwesome,
  Psychology,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <Psychology />,
      title: 'AI-Powered Campaigns',
      description: 'Generate high-converting ad campaigns using advanced machine learning algorithms.',
      color: theme.palette.primary.main,
    },
    {
      icon: <Analytics />,
      title: 'Advanced Analytics',
      description: 'Deep insights into campaign performance with real-time analytics and reporting.',
      color: theme.palette.secondary.main,
    },
    {
      icon: <AutoAwesome />,
      title: 'Creative Generation',
      description: 'Automatically generate compelling ad creatives, copy, and visuals.',
      color: theme.palette.success.main,
    },
    {
      icon: <TrendingUp />,
      title: 'Performance Optimization',
      description: 'Continuous optimization using AI to maximize ROI and engagement.',
      color: theme.palette.warning.main,
    },
    {
      icon: <Speed />,
      title: 'Lightning Fast',
      description: 'Deploy campaigns in minutes, not hours. Rapid iteration and testing.',
      color: theme.palette.error.main,
    },
    {
      icon: <Security />,
      title: 'Enterprise Security',
      description: 'Bank-grade security with SOC 2 compliance and data encryption.',
      color: theme.palette.info.main,
    },
  ];

  const stats = [
    { value: '500K+', label: 'Campaigns Generated' },
    { value: '1.2M+', label: 'Ads Created' },
    { value: '98%', label: 'Customer Satisfaction' },
    { value: '3.5x', label: 'Average ROI Increase' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          borderRadius: 4,
          p: { xs: 4, md: 8 },
          mb: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            The Future of
            <br />
            AI Advertising
          </Typography>
          
          <Typography
            variant="h5"
            component="p"
            sx={{
              mb: 4,
              color: theme.palette.text.secondary,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Generate high-converting ad campaigns with cutting-edge AI technology.
            Scale your advertising efforts while maximizing ROI.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<Rocket />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                borderRadius: 3,
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Campaign />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                borderRadius: 3,
              }}
            >
              Watch Demo
            </Button>
          </Stack>

          <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
            <Chip label="No Credit Card Required" color="primary" variant="outlined" />
            <Chip label="14-Day Free Trial" color="secondary" variant="outlined" />
            <Chip label="Cancel Anytime" color="default" variant="outlined" />
          </Stack>
        </Container>
      </Paper>

      {/* Stats Section */}
      <Box sx={{ mb: 8 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography
                  variant="h3"
                  component="div"
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
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: theme.palette.text.primary,
            }}
          >
            Powerful Features
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 400,
            }}
          >
            Everything you need to create, manage, and optimize your advertising campaigns
          </Typography>
        </Container>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(feature.color, 0.15)}`,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: alpha(feature.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    {React.cloneElement(feature.icon, {
                      sx: { fontSize: 28, color: feature.color },
                    })}
                  </Box>
                  
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {feature.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          borderRadius: 4,
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          color: 'white',
        }}
      >
        <Typography
          variant="h3"
          component="h2"
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Ready to Transform Your Advertising?
        </Typography>
        
        <Typography
          variant="h6"
          component="p"
          sx={{ mb: 4, opacity: 0.9 }}
        >
          Join thousands of businesses already using AdGenius to scale their advertising efforts.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<Rocket />}
            sx={{
              backgroundColor: 'white',
              color: theme.palette.primary.main,
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: 3,
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.9),
              },
            }}
          >
            Get Started Free
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'white',
              color: 'white',
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: 3,
              '&:hover': {
                borderColor: 'white',
                backgroundColor: alpha('#ffffff', 0.1),
              },
            }}
          >
            Contact Sales
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default HomePage;
