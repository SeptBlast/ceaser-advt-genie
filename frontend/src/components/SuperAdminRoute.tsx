import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Chip,
  Stack,
  Container,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { 
  AdminPanelSettings, 
  ArrowBack, 
  Dashboard,
  Security,
  ContactSupport 
} from '@mui/icons-material';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Show loading while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Typography variant="h6" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show access denied if not super admin
  if (userProfile?.role !== 'superadmin') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              {/* Icon and Status */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <Security 
                  sx={{ 
                    fontSize: 40, 
                    color: theme.palette.warning.main,
                  }} 
                />
              </Box>

              {/* Title */}
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                color="text.primary"
                gutterBottom
                sx={{ mb: 2 }}
              >
                Access Restricted
              </Typography>

              {/* Subtitle */}
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ mb: 3, lineHeight: 1.6 }}
              >
                This area requires super administrator privileges to access.
              </Typography>

              {/* Current Role Badge */}
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4 }}>
                <Chip
                  icon={<AdminPanelSettings />}
                  label={`Current Role: ${userProfile?.role || 'user'}`}
                  variant="outlined"
                  color="primary"
                  sx={{ 
                    textTransform: 'capitalize',
                    borderRadius: 2,
                    px: 1
                  }}
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Info Card */}
              <Card 
                variant="outlined" 
                sx={{ 
                  background: alpha(theme.palette.info.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  borderRadius: 2,
                  mb: 4
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Need Access?</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contact your system administrator to request super admin privileges, 
                    or use the developer utility on your profile page if you're in development mode.
                  </Typography>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(-1)}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Go Back
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Dashboard />}
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  variant="text"
                  startIcon={<ContactSupport />}
                  onClick={() => navigate('/profile')}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Profile
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Render admin content for super admin users
  return <>{children}</>;
};

export default SuperAdminRoute;
