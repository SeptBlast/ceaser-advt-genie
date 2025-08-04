import React, { useState } from 'react';
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
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Delete,
  PlayArrow,
  Campaign as CampaignIcon,
  Refresh,
} from '@mui/icons-material';
import { useCampaigns } from '../hooks/useApi';
import { Campaign } from '../types/api';

const CampaignsPage: React.FC = () => {
  const { 
    campaigns, 
    loading, 
    error, 
    fetchCampaigns, 
    deleteCampaign,
    createCampaign,
    clearError 
  } = useCampaigns();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    budget: 0,
    status: 'draft' as const,
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, campaign: Campaign) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
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

  const handleCreateCampaign = async () => {
    try {
      await createCampaign({
        name: newCampaign.name,
        description: newCampaign.description,
        budget: newCampaign.budget,
        status: newCampaign.status,
        targetAudience: {
          demographics: {
            ageRange: '25-45',
            gender: 'all',
            location: 'global',
            interests: [],
          },
          behavioralTargeting: {
            purchaseHistory: [],
            websiteInteractions: [],
            engagementPatterns: [],
          },
        },
      });
      setCreateDialogOpen(false);
      setNewCampaign({ name: '', description: '', budget: 0, status: 'draft' });
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning'; 
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Campaigns
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your advertising campaigns
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchCampaigns}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Campaign
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={clearError}>
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {campaigns.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Campaigns
                  </Typography>
                </Box>
                <CampaignIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {campaigns.filter(c => c.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active
                  </Typography>
                </Box>
                <PlayArrow color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Campaigns List */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            All Campaigns
          </Typography>
          
          {campaigns.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CampaignIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No campaigns yet
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Create your first campaign to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Campaign
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {campaign.name}
                          </Typography>
                          {campaign.description && (
                            <Typography variant="body2" color="textSecondary">
                              {campaign.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={campaign.status} 
                          color={getStatusColor(campaign.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(campaign.budget)}
                      </TableCell>
                      <TableCell>
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, campaign)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Campaign</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Campaign Name"
              fullWidth
              value={newCampaign.name}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newCampaign.description}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
            />
            <TextField
              label="Budget"
              type="number"
              fullWidth
              value={newCampaign.budget}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: Number(e.target.value) }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCampaign} variant="contained" disabled={!newCampaign.name || loading}>
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Campaign</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedCampaign?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => setDeleteDialogOpen(true)}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CampaignsPage;
