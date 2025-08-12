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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  Visibility,
  Edit,
  Reply,
  CheckCircle,
  Error,
  Warning,
  Info,
  Schedule,
  Person,
  Business,
  PriorityHigh,
  AccessTime,
  Assignment,
  Support,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature-request' | 'bug' | 'general';
  tenantId: string;
  tenantName: string;
  customerName: string;
  customerEmail: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  responses: TicketResponse[];
  tags: string[];
}

interface TicketResponse {
  id: string;
  author: string;
  authorType: 'customer' | 'support' | 'system';
  content: string;
  createdAt: string;
  attachments?: string[];
}

interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedToday: number;
  avgResponseTime: number; // hours
  avgResolutionTime: number; // hours
  customerSatisfaction: number; // percentage
  highPriorityTickets: number;
}

const SupportTicketsPage: React.FC = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      ticketNumber: 'SUP-2024-001',
      title: 'Unable to generate video ads',
      description: 'Getting error when trying to generate video advertisements for our campaign.',
      status: 'open',
      priority: 'high',
      category: 'technical',
      tenantId: '1',
      tenantName: 'Acme Corporation',
      customerName: 'John Smith',
      customerEmail: 'john.smith@acme.com',
      assignedTo: 'Sarah Johnson',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
      responses: [
        {
          id: '1',
          author: 'John Smith',
          authorType: 'customer',
          content: 'Getting error when trying to generate video advertisements for our campaign. The error message says "Processing failed". This is blocking our marketing campaign launch.',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          author: 'Sarah Johnson',
          authorType: 'support',
          content: 'Hi John, thank you for reaching out. I\'m looking into this issue. Could you please provide the specific campaign ID and the exact error message you\'re seeing?',
          createdAt: '2024-01-15T14:20:00Z',
        },
      ],
      tags: ['video-generation', 'error', 'campaign'],
    },
    {
      id: '2',
      ticketNumber: 'SUP-2024-002',
      title: 'Billing discrepancy in January invoice',
      description: 'The usage shown in the invoice doesn\'t match our records.',
      status: 'in-progress',
      priority: 'medium',
      category: 'billing',
      tenantId: '3',
      tenantName: 'Global Marketing Solutions',
      customerName: 'Emma Wilson',
      customerEmail: 'emma.wilson@globalmarketing.com',
      assignedTo: 'Mike Rodriguez',
      createdAt: '2024-01-20T09:15:00Z',
      updatedAt: '2024-01-20T16:45:00Z',
      responses: [
        {
          id: '1',
          author: 'Emma Wilson',
          authorType: 'customer',
          content: 'Hi, I noticed that our January invoice shows 7,800 API calls, but according to our internal tracking, we only made around 6,500 calls. Could you help clarify this discrepancy?',
          createdAt: '2024-01-20T09:15:00Z',
        },
        {
          id: '2',
          author: 'Mike Rodriguez',
          authorType: 'support',
          content: 'Hello Emma, I\'m reviewing your account usage for January. Let me pull the detailed logs and get back to you with a breakdown.',
          createdAt: '2024-01-20T16:45:00Z',
        },
      ],
      tags: ['billing', 'usage', 'invoice'],
    },
    {
      id: '3',
      ticketNumber: 'SUP-2024-003',
      title: 'Feature request: Custom brand colors',
      description: 'Would like to add custom brand colors to generated content.',
      status: 'resolved',
      priority: 'low',
      category: 'feature-request',
      tenantId: '2',
      tenantName: 'TechStart Inc',
      customerName: 'David Chen',
      customerEmail: 'david.chen@techstart.com',
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-22T11:30:00Z',
      resolvedAt: '2024-01-22T11:30:00Z',
      responses: [
        {
          id: '1',
          author: 'David Chen',
          authorType: 'customer',
          content: 'It would be great if we could specify our brand colors in the AI generation process to maintain brand consistency.',
          createdAt: '2024-01-10T14:20:00Z',
        },
        {
          id: '2',
          author: 'System',
          authorType: 'system',
          content: 'This feature request has been added to our product roadmap for Q2 2024.',
          createdAt: '2024-01-22T11:30:00Z',
        },
      ],
      tags: ['feature-request', 'branding', 'customization'],
    },
    {
      id: '4',
      ticketNumber: 'SUP-2024-004',
      title: 'API rate limit exceeded error',
      description: 'Getting rate limit errors despite being under our plan limits.',
      status: 'open',
      priority: 'urgent',
      category: 'technical',
      tenantId: '4',
      tenantName: 'StartupXYZ',
      customerName: 'Lisa Park',
      customerEmail: 'lisa.park@startupxyz.com',
      createdAt: '2024-01-25T08:00:00Z',
      updatedAt: '2024-01-25T08:00:00Z',
      responses: [
        {
          id: '1',
          author: 'Lisa Park',
          authorType: 'customer',
          content: 'We\'re getting "Rate limit exceeded" errors when making API calls, but our dashboard shows we\'re only at 15% of our monthly limit. This is urgent as it\'s affecting our production service.',
          createdAt: '2024-01-25T08:00:00Z',
        },
      ],
      tags: ['api', 'rate-limit', 'urgent', 'production'],
    },
  ]);

  const [metrics] = useState<SupportMetrics>({
    totalTickets: 847,
    openTickets: 23,
    inProgressTickets: 15,
    resolvedToday: 8,
    avgResponseTime: 2.5,
    avgResolutionTime: 18.2,
    customerSatisfaction: 94.5,
    highPriorityTickets: 4,
  });

  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>(tickets);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignee: 'all',
    search: '',
  });

  useEffect(() => {
    applyFilters();
  }, [filters, tickets]);

  const applyFilters = () => {
    let filtered = tickets;

    if (filters.search) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.tenantName.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === filters.category);
    }

    if (filters.assignee !== 'all') {
      filtered = filtered.filter(ticket => ticket.assignedTo === filters.assignee);
    }

    setFilteredTickets(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Error />;
      case 'billing': return <Error />;
      case 'feature-request': return <Info />;
      case 'bug': return <Warning />;
      case 'general': return <Info />;
      default: return <Info />;
    }
  };

  const handleAssignTicket = async (ticketId: string, assignee: string) => {
    setLoading(true);
    console.log(`Assigning ticket ${ticketId} to ${assignee}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, assignedTo: assignee, updatedAt: new Date().toISOString() }
        : ticket
    ));
    setLoading(false);
  };

  const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : ticket.resolvedAt,
          }
        : ticket
    ));
    setLoading(false);
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
  }> = ({ title, value, icon, color = 'primary', subtitle }) => (
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
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
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
            Global Support Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Platform-wide customer support ticket management and resolution tracking
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/support/new')}
        >
          Create Ticket
        </Button>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Support Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Tickets"
            value={metrics.totalTickets}
            icon={<Support />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Open Tickets"
            value={metrics.openTickets}
            icon={<Error />}
            color="error"
            subtitle="Needs attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="In Progress"
            value={metrics.inProgressTickets}
            icon={<Schedule />}
            color="warning"
            subtitle="Being worked on"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Resolved Today"
            value={metrics.resolvedToday}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Response Time"
            value={`${metrics.avgResponseTime}h`}
            icon={<AccessTime />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Resolution Time"
            value={`${metrics.avgResolutionTime}h`}
            icon={<Assignment />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Customer Satisfaction"
            value={`${metrics.customerSatisfaction}%`}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="High Priority"
            value={metrics.highPriorityTickets}
            icon={<PriorityHigh />}
            color="error"
            subtitle="Urgent attention needed"
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
                placeholder="Search tickets..."
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
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="technical">Technical</MenuItem>
                  <MenuItem value="billing">Billing</MenuItem>
                  <MenuItem value="feature-request">Feature Request</MenuItem>
                  <MenuItem value="bug">Bug</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={filters.assignee}
                  label="Assignee"
                  onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                >
                  <MenuItem value="all">All Assignees</MenuItem>
                  <MenuItem value="Sarah Johnson">Sarah Johnson</MenuItem>
                  <MenuItem value="Mike Rodriguez">Mike Rodriguez</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilters({
                  status: 'all',
                  priority: 'all',
                  category: 'all',
                  assignee: 'all',
                  search: '',
                })}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticket</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Update</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {ticket.ticketNumber}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 200,
                          }}
                        >
                          {ticket.title}
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                          {ticket.tags.slice(0, 2).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 16 }}
                            />
                          ))}
                          {ticket.tags.length > 2 && (
                            <Chip
                              label={`+${ticket.tags.length - 2}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 16 }}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2" fontWeight="medium">
                          {ticket.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ticket.tenantName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ticket.customerEmail}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status}
                        color={getStatusColor(ticket.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.priority}
                        color={getPriorityColor(ticket.priority) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                        icon={ticket.priority === 'urgent' ? <PriorityHigh /> : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getCategoryIcon(ticket.category)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {ticket.category.replace('-', ' ')}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {ticket.assignedTo ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                            {ticket.assignedTo.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Typography variant="body2">
                            {ticket.assignedTo}
                          </Typography>
                        </Stack>
                      ) : (
                        <Chip label="Unassigned" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(ticket.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(ticket.updatedAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/support/${ticket.id}/edit`)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reply">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/support/${ticket.id}/reply`)}
                          >
                            <Badge
                              badgeContent={ticket.responses.length}
                              color="primary"
                              max={99}
                            >
                              <Reply />
                            </Badge>
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
          count={filteredTickets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                {selectedTicket?.ticketNumber} - {selectedTicket?.title}
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip
                  label={selectedTicket?.status}
                  color={getStatusColor(selectedTicket?.status || '') as any}
                  size="small"
                />
                <Chip
                  label={selectedTicket?.priority}
                  color={getPriorityColor(selectedTicket?.priority || '') as any}
                  size="small"
                />
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => selectedTicket && handleStatusChange(selectedTicket.id, 'in-progress')}
                disabled={selectedTicket?.status === 'in-progress'}
              >
                Mark In Progress
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => selectedTicket && handleStatusChange(selectedTicket.id, 'resolved')}
                disabled={selectedTicket?.status === 'resolved'}
              >
                Mark Resolved
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTicket.description}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Conversation ({selectedTicket.responses.length})
                  </Typography>
                  <List>
                    {selectedTicket.responses.map((response, index) => (
                      <React.Fragment key={response.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor:
                                  response.authorType === 'customer'
                                    ? 'primary.main'
                                    : response.authorType === 'support'
                                    ? 'secondary.main'
                                    : 'grey.500',
                              }}
                            >
                              {response.authorType === 'customer' ? (
                                <Person />
                              ) : response.authorType === 'support' ? (
                                <Support />
                              ) : (
                                <Business />
                              )}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {response.author}
                                </Typography>
                                <Chip
                                  label={response.authorType}
                                  size="small"
                                  variant="outlined"
                                  sx={{ textTransform: 'capitalize' }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(response.createdAt).toLocaleString()}
                                </Typography>
                              </Stack>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {response.content}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < selectedTicket.responses.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Ticket Details
                    </Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Customer
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {selectedTicket.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedTicket.customerEmail}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Tenant
                        </Typography>
                        <Typography variant="body2">
                          {selectedTicket.tenantName}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {selectedTicket.category.replace('-', ' ')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Assigned To
                        </Typography>
                        <Typography variant="body2">
                          {selectedTicket.assignedTo || 'Unassigned'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body2">
                          {new Date(selectedTicket.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      {selectedTicket.resolvedAt && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Resolved
                          </Typography>
                          <Typography variant="body2">
                            {new Date(selectedTicket.resolvedAt).toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Tags
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {selectedTicket.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<Reply />}
            onClick={() => {
              if (selectedTicket) {
                navigate(`/admin/support/${selectedTicket.id}/reply`);
              }
            }}
          >
            Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportTicketsPage;
