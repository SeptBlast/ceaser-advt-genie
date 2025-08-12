import React, { useState } from 'react';
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
  TextField,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogActions,
  Badge,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  Analytics,
  AutoAwesome,
  ArrowForward,
  Brightness4,
  Brightness7,
  PlayArrow,
  Security,
  Email,
  NotificationsActive,
  CheckCircle,
  Campaign,
  Insights,
  Phone,
  Computer,
  Tablet,
} from '@mui/icons-material';
import { useThemeMode } from '../ThemeProvider';
import CeaserButton from '../components/CeaserButton';
import AppMockup from '../components/AppMockup';
import PrivacyPolicy from '../components/legal/PrivacyPolicy';
import TermsAndConditions from '../components/legal/TermsAndConditions';
import SubscriptionService from '../services/subscriptionService';
import ThemeAwareLogo from '../components/ThemeAwareLogo';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();
  
  // State for waitlist and newsletter
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [mockupTab, setMockupTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mock app workflow steps
  const workflowSteps = [
    {
      title: 'Setup Campaign',
      description: 'Define your target audience, budget, and campaign objectives',
      icon: <Campaign />,
      screenshot: '/api/placeholder/400/300'
    },
    {
      title: 'AI Analysis',
      description: 'Ceaser analyzes market trends and competitor strategies',
      icon: <AutoAwesome />,
      screenshot: '/api/placeholder/400/300'
    },
    {
      title: 'Content Generation',
      description: 'AI creates compelling ad copy and visual recommendations',
      icon: <Insights />,
      screenshot: '/api/placeholder/400/300'
    },
    {
      title: 'Launch & Monitor',
      description: 'Deploy across platforms with real-time performance tracking',
      icon: <TrendingUp />,
      screenshot: '/api/placeholder/400/300'
    }
  ];

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !agreedToTerms || !agreedToPrivacy) return;
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const result = await SubscriptionService.joinWaitlist({
        email: waitlistEmail,
        agreedToTerms,
        agreedToPrivacy,
      });
      
      if (result.success) {
        setWaitlistSuccess(true);
        setWaitlistEmail('');
        setAgreedToTerms(false);
        setAgreedToPrivacy(false);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const result = await SubscriptionService.subscribeNewsletter({
        email: newsletterEmail,
      });
      
      if (result.success) {
        setNewsletterSuccess(true);
        setNewsletterEmail('');
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
            <ThemeAwareLogo
              width={60}
              height={60}
            />
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
            mb: 8,
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

        {/* App Workflow Mockup Section */}
        <Box sx={{ py: 8, mb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            See How CeaserTheAdGenius Works
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              mb: 6,
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            From campaign setup to performance optimization, watch how our AI companion guides you through every step.
          </Typography>

          {/* Interactive Demo Tabs */}
          <Box sx={{ mb: 4 }}>
            <Tabs
              value={mockupTab}
              onChange={(_, newValue) => setMockupTab(newValue)}
              centered
              sx={{
                '& .MuiTab-root': {
                  minWidth: 120,
                  fontWeight: 600,
                },
              }}
            >
              <Tab label="Desktop" icon={<Computer />} />
              <Tab label="Tablet" icon={<Tablet />} />
              <Tab label="Mobile" icon={<Phone />} />
            </Tabs>
          </Box>

          {/* Workflow Steps */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {workflowSteps.map((step, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Badge
                      badgeContent={index + 1}
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.75rem',
                          minWidth: 20,
                          height: 20,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        {React.cloneElement(step.icon, {
                          sx: { fontSize: 28, color: 'primary.main' },
                        })}
                      </Box>
                    </Badge>
                    
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
                    >
                      {step.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ lineHeight: 1.6 }}
                    >
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Demo Video Placeholder */}
          <Box sx={{ mb: 4 }}>
            <AppMockup 
              deviceType={mockupTab === 0 ? 'desktop' : mockupTab === 1 ? 'tablet' : 'mobile'} 
              activeStep={Math.floor(Date.now() / 3000) % 4} // Auto-cycle through steps
            />
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              p: 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <PlayArrow sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" color="text.primary" fontWeight={600}>
              Interactive Demo Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "View Demo" above to try the full platform
            </Typography>
          </Box>
        </Box>

        {/* Waitlist Section */}
        <Box
          sx={{
            py: 8,
            mb: 8,
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: alpha(theme.palette.secondary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
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
            Join the Waitlist 🎾
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
            Be among the first to experience CeaserTheAdGenius. Get early access and exclusive benefits.
          </Typography>

          {waitlistSuccess ? (
            <Box sx={{ mb: 4 }}>
              <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" color="success.main" fontWeight={600}>
                Welcome to the pack! 🐕
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You'll hear from us soon with exclusive early access.
              </Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleWaitlistSubmit} sx={{ maxWidth: 450, mx: 'auto', mb: 4 }}>
              <Stack spacing={3}>
                {errorMessage && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {errorMessage}
                  </Alert>
                )}
                
                <TextField
                  fullWidth
                  type="email"
                  placeholder="Enter your email address"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  required
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        required
                        disabled={loading}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        I agree to the{' '}
                        <Link
                          component="button"
                          type="button"
                          onClick={() => setShowTermsDialog(true)}
                          sx={{ 
                            textDecoration: 'none',
                            color: 'primary.main',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          disabled={loading}
                        >
                          Terms and Conditions
                        </Link>
                      </Typography>
                    }
                    sx={{
                      alignItems: 'flex-start',
                      '& .MuiFormControlLabel-label': {
                        lineHeight: 1.5,
                      },
                    }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreedToPrivacy}
                        onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                        required
                        disabled={loading}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        I agree to the{' '}
                        <Link
                          component="button"
                          type="button"
                          onClick={() => setShowPrivacyDialog(true)}
                          sx={{ 
                            textDecoration: 'none',
                            color: 'primary.main',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          disabled={loading}
                        >
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
                    sx={{
                      alignItems: 'flex-start',
                      '& .MuiFormControlLabel-label': {
                        lineHeight: 1.5,
                      },
                    }}
                  />
                </Stack>

                <CeaserButton
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!waitlistEmail || !agreedToTerms || !agreedToPrivacy || loading}
                  sx={{ py: 1.5 }}
                  startIcon={loading ? <CircularProgress size={20} /> : undefined}
                >
                  {loading ? 'Joining...' : 'Join Waitlist'}
                </CeaserButton>
              </Stack>
            </Box>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ 
              gap: { xs: 1, sm: 2 },
              mt: 3,
            }}
          >
            <Chip 
              icon={<Security />} 
              label="HIPAA Compliant" 
              color="primary" 
              variant="outlined"
              sx={{ minWidth: 'fit-content' }}
            />
            <Chip 
              icon={<Security />} 
              label="GDPR Compliant" 
              color="primary" 
              variant="outlined"
              sx={{ minWidth: 'fit-content' }}
            />
            <Chip 
              icon={<NotificationsActive />} 
              label="Early Access" 
              color="secondary" 
              variant="outlined"
              sx={{ minWidth: 'fit-content' }}
            />
          </Stack>
        </Box>

        {/* Newsletter Section */}
        <Box
          sx={{
            py: 6,
            mb: 8,
            textAlign: 'center',
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Stay Updated 📧
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'text.secondary',
              maxWidth: 400,
              mx: 'auto',
            }}
          >
            Get the latest updates, tips, and insights delivered to your inbox.
          </Typography>

          {newsletterSuccess ? (
            <Box>
              <Email color="success" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" color="success.main" fontWeight={600}>
                Subscribed successfully! 📬
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thank you for joining our newsletter.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxWidth: 400, mx: 'auto' }}>
              {errorMessage && (
                <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
                  {errorMessage}
                </Alert>
              )}
              <Box component="form" onSubmit={handleNewsletterSubmit}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
                  <TextField
                    fullWidth
                    type="email"
                    size="small"
                    placeholder="Your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    disabled={loading}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <CeaserButton
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={!newsletterEmail || loading}
                    sx={{ 
                      px: 3, 
                      whiteSpace: 'nowrap',
                      minWidth: { xs: '100%', sm: 'auto' },
                    }}
                    startIcon={loading ? <CircularProgress size={16} /> : undefined}
                  >
                    {loading ? 'Subscribing...' : 'Subscribe'}
                  </CeaserButton>
                </Stack>
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer with Legal Links */}
        <Divider sx={{ mb: 4 }} />
        
        <Box
          sx={{
            py: 4,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 3 }}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Link
              component="button"
              type="button"
              onClick={() => setShowPrivacyDialog(true)}
              sx={{ 
                textDecoration: 'none', 
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              component="button"
              type="button"
              onClick={() => setShowTermsDialog(true)}
              sx={{ 
                textDecoration: 'none', 
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Terms and Conditions
            </Link>
            <Typography variant="body2" color="text.secondary">
              HIPAA & GDPR Compliant
            </Typography>
          </Stack>
          
          <Typography variant="body2">
            © 2025 CeaserTheAdGenius. All rights reserved. 🐕
          </Typography>
        </Box>
      </Container>

      {/* Privacy Policy Dialog */}
      <Dialog
        open={showPrivacyDialog}
        onClose={() => setShowPrivacyDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: '90vh' },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
            <PrivacyPolicy />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <CeaserButton onClick={() => setShowPrivacyDialog(false)}>
            Close
          </CeaserButton>
        </DialogActions>
      </Dialog>

      {/* Terms and Conditions Dialog */}
      <Dialog
        open={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: '90vh' },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
            <TermsAndConditions />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <CeaserButton onClick={() => setShowTermsDialog(false)}>
            Close
          </CeaserButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;
