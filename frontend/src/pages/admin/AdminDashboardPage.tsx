import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  useTheme,
  alpha,
  Stack,
  Avatar,
  LinearProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  TrendingDown,
  Business,
  People,
  MonetizationOn,
  Warning,
  CheckCircle,
  Error,
  Support,
  Notifications,
  Settings,
  Assessment,
  Security,
  CloudSync,
  Speed,
  MoreVert,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SystemMetrics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  monthlyRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  openTickets: number;
  resolvedTickets: number;
  apiRequestsToday: number;
  storageUsedGB: number;
  totalStorageGB: number;
}

interface TenantOverview {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'trial';
  plan: string;
  users: number;
  monthlyUsage: number;
  lastActivity: string;
  health: 'good' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  type: 'tenant_created' | 'ticket_opened' | 'payment_received' | 'system_alert';
  description: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

const AdminDashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalTenants: 142,
    activeTenants: 138,
    totalUsers: 1847,
    monthlyRevenue: 47250,
    systemHealth: 'healthy',
    openTickets: 23,
    resolvedTickets: 156,
    apiRequestsToday: 89420,
    storageUsedGB: 2840,
    totalStorageGB: 5000,
  });

  const [recentTenants, setRecentTenants] = useState<TenantOverview[]>([
    {
      id: '1',
      name: 'Acme Corp',
      domain: 'acme.example.com',
      status: 'active',
      plan: 'Enterprise',
      users: 45,
      monthlyUsage: 2450,
      lastActivity: '2 hours ago',
      health: 'good',
    },
    {
      id: '2', 
      name: 'TechStart Inc',
      domain: 'techstart.example.com',
      status: 'trial',
      plan: 'Pro Trial',
      users: 8,
      monthlyUsage: 180,
      lastActivity: '1 day ago',
      health: 'warning',
    },
    {
      id: '3',
      name: 'Global Marketing',
      domain: 'globalmarketing.example.com',
      status: 'active',
      plan: 'Pro',
      users: 23,
      monthlyUsage: 890,
      lastActivity: '30 minutes ago',
      health: 'good',
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'tenant_created',
      description: 'New tenant "StartupXYZ" created',
      timestamp: '10 minutes ago',
      severity: 'info',
    },
    {
      id: '2',
      type: 'ticket_opened',
      description: 'High priority ticket from Acme Corp',
      timestamp: '25 minutes ago',
      severity: 'warning',
    },
    {
      id: '3',
      type: 'payment_received',
      description: 'Payment received from TechStart Inc ($299)',
      timestamp: '1 hour ago',
      severity: 'info',
    },
    {
      id: '4',
      type: 'system_alert',
      description: 'API response time spike detected',
      timestamp: '2 hours ago',
      severity: 'error',
    },
  ]);

  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'trial': return theme.palette.warning.main;
      case 'suspended': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'critical': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return <Notifications color="info" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Notifications />;
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'increase' | 'decrease';
    icon: React.ReactNode;
    color?: string;
    onClick?: () => void;
  }> = ({ title, value, change, changeType, icon, color, onClick }) => (
    <Card 
      elevation={0}
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle, ${alpha(color || theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        },
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 10px 40px ${alpha(color || theme.palette.primary.main, 0.2)}`,
          borderColor: alpha(color || theme.palette.primary.main, 0.3),
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              fontWeight={500}
              sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              fontWeight="700" 
              color={color || 'text.primary'}
              sx={{ mb: 1 }}
            >
              {value}
            </Typography>
            {change && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: changeType === 'increase' 
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.error.main, 0.1),
                  }}
                >
                  {changeType === 'increase' ? (
                    <TrendingUp sx={{ fontSize: 12, color: 'success.main' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 12, color: 'error.main' }} />
                  )}
                </Box>
                <Typography 
                  variant="body2" 
                  fontWeight={600}
                  color={changeType === 'increase' ? 'success.main' : 'error.main'}
                >
                  {change}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  vs last month
                </Typography>
              </Stack>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.1)} 0%, ${alpha(color || theme.palette.primary.main, 0.05)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(color || theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Box sx={{ color: color || theme.palette.primary.main, fontSize: 24 }}>
              {icon}
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
      minHeight: '100vh',
    }}>
      {/* Modern Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
          color: 'white',
          p: 4,
          borderRadius: 0,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(50%, -50%)',
          }
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Avatar
                sx={{
                  background: `linear-gradient(135deg, ${alpha('#fff', 0.2)} 0%, ${alpha('#fff', 0.1)} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha('#fff', 0.2)}`,
                }}
              >
                <Dashboard />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
                  Super Admin Dashboard
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Platform overview and global tenant management
                </Typography>
              </Box>
            </Stack>
            
            {/* Status Indicators */}
            <Stack direction="row" spacing={2} mt={2}>
              <Chip
                icon={<CheckCircle sx={{ fontSize: 16 }} />}
                label="All Systems Operational"
                size="small"
                sx={{
                  background: alpha('#4caf50', 0.2),
                  color: '#fff',
                  border: `1px solid ${alpha('#4caf50', 0.3)}`,
                  '& .MuiChip-icon': { color: '#4caf50' }
                }}
              />
              <Chip
                icon={<CloudSync sx={{ fontSize: 16 }} />}
                label="Real-time Sync"
                size="small"
                sx={{
                  background: alpha('#2196f3', 0.2),
                  color: '#fff',
                  border: `1px solid ${alpha('#2196f3', 0.3)}`,
                  '& .MuiChip-icon': { color: '#2196f3' }
                }}
              />
            </Stack>
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshData}
              disabled={loading}
              sx={{
                borderColor: alpha('#fff', 0.3),
                color: '#fff',
                backdropFilter: 'blur(10px)',
                background: alpha('#fff', 0.1),
                '&:hover': {
                  background: alpha('#fff', 0.2),
                  borderColor: alpha('#fff', 0.5),
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={() => navigate('/admin/settings')}
              sx={{
                background: alpha('#fff', 0.2),
                backdropFilter: 'blur(10px)',
                color: '#fff',
                border: `1px solid ${alpha('#fff', 0.3)}`,
                '&:hover': {
                  background: alpha('#fff', 0.3),
                }
              }}
            >
              System Settings
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ p: 4 }}>
        {loading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Tenants"
            value={metrics.totalTenants}
            change="+12.5%"
            changeType="increase"
            icon={<Business />}
            onClick={() => navigate('/admin/tenants')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={metrics.totalUsers.toLocaleString()}
            change="+8.2%"
            changeType="increase"
            icon={<People />}
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Revenue"
            value={`$${metrics.monthlyRevenue.toLocaleString()}`}
            change="+15.3%"
            changeType="increase"
            icon={<MonetizationOn />}
            color={theme.palette.success.main}
            onClick={() => navigate('/admin/billing')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Open Tickets"
            value={metrics.openTickets}
            change="-23.1%"
            changeType="decrease"
            icon={<Support />}
            color={metrics.openTickets > 50 ? theme.palette.warning.main : theme.palette.info.main}
            onClick={() => navigate('/admin/support')}
          />
        </Grid>
      </Grid>

      {/* System Health & Storage */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  System Health
                </Typography>
                <Chip 
                  label={metrics.systemHealth.toUpperCase()}
                  color={metrics.systemHealth === 'healthy' ? 'success' : 
                         metrics.systemHealth === 'warning' ? 'warning' : 'error'}
                  icon={metrics.systemHealth === 'healthy' ? <CheckCircle /> : <Warning />}
                />
              </Stack>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">API Requests Today</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metrics.apiRequestsToday.toLocaleString()}
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    color="success"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Storage Used</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metrics.storageUsedGB}GB / {metrics.totalStorageGB}GB
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={(metrics.storageUsedGB / metrics.totalStorageGB) * 100}
                    color={(metrics.storageUsedGB / metrics.totalStorageGB) > 0.8 ? 'warning' : 'primary'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Quick Actions
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Business />}
                    onClick={() => navigate('/admin/tenants/new')}
                    sx={{ mb: 1 }}
                  >
                    Add Tenant
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<People />}
                    onClick={() => navigate('/admin/users/invite')}
                    sx={{ mb: 1 }}
                  >
                    Invite User
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Assessment />}
                    onClick={() => navigate('/admin/reports')}
                  >
                    Generate Report
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Security />}
                    onClick={() => navigate('/admin/security')}
                  >
                    Security Audit
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Tenants & Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Tenants
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => navigate('/admin/tenants')}
                >
                  View All
                </Button>
              </Stack>
              <List>
                {recentTenants.map((tenant, index) => (
                  <React.Fragment key={tenant.id}>
                    <ListItem
                      sx={{ 
                        cursor: 'pointer',
                        borderRadius: 1,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                      }}
                      onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: getStatusColor(tenant.status), width: 32, height: 32 }}>
                          <Business fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle2">{tenant.name}</Typography>
                            <Chip 
                              label={tenant.status} 
                              size="small"
                              sx={{ 
                                bgcolor: alpha(getStatusColor(tenant.status), 0.1),
                                color: getStatusColor(tenant.status),
                                textTransform: 'capitalize'
                              }}
                            />
                            <Chip 
                              label={tenant.health} 
                              size="small"
                              sx={{ 
                                bgcolor: alpha(getHealthColor(tenant.health), 0.1),
                                color: getHealthColor(tenant.health),
                                textTransform: 'capitalize'
                              }}
                            />
                          </Stack>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} mt={0.5}>
                            <Typography variant="caption">
                              {tenant.users} users
                            </Typography>
                            <Typography variant="caption">
                              ${tenant.monthlyUsage}/month
                            </Typography>
                            <Typography variant="caption">
                              Last active: {tenant.lastActivity}
                            </Typography>
                          </Stack>
                        }
                      />
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </ListItem>
                    {index < recentTenants.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Activity
                </Typography>
                <Badge badgeContent={recentActivity.length} color="primary">
                  <Notifications />
                </Badge>
              </Stack>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon sx={{ mt: 1 }}>
                        {getSeverityIcon(activity.severity)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={activity.timestamp}
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Button 
                fullWidth 
                variant="outlined" 
                size="small"
                sx={{ mt: 1 }}
                onClick={() => navigate('/admin/activity')}
              >
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboardPage;
