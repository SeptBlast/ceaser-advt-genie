import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  LinearProgress,
  useTheme,
  alpha,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Campaign,
  Psychology,
  Visibility,
  Mouse,
  MonetizationOn,
  Assessment,
  Add,
  MoreVert,
  AutoAwesome,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

// Mock data for demonstration
const mockStats = [
  {
    title: 'Total Campaigns',
    value: '124',
    change: '+12.5%',
    trending: 'up' as const,
    icon: <Campaign />,
    color: 'primary' as const,
  },
  {
    title: 'Active Creatives',
    value: '456',
    change: '+8.2%',
    trending: 'up' as const,
    icon: <Psychology />,
    color: 'secondary' as const,
  },
  {
    title: 'Total Impressions',
    value: '2.4M',
    change: '+15.3%',
    trending: 'up' as const,
    icon: <Visibility />,
    color: 'success' as const,
  },
  {
    title: 'Click-through Rate',
    value: '3.8%',
    change: '-2.1%',
    trending: 'down' as const,
    icon: <Mouse />,
    color: 'warning' as const,
  },
  {
    title: 'Total Revenue',
    value: '$48.2K',
    change: '+22.4%',
    trending: 'up' as const,
    icon: <MonetizationOn />,
    color: 'info' as const,
  },
  {
    title: 'ROAS',
    value: '4.2x',
    change: '+0.8x',
    trending: 'up' as const,
    icon: <Assessment />,
    color: 'error' as const,
  },
];

const mockRecentCampaigns = [
  {
    id: '1',
    name: 'Summer Sale 2024',
    status: 'active',
    budget: '$5,000',
    spent: '$3,250',
    roas: '4.2x',
    creatives: 8,
  },
  {
    id: '2',
    name: 'Brand Awareness Q2',
    status: 'paused',
    budget: '$10,000',
    spent: '$7,800',
    roas: '3.8x',
    creatives: 12,
  },
  {
    id: '3',
    name: 'Product Launch',
    status: 'draft',
    budget: '$15,000',
    spent: '$0',
    roas: '-',
    creatives: 3,
  },
];

const mockTopCreatives = [
  {
    id: '1',
    type: 'image',
    campaign: 'Summer Sale 2024',
    ctr: '4.2%',
    conversions: 245,
    thumbnail: '/images/creative-1.jpg',
  },
  {
    id: '2',
    type: 'video',
    campaign: 'Brand Awareness Q2',
    ctr: '3.8%',
    conversions: 189,
    thumbnail: '/images/creative-2.jpg',
  },
  {
    id: '3',
    type: 'carousel',
    campaign: 'Product Launch',
    ctr: '5.1%',
    conversions: 167,
    thumbnail: '/images/creative-3.jpg',
  },
];

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { tenantContext, performanceSummary, loading } = useAppStore();

  React.useEffect(() => {
    // Fetch performance summary on component mount
    // fetchPerformanceSummary();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getCreativeTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'image':
        return '🖼️';
      case 'carousel':
        return '🎠';
      default:
        return '📝';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
          Welcome back! 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's what's happening with your campaigns today.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mockStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette[stat.color].main, 0.1),
                      color: theme.palette[stat.color].main,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {stat.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {stat.trending === 'up' ? (
                    <TrendingUp fontSize="small" color="success" />
                  ) : (
                    <TrendingDown fontSize="small" color="error" />
                  )}
                  <Typography
                    variant="caption"
                    color={stat.trending === 'up' ? 'success.main' : 'error.main'}
                    sx={{ ml: 0.5 }}
                  >
                    {stat.change}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Campaigns */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  Recent Campaigns
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/campaigns/new')}
                >
                  New Campaign
                </Button>
              </Box>

              <Stack spacing={2}>
                {mockRecentCampaigns.map((campaign) => (
                  <Box
                    key={campaign.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {campaign.name}
                          </Typography>
                          <Chip
                            label={campaign.status}
                            size="small"
                            color={getStatusColor(campaign.status)}
                          />
                        </Box>
                        <Grid container spacing={3}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="textSecondary">
                              Budget
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {campaign.budget}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="textSecondary">
                              Spent
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {campaign.spent}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="textSecondary">
                              ROAS
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {campaign.roas}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="textSecondary">
                              Creatives
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {campaign.creatives}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                      <IconButton>
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="text" onClick={() => navigate('/campaigns')}>
                  View All Campaigns
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Creatives */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  Top Creatives
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AutoAwesome />}
                  size="small"
                  onClick={() => navigate('/creatives/generate')}
                >
                  Generate
                </Button>
              </Box>

              <Stack spacing={2}>
                {mockTopCreatives.map((creative, index) => (
                  <Box
                    key={creative.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => navigate(`/creatives/${creative.id}`)}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}
                    >
                      {getCreativeTypeIcon(creative.type)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                        {creative.campaign}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {creative.type} • CTR: {creative.ctr}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                          {creative.conversions} conversions
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="text" onClick={() => navigate('/creatives')}>
                  View All Creatives
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Campaign />}
              onClick={() => navigate('/campaigns/new')}
            >
              Create Campaign
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<AutoAwesome />}
              onClick={() => navigate('/creatives/generate')}
            >
              Generate Creative
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Assessment />}
              onClick={() => navigate('/analytics')}
            >
              View Analytics
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
