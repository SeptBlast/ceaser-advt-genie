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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  CreditCard,
  Receipt,
  Warning,
  CheckCircle,
  Schedule,
  Error,
  Visibility,
  EmailOutlined,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface BillingRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'failed';
  billingPeriod: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod: string;
  plan: string;
  usage: {
    apiCalls: number;
    storage: number;
    users: number;
  };
  discount?: number;
  tax: number;
  createdAt: string;
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurring: number;
  pendingAmount: number;
  overdueAmount: number;
  growthRate: number;
  churnRate: number;
  avgRevenuePerTenant: number;
  outstandingInvoices: number;
}

const BillingManagementPage: React.FC = () => {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([
    {
      id: '1',
      tenantId: '1',
      tenantName: 'Acme Corporation',
      invoiceNumber: 'INV-2024-001',
      amount: 2500,
      currency: 'USD',
      status: 'paid',
      billingPeriod: 'January 2024',
      dueDate: '2024-01-31',
      paidDate: '2024-01-28',
      paymentMethod: 'Credit Card',
      plan: 'Enterprise',
      usage: { apiCalls: 8400, storage: 120, users: 45 },
      tax: 225,
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      tenantId: '3',
      tenantName: 'Global Marketing Solutions',
      invoiceNumber: 'INV-2024-002',
      amount: 599,
      currency: 'USD',
      status: 'paid',
      billingPeriod: 'January 2024',
      dueDate: '2024-01-31',
      paidDate: '2024-01-30',
      paymentMethod: 'Bank Transfer',
      plan: 'Pro',
      usage: { apiCalls: 7800, storage: 78, users: 23 },
      tax: 53.91,
      createdAt: '2024-01-01',
    },
    {
      id: '3',
      tenantId: '4',
      tenantName: 'StartupXYZ',
      invoiceNumber: 'INV-2024-003',
      amount: 99,
      currency: 'USD',
      status: 'overdue',
      billingPeriod: 'January 2024',
      dueDate: '2024-01-31',
      paymentMethod: 'Credit Card',
      plan: 'Starter',
      usage: { apiCalls: 150, storage: 2, users: 3 },
      tax: 8.91,
      createdAt: '2024-01-01',
    },
    {
      id: '4',
      tenantId: '1',
      tenantName: 'Acme Corporation',
      invoiceNumber: 'INV-2024-004',
      amount: 2500,
      currency: 'USD',
      status: 'pending',
      billingPeriod: 'February 2024',
      dueDate: '2024-02-29',
      paymentMethod: 'Credit Card',
      plan: 'Enterprise',
      usage: { apiCalls: 9200, storage: 135, users: 48 },
      tax: 225,
      createdAt: '2024-02-01',
    },
  ]);

  const [metrics] = useState<RevenueMetrics>({
    totalRevenue: 156780,
    monthlyRecurring: 12450,
    pendingAmount: 2599,
    overdueAmount: 99,
    growthRate: 12.5,
    churnRate: 2.1,
    avgRevenuePerTenant: 845,
    outstandingInvoices: 2,
  });

  const [filteredRecords, setFilteredRecords] = useState<BillingRecord[]>(billingRecords);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [filters, setFilters] = useState({
    status: 'all',
    plan: 'all',
    search: '',
  });

  useEffect(() => {
    applyFilters();
  }, [filters, billingRecords, startDate, endDate]);

  const applyFilters = () => {
    let filtered = billingRecords;

    if (filters.search) {
      filtered = filtered.filter(record =>
        record.tenantName.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.invoiceNumber.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(record => record.status === filters.status);
    }

    if (filters.plan !== 'all') {
      filtered = filtered.filter(record => record.plan.toLowerCase() === filters.plan);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    setFilteredRecords(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle />;
      case 'pending': return <Schedule />;
      case 'overdue': return <Warning />;
      case 'failed': return <Error />;
      default: return <Schedule />;
    }
  };

  const handleSendReminder = async (recordId: string) => {
    setLoading(true);
    // Simulate API call to send reminder email
    console.log(`Sending reminder for invoice ${recordId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    // Show success message
  };

  const handleMarkAsPaid = async (recordId: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setBillingRecords(prev => prev.map(record =>
      record.id === recordId
        ? { ...record, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] }
        : record
    ));
    setLoading(false);
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    trend?: number;
  }> = ({ title, value, icon, color = 'primary', trend }) => (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
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
          {trend !== undefined && (
            <Stack alignItems="center">
              {trend > 0 ? (
                <TrendingUp color="success" />
              ) : (
                <TrendingDown color="error" />
              )}
              <Typography
                variant="caption"
                color={trend > 0 ? 'success.main' : 'error.main'}
                fontWeight="bold"
              >
                {trend > 0 ? '+' : ''}{trend}%
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Global Billing Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Platform-wide billing, invoices, and revenue management across all tenants
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Download />}>
              Export Data
            </Button>
            <Button variant="contained" startIcon={<Receipt />}>
              Generate Report
            </Button>
          </Stack>
        </Stack>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Revenue Metrics */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Revenue"
              value={`$${metrics.totalRevenue.toLocaleString()}`}
              icon={<MonetizationOn />}
              color="success"
              trend={metrics.growthRate}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Monthly Recurring"
              value={`$${metrics.monthlyRecurring.toLocaleString()}`}
              icon={<TrendingUp />}
              color="primary"
              trend={8.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Pending Amount"
              value={`$${metrics.pendingAmount.toLocaleString()}`}
              icon={<Schedule />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Overdue Amount"
              value={`$${metrics.overdueAmount.toLocaleString()}`}
              icon={<Warning />}
              color="error"
            />
          </Grid>
        </Grid>

        {/* Additional Metrics */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Avg Revenue/Tenant"
              value={`$${metrics.avgRevenuePerTenant}`}
              icon={<CreditCard />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Outstanding Invoices"
              value={metrics.outstandingInvoices}
              icon={<Receipt />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Growth Rate"
              value={`${metrics.growthRate}%`}
              icon={<TrendingUp />}
              color="success"
              trend={metrics.growthRate}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Churn Rate"
              value={`${metrics.churnRate}%`}
              icon={<TrendingDown />}
              color="error"
              trend={-metrics.churnRate}
            />
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search invoices..."
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
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
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
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => {
                    setFilters({ status: 'all', plan: 'all', search: '' });
                    setStartDate(null);
                    setEndDate(null);
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Billing Records Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Billing Period</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((record) => (
                    <TableRow
                      key={record.id}
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell>
                        <Stack>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {record.invoiceNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(record.createdAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {record.tenantName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2" fontWeight="bold">
                            ${record.amount.toLocaleString()} {record.currency}
                          </Typography>
                          {record.tax > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Tax: ${record.tax}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={getStatusColor(record.status) as any}
                          size="small"
                          icon={getStatusIcon(record.status)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.billingPeriod}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">
                            {new Date(record.dueDate).toLocaleDateString()}
                          </Typography>
                          {record.paidDate && (
                            <Typography variant="caption" color="success.main">
                              Paid: {new Date(record.paidDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.paymentMethod}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.plan}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Invoice">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRecord(record);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {record.status === 'pending' || record.status === 'overdue' ? (
                            <>
                              <Tooltip title="Send Reminder">
                                <IconButton
                                  size="small"
                                  onClick={() => handleSendReminder(record.id)}
                                >
                                  <EmailOutlined />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Mark as Paid">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleMarkAsPaid(record.id)}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : null}
                          <Tooltip title="Download">
                            <IconButton size="small">
                              <Download />
                            </IconButton>
                          </Tooltip>
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
            count={filteredRecords.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {/* Invoice Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Invoice Details - {selectedRecord?.invoiceNumber}
          </DialogTitle>
          <DialogContent>
            {selectedRecord && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Billing Information
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Tenant
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {selectedRecord.tenantName}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Plan
                          </Typography>
                          <Typography variant="body2">
                            {selectedRecord.plan}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Billing Period
                          </Typography>
                          <Typography variant="body2">
                            {selectedRecord.billingPeriod}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Payment Method
                          </Typography>
                          <Typography variant="body2">
                            {selectedRecord.paymentMethod}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Usage Details
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            API Calls
                          </Typography>
                          <Typography variant="body2">
                            {selectedRecord.usage.apiCalls.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Storage Used
                          </Typography>
                          <Typography variant="body2">
                            {selectedRecord.usage.storage} GB
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Active Users
                          </Typography>
                          <Typography variant="body2">
                            {selectedRecord.usage.users}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Payment Summary
                      </Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Subtotal:</Typography>
                          <Typography>
                            ${(selectedRecord.amount - selectedRecord.tax).toFixed(2)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Tax:</Typography>
                          <Typography>${selectedRecord.tax.toFixed(2)}</Typography>
                        </Stack>
                        <Divider />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="h6">Total:</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            ${selectedRecord.amount.toFixed(2)} {selectedRecord.currency}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button variant="contained" startIcon={<Download />}>
              Download Invoice
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default BillingManagementPage;
