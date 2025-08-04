import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  CreditCard,
  Download,
  Upgrade,
  CheckCircle,
  Storage,
  Api,
  Campaign,
  Psychology,
} from '@mui/icons-material';
import { useAppStore } from '../store/appStore';
import dayjs from 'dayjs';

const BillingPage: React.FC = () => {
  const theme = useTheme();
  const { 
    subscription, 
    usage,
    loading, 
    fetchSubscription,
    fetchUsage,
    updateSubscription 
  } = useAppStore();

  const [upgradeDialogOpen, setUpgradeDialogOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState('');

  React.useEffect(() => {
    fetchSubscription();
    fetchUsage();
  }, [fetchSubscription, fetchUsage]);

  // Mock data for demonstration
  const mockSubscription = {
    id: 'sub_1234567890',
    planId: 'pro_monthly',
    planName: 'Professional',
    status: 'active',
    currentPeriodStart: '2024-07-01T00:00:00Z',
    currentPeriodEnd: '2024-08-01T00:00:00Z',
    nextBillingDate: '2024-08-01T00:00:00Z',
    amount: 199,
    currency: 'USD',
    features: [
      'Unlimited campaigns',
      '1,000 AI-generated creatives/month',
      'Advanced analytics',
      'Priority support',
      'API access',
    ],
    limits: {
      campaignsPerMonth: -1, // unlimited
      creativesPerCampaign: 100,
      apiCallsPerMonth: 10000,
      storageGB: 100,
    },
  };

  const mockUsage = {
    billingPeriod: {
      start: '2024-07-01T00:00:00Z',
      end: '2024-08-01T00:00:00Z',
    },
    usage: {
      campaignsCreated: 24,
      creativesGenerated: 756,
      apiCallsMade: 3420,
      storageUsedGB: 12.5,
    },
    limits: {
      campaignsPerMonth: -1,
      creativesPerCampaign: 100,
      apiCallsPerMonth: 10000,
      storageGB: 100,
    },
    overage: {
      campaigns: 0,
      creatives: 0,
      apiCalls: 0,
      storageGB: 0,
    },
  };

  const mockInvoices = [
    {
      id: 'inv_001',
      invoiceNumber: 'AG-2024-07-001',
      status: 'paid',
      amount: 199,
      currency: 'USD',
      billingPeriod: {
        start: '2024-07-01T00:00:00Z',
        end: '2024-08-01T00:00:00Z',
      },
      dueDate: '2024-08-01T00:00:00Z',
      paidAt: '2024-07-28T14:30:00Z',
      items: [
        {
          description: 'Professional Plan - July 2024',
          quantity: 1,
          unitPrice: 199,
          totalPrice: 199,
        },
      ],
    },
    {
      id: 'inv_002',
      invoiceNumber: 'AG-2024-06-001',
      status: 'paid',
      amount: 199,
      currency: 'USD',
      billingPeriod: {
        start: '2024-06-01T00:00:00Z',
        end: '2024-07-01T00:00:00Z',
      },
      dueDate: '2024-07-01T00:00:00Z',
      paidAt: '2024-06-28T10:15:00Z',
      items: [
        {
          description: 'Professional Plan - June 2024',
          quantity: 1,
          unitPrice: 199,
          totalPrice: 199,
        },
      ],
    },
  ];

  const availablePlans = [
    {
      id: 'starter_monthly',
      name: 'Starter',
      price: 49,
      interval: 'month',
      features: [
        '10 campaigns/month',
        '100 AI creatives/month',
        'Basic analytics',
        'Email support',
      ],
      limits: {
        campaignsPerMonth: 10,
        creativesPerCampaign: 10,
        apiCallsPerMonth: 1000,
        storageGB: 10,
      },
    },
    {
      id: 'pro_monthly',
      name: 'Professional',
      price: 199,
      interval: 'month',
      features: [
        'Unlimited campaigns',
        '1,000 AI creatives/month',
        'Advanced analytics',
        'Priority support',
        'API access',
      ],
      limits: {
        campaignsPerMonth: -1,
        creativesPerCampaign: 100,
        apiCallsPerMonth: 10000,
        storageGB: 100,
      },
      popular: true,
    },
    {
      id: 'enterprise_monthly',
      name: 'Enterprise',
      price: 499,
      interval: 'month',
      features: [
        'Unlimited everything',
        'Custom AI models',
        'White-label solution',
        'Dedicated support',
        'Custom integrations',
      ],
      limits: {
        campaignsPerMonth: -1,
        creativesPerCampaign: -1,
        apiCallsPerMonth: -1,
        storageGB: -1,
      },
    },
  ];

  const currentData = subscription || mockSubscription;
  const usageData = usage || mockUsage;

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'past_due':
        return 'error';
      case 'canceled':
        return 'default';
      case 'trialing':
        return 'info';
      default:
        return 'default';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'open':
        return 'warning';
      case 'void':
        return 'default';
      case 'uncollectible':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'primary';
  };

  const handleUpgrade = async () => {
    if (selectedPlan) {
      try {
        await updateSubscription(selectedPlan);
        setUpgradeDialogOpen(false);
        setSelectedPlan('');
      } catch (error) {
        console.error('Failed to upgrade subscription:', error);
      }
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
            Billing & Subscription
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your subscription, usage, and billing information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Upgrade />}
          onClick={() => setUpgradeDialogOpen(true)}
        >
          Upgrade Plan
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Current Subscription */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), mr: 2 }}>
                  <CreditCard color="primary" />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {currentData.planName} Plan
                  </Typography>
                  <Chip
                    label={currentData.status}
                    size="small"
                    color={getStatusColor(currentData.status)}
                  />
                </Box>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(currentData.amount)}
                <Typography component="span" variant="body2" color="textSecondary">
                  /month
                </Typography>
              </Typography>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Next billing: {formatDate(currentData.nextBillingDate)}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Plan Features
              </Typography>
              <Stack spacing={1}>
                {currentData.features.map((feature, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle fontSize="small" color="success" />
                    <Typography variant="body2">{feature}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Usage Statistics */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Current Usage
              </Typography>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Billing period: {formatDate(usageData.billingPeriod.start)} - {formatDate(usageData.billingPeriod.end)}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Campaign fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Campaigns Created
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {usageData.usage.campaignsCreated}
                      {usageData.limits.campaignsPerMonth !== -1 && (
                        <Typography component="span" variant="body2" color="textSecondary">
                          / {usageData.limits.campaignsPerMonth}
                        </Typography>
                      )}
                    </Typography>
                    {usageData.limits.campaignsPerMonth !== -1 && (
                      <LinearProgress
                        variant="determinate"
                        value={getUsagePercentage(usageData.usage.campaignsCreated, usageData.limits.campaignsPerMonth)}
                        color={getUsageColor(getUsagePercentage(usageData.usage.campaignsCreated, usageData.limits.campaignsPerMonth))}
                      />
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Psychology fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        AI Creatives Generated
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {usageData.usage.creativesGenerated}
                      <Typography component="span" variant="body2" color="textSecondary">
                        / 1,000
                      </Typography>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getUsagePercentage(usageData.usage.creativesGenerated, 1000)}
                      color={getUsageColor(getUsagePercentage(usageData.usage.creativesGenerated, 1000))}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Api fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        API Calls
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {usageData.usage.apiCallsMade.toLocaleString()}
                      <Typography component="span" variant="body2" color="textSecondary">
                        / {usageData.limits.apiCallsPerMonth.toLocaleString()}
                      </Typography>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getUsagePercentage(usageData.usage.apiCallsMade, usageData.limits.apiCallsPerMonth)}
                      color={getUsageColor(getUsagePercentage(usageData.usage.apiCallsMade, usageData.limits.apiCallsPerMonth))}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Storage fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Storage Used
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {usageData.usage.storageUsedGB} GB
                      <Typography component="span" variant="body2" color="textSecondary">
                        / {usageData.limits.storageGB} GB
                      </Typography>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getUsagePercentage(usageData.usage.storageUsedGB, usageData.limits.storageGB)}
                      color={getUsageColor(getUsagePercentage(usageData.usage.storageUsedGB, usageData.limits.storageGB))}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Invoice History
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice</TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockInvoices.map((invoice) => (
                      <TableRow key={invoice.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {invoice.invoiceNumber}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Due: {formatDate(invoice.dueDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(invoice.billingPeriod.start)} - {formatDate(invoice.billingPeriod.end)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            size="small"
                            color={getInvoiceStatusColor(invoice.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<Download />}
                            onClick={() => {
                              // Handle download
                              console.log('Download invoice:', invoice.id);
                            }}
                          >
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upgrade Plan Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Choose Your Plan</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {availablePlans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: 2,
                    borderColor: selectedPlan === plan.id ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1,
                      }}
                    />
                  )}
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                      {formatCurrency(plan.price)}
                      <Typography component="span" variant="body2" color="textSecondary">
                        /{plan.interval}
                      </Typography>
                    </Typography>
                    <Stack spacing={1} sx={{ textAlign: 'left' }}>
                      {plan.features.map((feature, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle fontSize="small" color="success" />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpgrade}
            disabled={!selectedPlan || loading.billing}
          >
            {loading.billing ? 'Processing...' : 'Update Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingPage;
