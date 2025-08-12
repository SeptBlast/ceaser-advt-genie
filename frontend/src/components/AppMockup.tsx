import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  useTheme,
  alpha,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Campaign,
  TrendingUp,
  Analytics,
  AutoAwesome,
  Schedule,
  People,
  MonetizationOn,
} from '@mui/icons-material';

interface AppMockupProps {
  deviceType: 'desktop' | 'tablet' | 'mobile';
  activeStep?: number;
}

const AppMockup: React.FC<AppMockupProps> = ({ deviceType, activeStep = 0 }) => {
  const theme = useTheme();

  const getDeviceStyles = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          width: 320,
          height: 568,
          borderRadius: 6,
          padding: 2,
        };
      case 'tablet':
        return {
          width: 768,
          height: 500,
          borderRadius: 4,
          padding: 3,
        };
      default: // desktop
        return {
          width: '100%',
          height: 600,
          borderRadius: 3,
          padding: 4,
        };
    }
  };

  const deviceStyles = getDeviceStyles();

  const mockupScreens = [
    {
      title: 'Campaign Setup Dashboard',
      description: 'Create and configure your advertising campaigns',
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                📝 Campaign Details
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ height: 8, bgcolor: alpha(theme.palette.primary.main, 0.2), borderRadius: 1 }} />
                <Box sx={{ height: 8, bgcolor: alpha(theme.palette.primary.main, 0.2), borderRadius: 1, width: '80%' }} />
                <Box sx={{ height: 8, bgcolor: alpha(theme.palette.secondary.main, 0.2), borderRadius: 1, width: '60%' }} />
              </Stack>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                🎯 Target Audience
              </Typography>
              <Grid container spacing={1}>
                {['Demographics', 'Interests', 'Behaviors', 'Locations'].map((item, index) => (
                  <Grid item key={index}>
                    <Chip size="small" label={item} variant="outlined" />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                💰 Budget Allocation
              </Typography>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary.main">
                  $2,500
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Budget
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ),
    },
    {
      title: 'AI Analysis in Progress',
      description: 'Ceaser analyzes market trends and competition',
      content: (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
          >
            <AutoAwesome sx={{ fontSize: 48, color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" gutterBottom>
            🧠 AI Analysis Running
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Analyzing competitor strategies, market trends, and audience insights...
          </Typography>
          <Stack spacing={2} sx={{ maxWidth: 400, mx: 'auto' }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Market Research
              </Typography>
              <LinearProgress variant="determinate" value={85} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Competitor Analysis
              </Typography>
              <LinearProgress variant="determinate" value={72} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Audience Insights
              </Typography>
              <LinearProgress variant="determinate" value={94} />
            </Box>
          </Stack>
        </Box>
      ),
    },
    {
      title: 'Generated Campaign Content',
      description: 'AI-generated ad copy and creative recommendations',
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                ✨ Generated Ad Copy
              </Typography>
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  "Transform your business with AI-powered advertising that delivers real results. 
                  Join thousands of companies already seeing 300% ROI improvements."
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip size="small" label="High CTR" color="success" />
                <Chip size="small" label="A/B Tested" color="primary" />
              </Stack>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                🎨 Creative Suggestions
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Box
                    sx={{
                      aspectRatio: '1',
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption">Image A</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box
                    sx={{
                      aspectRatio: '1',
                      bgcolor: alpha(theme.palette.secondary.main, 0.2),
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption">Image B</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box
                    sx={{
                      aspectRatio: '1',
                      bgcolor: alpha(theme.palette.success.main, 0.2),
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption">Image C</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                📊 Predicted Performance
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Expected CTR
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    3.2%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Conversions
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    245
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Projected ROI
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    285%
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      ),
    },
    {
      title: 'Live Campaign Dashboard',
      description: 'Real-time monitoring and optimization',
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                📈 Performance Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUp color="success" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5">45.2K</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Impressions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Analytics color="primary" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5">1.2K</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Clicks
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <People color="secondary" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5">89</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Conversions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <MonetizationOn color="success" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5">3.2x</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ROI
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                📊 Campaign Performance Chart
              </Typography>
              <Box
                sx={{
                  height: 200,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Simulated chart lines */}
                <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                  <polyline
                    points="20,150 80,120 140,100 200,80 260,70 320,50"
                    fill="none"
                    stroke={theme.palette.primary.main}
                    strokeWidth="3"
                  />
                  <polyline
                    points="20,160 80,140 140,110 200,95 260,85 320,75"
                    fill="none"
                    stroke={theme.palette.secondary.main}
                    strokeWidth="2"
                  />
                </svg>
                <Typography variant="body2" color="text.secondary">
                  Real-time Performance Metrics
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                🤖 AI Recommendations
              </Typography>
              <Stack spacing={1}>
                <Chip
                  icon={<Schedule />}
                  label="Increase budget at 3-5 PM"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<Campaign />}
                  label="Test new ad creative"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  icon={<People />}
                  label="Expand to similar audience"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      ),
    },
  ];

  const currentScreen = mockupScreens[activeStep] || mockupScreens[0];

  return (
    <Box
      sx={{
        ...deviceStyles,
        mx: 'auto',
        border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
        bgcolor: 'background.paper',
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
        overflow: 'hidden',
      }}
    >
      {/* Device Header */}
      <Box
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          pb: 1,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'error.main',
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'warning.main',
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'success.main',
            }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          CeaserTheAdGenius {deviceType}
        </Typography>
      </Box>

      {/* Screen Content */}
      <Box sx={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {currentScreen.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {currentScreen.description}
        </Typography>
        {currentScreen.content}
      </Box>
    </Box>
  );
};

export default AppMockup;
