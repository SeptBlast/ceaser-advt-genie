import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Block,
  CheckCircle,
  Business,
  People,
  MonetizationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  plan: 'starter' | 'pro' | 'enterprise';
  users: number;
  maxUsers: number;
  storageUsed: number; // GB
  storageLimit: number; // GB
  monthlyRevenue: number;
  lastActivity: string;
  createdAt: string;
  health: 'good' | 'warning' | 'critical';
  features: string[];
  apiUsage: number;
  apiLimit: number;
}

interface TenantFilters {
  status: string;
  plan: string;
  health: string;
  search: string;
}

const TenantsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: '1',
      name: 'Acme Corporation',
      domain: 'acme.ceaseradgenius.com',
      status: 'active',
      plan: 'enterprise',
      users: 45,
      maxUsers: 100,
      storageUsed: 120,
      storageLimit: 500,
      monthlyRevenue: 2500,
      lastActivity: '2 hours ago',
      createdAt: '2024-01-15',
      health: 'good',
      features: ['AI Generation', 'Analytics', 'Custom Branding'],
      apiUsage: 8400,
      apiLimit: 50000,
    },
    {
      id: '2',
      name: 'TechStart Inc',
      domain: 'techstart.ceaseradgenius.com',
      status: 'trial',
      plan: 'pro',
      users: 8,
      maxUsers: 25,
      storageUsed: 15,
      storageLimit: 100,
      monthlyRevenue: 0,
      lastActivity: '1 day ago',
      createdAt: '2024-08-01',
      health: 'warning',
      features: ['AI Generation', 'Analytics'],
      apiUsage: 2200,
      apiLimit: 10000,
    },
    {
      id: '3',
      name: 'Global Marketing Solutions',
      domain: 'globalmarketing.ceaseradgenius.com',
      status: 'active',
      plan: 'pro',
      users: 23,
      maxUsers: 25,
      storageUsed: 78,
      storageLimit: 100,
      monthlyRevenue: 599,
      lastActivity: '30 minutes ago',
      createdAt: '2024-03-20',
      health: 'good',
      features: ['AI Generation', 'Analytics'],
      apiUsage: 7800,
      apiLimit: 10000,
    },
    {
      id: '4',
      name: 'StartupXYZ',
      domain: 'startupxyz.ceaseradgenius.com',
      status: 'suspended',
      plan: 'starter',
      users: 3,
      maxUsers: 5,
      storageUsed: 2,
      storageLimit: 25,
      monthlyRevenue: 0,
      lastActivity: '2 weeks ago',
      createdAt: '2024-07-10',
      health: 'critical',
      features: ['AI Generation'],
      apiUsage: 150,
      apiLimit: 1000,
    },
  ]);

  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>(tenants);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState<TenantFilters>({
    status: 'all',
    plan: 'all',
    health: 'all',
    search: '',
  });

  useEffect(() => {
    applyFilters();
  }, [filters, tenants]);

  const applyFilters = () => {
    let filtered = tenants;

    if (filters.search) {
      filtered = filtered.filter(tenant =>
        tenant.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(tenant => tenant.status === filters.status);
    }

    if (filters.plan !== 'all') {
      filtered = filtered.filter(tenant => tenant.plan === filters.plan);
    }

    if (filters.health !== 'all') {
      filtered = filtered.filter(tenant => tenant.health === filters.health);
    }

    setFilteredTenants(filtered);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, tenant: Tenant) => {
    setAnchorEl(event.currentTarget);
    setSelectedTenant(tenant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTenant(null);
  };

  const handleSuspendTenant = async (tenantId: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTenants(prev => prev.map(tenant =>
      tenant.id === tenantId
        ? { ...tenant, status: tenant.status === 'suspended' ? 'active' : 'suspended' as const }
        : tenant
    ));
    setLoading(false);
    handleMenuClose();
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTenants(prev => prev.filter(tenant => tenant.id !== tenantId));
      setLoading(false);
      handleMenuClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'info';
      case 'suspended': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'primary';
      case 'pro': return 'secondary';
      case 'starter': return 'default';
      default: return 'default';
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: `${color}.main`, color: 'white' }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Global Tenant Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all platform tenants, subscriptions, and resource usage
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/tenants/new')}
        >
          Add Tenant
        </Button>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Tenants"
            value={tenants.length}
            icon={<Business />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Tenants"
            value={tenants.filter(t => t.status === 'active').length}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Users"
            value={tenants.reduce((sum, t) => sum + t.users, 0)}
            icon={<People />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Revenue"
            value={`$${tenants.reduce((sum, t) => sum + t.monthlyRevenue, 0).toLocaleString()}`}
            icon={<MonetizationOn />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search tenants..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="trial">Trial</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Plan</InputLabel>
                <Select
                  value={filters.plan}
                  label="Plan"
                  onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
                >
                  <MenuItem value="all">All Plans</MenuItem>
                  <MenuItem value="starter">Starter</MenuItem>
                  <MenuItem value="pro">Pro</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Health</InputLabel>
                <Select
                  value={filters.health}
                  label="Health"
                  onChange={(e) => setFilters(prev => ({ ...prev, health: e.target.value }))}
                >
                  <MenuItem value="all">All Health</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilters({ status: 'all', plan: 'all', health: 'all', search: '' })}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tenant</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Storage</TableCell>
                <TableCell>API Usage</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Health</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTenants
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((tenant) => (
                  <TableRow
                    key={tenant.id}
                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Stack>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {tenant.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tenant.domain}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.status}
                        color={getStatusColor(tenant.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.plan}
                        color={getPlanColor(tenant.plan) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack alignItems="flex-start">
                        <Typography variant="body2">
                          {tenant.users} / {tenant.maxUsers}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(tenant.users / tenant.maxUsers) * 100}
                          sx={{ width: 60, height: 4 }}
                          color={tenant.users / tenant.maxUsers > 0.9 ? 'warning' : 'primary'}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack alignItems="flex-start">
                        <Typography variant="body2">
                          {tenant.storageUsed}GB / {tenant.storageLimit}GB
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(tenant.storageUsed / tenant.storageLimit) * 100}
                          sx={{ width: 60, height: 4 }}
                          color={tenant.storageUsed / tenant.storageLimit > 0.9 ? 'warning' : 'primary'}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack alignItems="flex-start">
                        <Typography variant="body2">
                          {tenant.apiUsage.toLocaleString()} / {tenant.apiLimit.toLocaleString()}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(tenant.apiUsage / tenant.apiLimit) * 100}
                          sx={{ width: 60, height: 4 }}
                          color={tenant.apiUsage / tenant.apiLimit > 0.9 ? 'warning' : 'primary'}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${tenant.monthlyRevenue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.health}
                        color={getHealthColor(tenant.health) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {tenant.lastActivity}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/tenants/${tenant.id}/edit`)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, tenant)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTenants.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => navigate(`/admin/tenants/${selectedTenant?.id}`)}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => navigate(`/admin/tenants/${selectedTenant?.id}/edit`)}>
          <Edit sx={{ mr: 1 }} />
          Edit Tenant
        </MenuItem>
        <MenuItem onClick={() => selectedTenant && handleSuspendTenant(selectedTenant.id)}>
          <Block sx={{ mr: 1 }} />
          {selectedTenant?.status === 'suspended' ? 'Activate' : 'Suspend'} Tenant
        </MenuItem>
        <MenuItem
          onClick={() => selectedTenant && handleDeleteTenant(selectedTenant.id)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete Tenant
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TenantsManagementPage;
