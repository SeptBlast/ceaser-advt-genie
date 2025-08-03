import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Email,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmailPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, resendVerificationEmail, logout } = useAuth();

  const handleResendEmail = async () => {
    try {
      await resendVerificationEmail();
    } catch (error) {
      console.error('Error resending verification email:', error);
    }
  };

  const handleContinue = () => {
    if (user?.emailVerified) {
      navigate('/dashboard');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            {user?.emailVerified ? (
              <CheckCircle sx={{ color: 'white', fontSize: 40 }} />
            ) : (
              <Email sx={{ color: 'white', fontSize: 40 }} />
            )}
          </Box>

          {/* Content */}
          {user?.emailVerified ? (
            <>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
                Email Verified!
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                Your email address has been successfully verified. You can now access all features of AdGenius.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleContinue}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                Continue to Dashboard
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Verify Your Email
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                We've sent a verification email to:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 4, color: 'primary.main' }}>
                {user?.email}
              </Typography>
              
              <Alert severity="info" sx={{ mb: 4 }}>
                Please check your inbox and click the verification link to activate your account.
                Don't forget to check your spam folder!
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleResendEmail}
                >
                  Resend Email
                </Button>
                <Button
                  variant="contained"
                  onClick={handleContinue}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  I've Verified
                </Button>
              </Box>

              <Typography variant="body2" color="textSecondary">
                Wrong email address?{' '}
                <Button
                  variant="text"
                  size="small"
                  onClick={handleSignOut}
                  sx={{ textTransform: 'none' }}
                >
                  Sign out and try again
                </Button>
              </Typography>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;
