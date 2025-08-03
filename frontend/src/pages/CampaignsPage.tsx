import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Fab,
  useTheme,
  alpha,
  LinearProgress,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  Visibility,
  Campaign as CampaignIcon,
  DateRange,
  TrendingUp,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import dayjs from 'dayjs';

const CampaignsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { 
    campaigns, 
    loading, 
    errors, 
    fetchCampaigns, 
    deleteCampaign,
    updateCampaign 
  } = useAppStore();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = React.useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, campaign: any) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };

  const handleEdit = () => {
    if (selectedCampaign) {
      navigate(`/campaigns/${selectedCampaign.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedCampaign) {
      try {
        await deleteCampaign(selectedCampaign.id);
        setDeleteDialogOpen(false);
        setSelectedCampaign(null);
      } catch (error) {
        console.error('Failed to delete campaign:', error);
      }
    }
  };

  const handleStatusToggle = async (campaign: any) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      await updateCampaign(campaign.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update campaign status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'draft':
        return 'default';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Campaign Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
            <CampaignIcon color="primary" fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              ID: {params.row.id}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'budget',
      headerName: 'Budget',
      width: 120,
      renderCell: (params: GridRenderCellParams) => formatCurrency(params.value),
    },
    {
      field: 'spent',
      headerName: 'Spent',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">
            {formatCurrency(params.row.spent || 0)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(params.row.spent || 0) / params.row.budget * 100}
            sx={{ width: '100%', mt: 0.5 }}
            color={
              (params.row.spent || 0) / params.row.budget > 0.8 ? 'warning' : 'primary'
            }
          />
        </Box>
      ),
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      renderCell: (params: GridRenderCellParams) => formatDate(params.value),
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 120,
      renderCell: (params: GridRenderCellParams) => 
        params.value ? formatDate(params.value) : 'Ongoing',
    },
    {
      field: 'creatives',
      headerName: 'Creatives',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.row.creativesCount || 0}
        </Typography>
      ),
    },
    {
      field: 'performance',
      headerName: 'Performance',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUp fontSize="small" color="success" />
            {params.row.roas || 'N/A'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            ROAS
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusToggle(params.row);
            }}
            color={params.row.status === 'active' ? 'warning' : 'success'}
          >
            {params.row.status === 'active' ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, params.row)}
          >
            <MoreVert />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Mock data for demonstration
  const mockCampaigns = [
    {
      id: '1',
      name: 'Summer Sale 2024',
      status: 'active',
      budget: 5000,
      spent: 3250,
      dailyBudget: 200,
      startDate: '2024-07-01',
      endDate: '2024-08-31',
      creativesCount: 8,
      roas: '4.2x',
    },
    {
      id: '2',
      name: 'Brand Awareness Q2',
      status: 'paused',
      budget: 10000,
      spent: 7800,
      dailyBudget: 300,
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      creativesCount: 12,
      roas: '3.8x',
    },
    {
      id: '3',
      name: 'Product Launch',
      status: 'draft',
      budget: 15000,
      spent: 0,
      dailyBudget: 500,
      startDate: '2024-09-01',
      endDate: '2024-10-31',
      creativesCount: 3,
      roas: '-',
    },
  ];

  const displayCampaigns = campaigns.length > 0 ? campaigns : mockCampaigns;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Campaigns
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage and monitor your advertising campaigns
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/campaigns/new')}
          size="large"
        >
          Create Campaign
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {displayCampaigns.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Campaigns
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>
                {displayCampaigns.filter(c => c.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Campaigns
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(displayCampaigns.reduce((sum, c) => sum + c.budget, 0))}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Budget
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(displayCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0))}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Spent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Campaigns Table */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={displayCampaigns}
              columns={columns}
              loading={loading.campaigns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              onRowClick={(params) => navigate(`/campaigns/${params.id}`)}
              sx={{
                border: 0,
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row:hover': {
                  cursor: 'pointer',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedCampaign && navigate(`/campaigns/${selectedCampaign.id}`)}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Edit Campaign
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Campaign
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Campaign</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedCampaign?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add campaign"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => navigate('/campaigns/new')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default CampaignsPage;
