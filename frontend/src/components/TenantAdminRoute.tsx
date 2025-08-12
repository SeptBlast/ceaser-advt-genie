import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Container, Alert, Button, alpha, useTheme } from '@mui/material';
import { AdminPanelSettings, Lock } from '@mui/icons-material';

interface TenantAdminRouteProps {
  children: React.ReactNode;
}

const TenantAdminRoute: React.FC<TenantAdminRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const canAccessTeamManagement = userProfile?.role === 'tenant_admin' || userProfile?.role === 'superadmin';

  if (!canAccessTeamManagement) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                mb: 3,
              }}
            >
              <Lock
                sx={{
                  fontSize: 40,
                  color: theme.palette.error.main,
                }}
              />
            </Box>
            
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Team Management Access Required
            </Typography>
            
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              You need Tenant Admin privileges to access team management features.
            </Typography>

            <Alert
              severity="info"
              sx={{
                mb: 4,
                textAlign: 'left',
                background: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: theme.palette.info.main,
                },
              }}
            >
              <Typography variant="body2" component="div">
                <strong>Current Role:</strong> {userProfile?.role ? userProfile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'User'}
                <br />
                <strong>Required Role:</strong> Tenant Admin or Super Admin
                <br />
                <strong>Tenant:</strong> {userProfile?.tenantId || 'Not assigned'}
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => window.history.back()}
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    background: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                Go Back
              </Button>
              
              <Button
                variant="contained"
                href="/dashboard"
                startIcon={<AdminPanelSettings />}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                Return to Dashboard
              </Button>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 4, fontStyle: 'italic' }}
            >
              Contact your administrator to request elevated privileges if needed.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return <>{children}</>;
};

export default TenantAdminRoute;
