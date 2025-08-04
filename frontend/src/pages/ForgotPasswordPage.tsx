import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  useTheme,
  alpha,
  InputAdornment,
} from '@mui/material';
import {
  Email,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const theme = useTheme();
  const { resetPassword, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (err) {
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    clearError();
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
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <img 
                src="/assets/logo.svg" 
                alt="AdGenius Logo" 
                style={{ 
                  width: 48, 
                  height: 48,
                  filter: 'brightness(0) invert(1)' // Make logo white
                }} 
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Reset Password
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Enter your email address and we'll send you a reset link
            </Typography>
          </Box>

          {emailSent ? (
            /* Success State */
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset email sent! Check your inbox for further instructions.
              </Alert>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Didn't receive the email? Check your spam folder or try again.
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setEmailSent(false)}
                sx={{ mb: 2 }}
              >
                Send Another Email
              </Button>
              <Link component={RouterLink} to="/login" variant="body2">
                ← Back to Sign In
              </Link>
            </Box>
          ) : (
            /* Form State */
            <>
              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Reset Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    mb: 3,
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Box>

              {/* Back to Login */}
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontWeight: 600,
                  }}
                >
                  <ArrowBack sx={{ mr: 0.5, fontSize: 20 }} />
                  Back to Sign In
                </Link>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
