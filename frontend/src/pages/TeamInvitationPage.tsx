import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
  Container,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Email,
  Business,
  AdminPanelSettings,
  Campaign,
  Analytics,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { TeamInvitation, UserRole } from '../types/team';
import { teamService } from '../services/teamService';

const TeamInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [invitation, setInvitation] = useState<TeamInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (token) {
      loadInvitation();
    } else {
      setError('Invalid invitation link');
      setLoading(false);
    }
  }, [token]);

  const loadInvitation = async () => {
    try {
      if (!token) return;
      
      const invitationData = await teamService.getInvitation(token);
      setInvitation(invitationData);
    } catch (err) {
      setError('Failed to load invitation details. The invitation may be expired or invalid.');
      console.error('Error loading invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token || !user) return;
    
    setProcessing(true);
    try {
      await teamService.acceptInvitation(token);
      
      // Show success message and redirect to dashboard
      navigate('/dashboard', { 
        state: { 
          message: 'Successfully joined the team! Welcome aboard!' 
        }
      });
    } catch (err) {
      setError('Failed to accept invitation. Please try again or contact support.');
      console.error('Error accepting invitation:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!token) return;
    
    setProcessing(true);
    try {
      await teamService.declineInvitation(token);
      navigate('/', { 
        state: { 
          message: 'Invitation declined successfully.' 
        }
      });
    } catch (err) {
      setError('Failed to decline invitation. Please try again.');
      console.error('Error declining invitation:', err);
    } finally {
      setProcessing(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'tenant_admin': return <AdminPanelSettings />;
      case 'tenant_marketer': return <Campaign />;
      case 'tenant_analyst': return <Analytics />;
      default: return <Business />;
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'tenant_admin': return 'Tenant Administrator';
      case 'tenant_marketer': return 'Marketing Specialist';
      case 'tenant_analyst': return 'Data Analyst';
      default: return 'Team Member';
    }
  };

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'tenant_admin': return theme.palette.error.main;
      case 'tenant_marketer': return theme.palette.primary.main;
      case 'tenant_analyst': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

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
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
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
        <Container maxWidth="sm">
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Authentication Required
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Please log in to accept this team invitation.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login', { state: { returnTo: `/team/invitation/${token}` } })}
              >
                Log In
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

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
        {error ? (
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Cancel fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Invitation Error
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {error}
              </Typography>
              <Button variant="outlined" onClick={() => navigate('/')}>
                Return Home
              </Button>
            </CardContent>
          </Card>
        ) : invitation ? (
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
            }}
          >
            <CardContent sx={{ p: 6 }}>
              <Stack spacing={4} alignItems="center" textAlign="center">
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 80,
                    height: 80,
                  }}
                >
                  <Email fontSize="large" />
                </Avatar>

                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Team Invitation
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    You've been invited to join a team!
                  </Typography>
                </Box>

                <Card
                  elevation={0}
                  sx={{
                    width: '100%',
                    background: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Email:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {invitation.email}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Role:
                        </Typography>
                        <Chip
                          icon={getRoleIcon(invitation.role)}
                          label={getRoleDisplayName(invitation.role)}
                          size="small"
                          sx={{
                            bgcolor: alpha(getRoleColor(invitation.role), 0.1),
                            color: getRoleColor(invitation.role),
                            border: `1px solid ${alpha(getRoleColor(invitation.role), 0.3)}`,
                          }}
                        />
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Invited By:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {invitation.invitedBy}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Expires:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                {invitation.message && (
                  <Alert severity="info" sx={{ width: '100%' }}>
                    <Typography variant="body2">
                      <strong>Message from {invitation.invitedBy}:</strong><br />
                      {invitation.message}
                    </Typography>
                  </Alert>
                )}

                <Stack direction="row" spacing={2} width="100%">
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={handleDeclineInvitation}
                    disabled={processing}
                    startIcon={<Cancel />}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleAcceptInvitation}
                    disabled={processing}
                    startIcon={processing ? <CircularProgress size={20} /> : <CheckCircle />}
                  >
                    {processing ? 'Processing...' : 'Accept Invitation'}
                  </Button>
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                  By accepting this invitation, you'll become a member of this team with the specified role and permissions.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </Container>
    </Box>
  );
};

export default TeamInvitationPage;
