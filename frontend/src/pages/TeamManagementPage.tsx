import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Delete,
  Email,
  AdminPanelSettings,
  Campaign,
  Analytics,
  People,
  Refresh,
  Send,
  CheckCircle,
  Schedule,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, TeamMember, TeamInvitation } from '../types/team';
import { teamService, InviteTeamMemberRequest, UpdateTeamMemberRequest } from '../services/teamService';

interface TeamManagementPageProps {
  tenantId?: string;
}

const TeamManagementPage: React.FC<TeamManagementPageProps> = ({ tenantId }) => {
  const { userProfile } = useAuth();
  const theme = useTheme();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  // Form states
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'tenant_marketer' as UserRole,
    message: '',
  });
  
  const [editForm, setEditForm] = useState({
    role: 'tenant_marketer' as UserRole,
    isActive: true,
    department: '',
    jobTitle: '',
  });

  const currentTenantId = tenantId || userProfile?.tenantId;

  useEffect(() => {
    if (currentTenantId) {
      loadTeamData();
    }
  }, [currentTenantId]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      if (!currentTenantId) {
        throw new Error('No tenant ID available');
      }

      // Load team members and invitations from API
      const [membersResponse, invitationsResponse] = await Promise.all([
        teamService.getTeamMembers(currentTenantId),
        teamService.getTeamInvitations(currentTenantId),
      ]);

      setTeamMembers(membersResponse.members);
      setInvitations(invitationsResponse.invitations);
    } catch (err) {
      setError('Failed to load team data');
      console.error('Error loading team data:', err);
      
      // Fallback to mock data for development
      const mockMembers: TeamMember[] = [
        {
          id: '1',
          userId: 'user1',
          tenantId: currentTenantId!,
          email: 'john.doe@company.com',
          displayName: 'John Doe',
          role: 'tenant_admin',
          permissions: [],
          isActive: true,
          invitedBy: 'admin',
          invitedAt: '2024-01-15T10:00:00Z',
          joinedAt: '2024-01-15T10:30:00Z',
          metadata: {
            department: 'Marketing',
            jobTitle: 'Marketing Director',
          },
        },
        {
          id: '2',
          userId: 'user2',
          tenantId: currentTenantId!,
          email: 'jane.smith@company.com',
          displayName: 'Jane Smith',
          role: 'tenant_marketer',
          permissions: [],
          isActive: true,
          invitedBy: 'admin',
          invitedAt: '2024-01-16T09:00:00Z',
          joinedAt: '2024-01-16T09:15:00Z',
          metadata: {
            department: 'Marketing',
            jobTitle: 'Campaign Manager',
          },
        },
        {
          id: '3',
          userId: 'user3',
          tenantId: currentTenantId!,
          email: 'mike.wilson@company.com',
          displayName: 'Mike Wilson',
          role: 'tenant_analyst',
          permissions: [],
          isActive: true,
          invitedBy: 'admin',
          invitedAt: '2024-01-17T14:00:00Z',
          joinedAt: '2024-01-17T14:20:00Z',
          metadata: {
            department: 'Analytics',
            jobTitle: 'Data Analyst',
          },
        },
      ];

      const mockInvitations: TeamInvitation[] = [
        {
          id: '1',
          tenantId: currentTenantId!,
          email: 'sarah.brown@company.com',
          role: 'tenant_marketer',
          invitedBy: 'admin',
          invitedAt: '2024-01-20T10:00:00Z',
          expiresAt: '2024-01-27T10:00:00Z',
          status: 'pending',
          token: 'invite_token_123',
        },
      ];

      setTeamMembers(mockMembers);
      setInvitations(mockInvitations);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSubmit = async () => {
    try {
      if (!currentTenantId) {
        throw new Error('No tenant ID available');
      }

      const request: InviteTeamMemberRequest = {
        email: inviteForm.email,
        role: inviteForm.role,
        message: inviteForm.message || undefined,
      };

      await teamService.inviteTeamMember(currentTenantId, request);
      
      // Reset form and close dialog
      setInviteForm({ email: '', role: 'tenant_marketer', message: '' });
      setInviteDialogOpen(false);
      
      // Reload data
      await loadTeamData();
    } catch (err) {
      setError('Failed to send invitation');
      console.error('Error sending invitation:', err);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedMember || !currentTenantId) return;
    
    try {
      const request: UpdateTeamMemberRequest = {
        role: editForm.role,
        isActive: editForm.isActive,
        department: editForm.department || undefined,
        jobTitle: editForm.jobTitle || undefined,
      };

      await teamService.updateTeamMember(currentTenantId, selectedMember.id, request);
      
      // Reset form and close dialog
      setEditMemberDialogOpen(false);
      setSelectedMember(null);
      
      // Reload data
      await loadTeamData();
    } catch (err) {
      setError('Failed to update team member');
      console.error('Error updating team member:', err);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!currentTenantId) return;
    
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await teamService.removeTeamMember(currentTenantId, memberId);
        
        // Reload data
        await loadTeamData();
      } catch (err) {
        setError('Failed to remove team member');
        console.error('Error removing team member:', err);
      }
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

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'tenant_admin': return <AdminPanelSettings />;
      case 'tenant_marketer': return <Campaign />;
      case 'tenant_analyst': return <Analytics />;
      default: return <People />;
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'tenant_admin': return 'Tenant Admin';
      case 'tenant_marketer': return 'Marketer';
      case 'tenant_analyst': return 'Analyst';
      default: return 'User';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'active': return <CheckCircle color="success" />;
      case 'pending': return <Schedule color="warning" />;
      case 'expired': return <Cancel color="error" />;
      default: return <Schedule />;
    }
  };

  const canManageTeam = userProfile?.role === 'tenant_admin' || userProfile?.role === 'superadmin';
  const canEditMember = (member: TeamMember): boolean => {
    if (userProfile?.role === 'superadmin') return true;
    if (userProfile?.role === 'tenant_admin') {
      // Tenant admin can manage everyone except other tenant admins
      return member.role !== 'tenant_admin' || member.id === userProfile.uid;
    }
    return false;
  };

  if (!currentTenantId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          No tenant context available. Team management requires a tenant.
        </Alert>
      </Box>
    );
  }

  if (!canManageTeam) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          You don't have permission to manage team members.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
      minHeight: '100vh',
      p: 3 
    }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Team Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your team members and their roles
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadTeamData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setInviteDialogOpen(true)}
          >
            Invite Member
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Team Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <People color="primary" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {teamMembers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Members
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                  <Schedule color="warning" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {invitations.filter(inv => inv.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Invites
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <Campaign color="primary" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {teamMembers.filter(m => m.role === 'tenant_marketer').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Marketers
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                  <Analytics color="info" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {teamMembers.filter(m => m.role === 'tenant_analyst').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Analysts
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Team Members Table */}
      <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Team Members
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {member.displayName?.charAt(0) || member.email.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {member.displayName || member.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(member.role)}
                        label={getRoleDisplayName(member.role)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getRoleColor(member.role), 0.1),
                          color: getRoleColor(member.role),
                          border: `1px solid ${alpha(getRoleColor(member.role), 0.3)}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.metadata?.department || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.metadata?.jobTitle || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={member.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {canEditMember(member) && (
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit member">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedMember(member);
                                setEditForm({
                                  role: member.role,
                                  isActive: member.isActive,
                                  department: member.metadata?.department || '',
                                  jobTitle: member.metadata?.jobTitle || '',
                                });
                                setEditMemberDialogOpen(true);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {member.id !== userProfile?.uid && (
                            <Tooltip title="Remove member">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteMember(member.id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Pending Invitations
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Invited By</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            <Email />
                          </Avatar>
                          <Typography variant="body2">
                            {invitation.email}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {invitation.invitedBy}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {getStatusIcon(invitation.status)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {invitation.status}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Resend invitation">
                          <IconButton size="small">
                            <Send fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as UserRole })}
                label="Role"
              >
                <MenuItem value="tenant_marketer">Marketer</MenuItem>
                <MenuItem value="tenant_analyst">Analyst</MenuItem>
                {userProfile?.role === 'superadmin' && (
                  <MenuItem value="tenant_admin">Tenant Admin</MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Personal Message (Optional)"
              multiline
              rows={3}
              value={inviteForm.message}
              onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
              placeholder="Add a personal message to the invitation..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleInviteSubmit} 
            variant="contained"
            disabled={!inviteForm.email}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editMemberDialogOpen} onClose={() => setEditMemberDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Team Member</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                label="Role"
              >
                <MenuItem value="tenant_marketer">Marketer</MenuItem>
                <MenuItem value="tenant_analyst">Analyst</MenuItem>
                {userProfile?.role === 'superadmin' && (
                  <MenuItem value="tenant_admin">Tenant Admin</MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Department"
              value={editForm.department}
              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
            />
            <TextField
              fullWidth
              label="Job Title"
              value={editForm.jobTitle}
              onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMemberDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Update Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamManagementPage;
