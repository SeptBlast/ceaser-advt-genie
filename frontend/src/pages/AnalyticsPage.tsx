import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  useTheme,
  alpha,
  Avatar,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  Mouse,
  MonetizationOn,
  Assessment,
  Campaign,
  Psychology,
  DateRange,
  Download,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAppStore } from '../store/appStore';
import dayjs from 'dayjs';

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { 
    campaigns, 
    analytics, 
    performanceSummary,
    loading, 
    fetchAnalytics,
    fetchPerformanceSummary,
    fetchCampaigns 
  } = useAppStore();

  const [selectedCampaign, setSelectedCampaign] = React.useState<string>('all');
  const [dateRange, setDateRange] = React.useState({
    start: dayjs().subtract(30, 'days'),
    end: dayjs(),
  });

  React.useEffect(() => {
    fetchCampaigns();
    fetchPerformanceSummary();
  }, [fetchCampaigns, fetchPerformanceSummary]);

  React.useEffect(() => {
    if (selectedCampaign && selectedCampaign !== 'all') {
      fetchAnalytics(selectedCampaign, {
        start: dateRange.start.format('YYYY-MM-DD'),
        end: dateRange.end.format('YYYY-MM-DD'),
      });
    }
  }, [selectedCampaign, dateRange, fetchAnalytics]);

  // Mock data for demonstration
  const mockOverviewStats = [
    {
      title: 'Total Impressions',
      value: '2.4M',
      change: '+15.3%',
      trending: 'up' as const,
      icon: <Visibility />,
      color: 'primary' as const,
    },
    {
      title: 'Total Clicks',
      value: '87.2K',
      change: '+12.8%',
      trending: 'up' as const,
      icon: <Mouse />,
      color: 'secondary' as const,
    },
    {
      title: 'Average CTR',
      value: '3.64%',
      change: '-0.2%',
      trending: 'down' as const,
      icon: <Assessment />,
      color: 'info' as const,
    },
    {
      title: 'Total Revenue',
      value: '$124.5K',
      change: '+28.4%',
      trending: 'up' as const,
      icon: <MonetizationOn />,
      color: 'success' as const,
    },
    {
      title: 'ROAS',
      value: '4.2x',
      change: '+0.8x',
      trending: 'up' as const,
      icon: <TrendingUp />,
      color: 'warning' as const,
    },
    {
      title: 'Active Campaigns',
      value: '24',
      change: '+4',
      trending: 'up' as const,
      icon: <Campaign />,
      color: 'error' as const,
    },
  ];

  const mockCampaignPerformance = [
    {
      id: '1',
      name: 'Summer Sale 2024',
      impressions: 1250000,
      clicks: 32500,
      ctr: 2.6,
      conversions: 2870,
      conversionRate: 8.8,
      spend: 12500,
      revenue: 52400,
      roas: 4.19,
      status: 'active',
    },
    {
      id: '2',
      name: 'Brand Awareness Q2',
      impressions: 890000,
      clicks: 24100,
      ctr: 2.7,
      conversions: 1890,
      conversionRate: 7.8,
      spend: 18900,
      revenue: 71200,
      roas: 3.77,
      status: 'active',
    },
    {
      id: '3',
      name: 'Product Launch',
      impressions: 340000,
      clicks: 15200,
      ctr: 4.5,
      conversions: 1560,
      conversionRate: 10.3,
      spend: 8400,
      revenue: 42800,
      roas: 5.10,
      status: 'paused',
    },
  ];

  const mockTopCreatives = [
    {
      id: '1',
      name: 'Summer Collection Video',
      type: 'video',
      campaign: 'Summer Sale 2024',
      impressions: 450000,
      clicks: 18900,
      ctr: 4.2,
      conversions: 1240,
    },
    {
      id: '2',
      name: 'Brand Story Carousel',
      type: 'carousel',
      campaign: 'Brand Awareness Q2',
      impressions: 320000,
      clicks: 12400,
      ctr: 3.9,
      conversions: 890,
    },
    {
      id: '3',
      name: 'Product Hero Image',
      type: 'image',
      campaign: 'Product Launch',
      impressions: 280000,
      clicks: 14200,
      ctr: 5.1,
      conversions: 1120,
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'completed':
        return 'info';
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Track performance and optimize your advertising campaigns
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>
            Export Report
          </Button>
          <Button variant="contained" startIcon={<Refresh />}>
            Refresh Data
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Campaign</InputLabel>
                <Select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  label="Campaign"
                >
                  <MenuItem value="all">All Campaigns</MenuItem>
                  {mockCampaignPerformance.map((campaign) => (
                    <MenuItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={dateRange.start}
                onChange={(value) => setDateRange(prev => ({ ...prev, start: value || dayjs() }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={dateRange.end}
                onChange={(value) => setDateRange(prev => ({ ...prev, end: value || dayjs() }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                fullWidth
                sx={{ height: 56 }}
              >
                More Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mockOverviewStats.map((stat, index) => (
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
        {/* Campaign Performance Table */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
                Campaign Performance
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Campaign</TableCell>
                      <TableCell align="right">Impressions</TableCell>
                      <TableCell align="right">Clicks</TableCell>
                      <TableCell align="right">CTR</TableCell>
                      <TableCell align="right">Conversions</TableCell>
                      <TableCell align="right">Spend</TableCell>
                      <TableCell align="right">ROAS</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockCampaignPerformance.map((campaign) => (
                      <TableRow key={campaign.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {campaign.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ID: {campaign.id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(campaign.impressions)}
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(campaign.clicks)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            color={campaign.ctr >= 3 ? 'success.main' : 'text.primary'}
                            sx={{ fontWeight: 'medium' }}
                          >
                            {campaign.ctr}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {campaign.conversions.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(campaign.spend)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            color={campaign.roas >= 4 ? 'success.main' : 'text.primary'}
                            sx={{ fontWeight: 'bold' }}
                          >
                            {campaign.roas}x
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={campaign.status}
                            size="small"
                            color={getStatusColor(campaign.status)}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Creatives */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
                Top Performing Creatives
              </Typography>
              
              <Stack spacing={2}>
                {mockTopCreatives.map((creative, index) => (
                  <Box
                    key={creative.id}
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
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                          {creative.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {creative.campaign}
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary">
                              CTR
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'success.main' }}>
                              {creative.ctr}%
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary">
                              Conversions
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {creative.conversions}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Trends Chart Placeholder */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
                Performance Trends
              </Typography>
              <Box
                sx={{
                  height: 300,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
                    Interactive Charts Coming Soon
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Advanced time-series charts with drill-down capabilities
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
