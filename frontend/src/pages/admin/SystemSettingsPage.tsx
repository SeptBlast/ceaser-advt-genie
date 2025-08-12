import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Save,
  Refresh,
  Security,
  Storage,
  Speed,
  Notifications,
  Email,
  Settings,
  Visibility,
  VisibilityOff,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    maintenanceMode: boolean;
    debugMode: boolean;
    allowRegistration: boolean;
  };
  api: {
    rateLimitPerMinute: number;
    maxRequestSize: number;
    enableCors: boolean;
    allowedOrigins: string;
  };
  storage: {
    maxFileSize: number;
    allowedFileTypes: string;
    storageQuotaPerTenant: number;
    enableCompression: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    enableSlackNotifications: boolean;
    slackWebhookUrl: string;
  };
  security: {
    passwordMinLength: number;
    requireTwoFactor: boolean;
    sessionTimeout: number;
    enableAuditLog: boolean;
    maxLoginAttempts: number;
  };
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  cache: 'healthy' | 'warning' | 'error';
  uptime: string;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
}

const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'CeaserAdGenius',
      siteUrl: 'https://app.ceaseradgenius.com',
      adminEmail: 'admin@ceaseradgenius.com',
      maintenanceMode: false,
      debugMode: false,
      allowRegistration: true,
    },
    api: {
      rateLimitPerMinute: 1000,
      maxRequestSize: 10,
      enableCors: true,
      allowedOrigins: 'https://ceaseradgenius.com',
    },
    storage: {
      maxFileSize: 100,
      allowedFileTypes: 'jpg,jpeg,png,gif,mp4,mov,avi',
      storageQuotaPerTenant: 1000,
      enableCompression: true,
    },
    notifications: {
      emailEnabled: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'notifications@ceaseradgenius.com',
      smtpPassword: '',
      enableSlackNotifications: false,
      slackWebhookUrl: '',
    },
    security: {
      passwordMinLength: 8,
      requireTwoFactor: false,
      sessionTimeout: 24,
      enableAuditLog: true,
      maxLoginAttempts: 5,
    },
  });

  const [systemHealth] = useState<SystemHealth>({
    database: 'healthy',
    storage: 'healthy',
    api: 'healthy',
    cache: 'warning',
    uptime: '15 days, 4 hours',
    memoryUsage: 68,
    diskUsage: 45,
    activeConnections: 234,
  });

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '2024-01-25T10:30:00Z',
      user: 'admin@ceaseradgenius.com',
      action: 'UPDATE_SETTINGS',
      resource: 'system_settings',
      details: 'Modified API rate limiting settings',
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      timestamp: '2024-01-25T09:15:00Z',
      user: 'admin@ceaseradgenius.com',
      action: 'CREATE_TENANT',
      resource: 'tenant',
      details: 'Created new tenant: StartupXYZ',
      ipAddress: '192.168.1.100',
    },
    {
      id: '3',
      timestamp: '2024-01-25T08:45:00Z',
      user: 'support@ceaseradgenius.com',
      action: 'RESOLVE_TICKET',
      resource: 'support_ticket',
      details: 'Resolved ticket SUP-2024-003',
      ipAddress: '192.168.1.101',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState('general');

  const handleSaveSettings = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    // Show success message
  };

  const handleTestEmail = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setTestEmailDialog(false);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      default: return <CheckCircle />;
    }
  };

  const HealthCard: React.FC<{
    title: string;
    status: 'healthy' | 'warning' | 'error';
    value?: string | number;
    subtitle?: string;
  }> = ({ title, status, value, subtitle }) => (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: `${getHealthColor(status)}.main`, color: 'white' }}>
            {getHealthIcon(status)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            <Chip
              label={status}
              color={getHealthColor(status) as any}
              size="small"
              sx={{ textTransform: 'capitalize', mb: 1 }}
            />
            {value && (
              <Typography variant="body2" color="text.secondary">
                {value}
              </Typography>
            )}
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

  const TabButton: React.FC<{ id: string; label: string; icon: React.ReactNode }> = ({
    id,
    label,
    icon,
  }) => (
    <Button
      variant={selectedTab === id ? 'contained' : 'outlined'}
      startIcon={icon}
      onClick={() => setSelectedTab(id)}
      sx={{ mb: 1 }}
    >
      {label}
    </Button>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Platform Configuration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure platform-wide settings, security, and system health monitoring
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Refresh />}>
            Refresh Status
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
            disabled={loading}
          >
            Save All Settings
          </Button>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* System Health Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            System Health
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <HealthCard
            title="Database"
            status={systemHealth.database}
            subtitle="Connection stable"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <HealthCard
            title="Storage"
            status={systemHealth.storage}
            value={`${systemHealth.diskUsage}% used`}
            subtitle="Firebase Storage"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <HealthCard
            title="API Gateway"
            status={systemHealth.api}
            value={`${systemHealth.activeConnections} active`}
            subtitle="Go service running"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <HealthCard
            title="Cache"
            status={systemHealth.cache}
            value={`${systemHealth.memoryUsage}% memory`}
            subtitle="Redis cache"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Settings Navigation */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Settings Categories
              </Typography>
              <Stack spacing={1}>
                <TabButton id="general" label="General" icon={<Settings />} />
                <TabButton id="api" label="API & Limits" icon={<Speed />} />
                <TabButton id="storage" label="Storage" icon={<Storage />} />
                <TabButton id="notifications" label="Notifications" icon={<Notifications />} />
                <TabButton id="security" label="Security" icon={<Security />} />
                <TabButton id="audit" label="Audit Logs" icon={<Visibility />} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings Content */}
        <Grid item xs={12} md={9}>
          {selectedTab === 'general' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  General Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Site Name"
                      value={settings.general.siteName}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, siteName: e.target.value },
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Site URL"
                      value={settings.general.siteUrl}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, siteUrl: e.target.value },
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Admin Email"
                      type="email"
                      value={settings.general.adminEmail}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, adminEmail: e.target.value },
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.general.maintenanceMode}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                general: { ...prev.general, maintenanceMode: e.target.checked },
                              }))
                            }
                          />
                        }
                        label="Maintenance Mode"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.general.debugMode}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                general: { ...prev.general, debugMode: e.target.checked },
                              }))
                            }
                          />
                        }
                        label="Debug Mode"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.general.allowRegistration}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                general: { ...prev.general, allowRegistration: e.target.checked },
                              }))
                            }
                          />
                        }
                        label="Allow New Registrations"
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {selectedTab === 'api' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  API & Rate Limiting
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Rate Limit (requests/minute)"
                      type="number"
                      value={settings.api.rateLimitPerMinute}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          api: { ...prev.api, rateLimitPerMinute: parseInt(e.target.value) },
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Max Request Size (MB)"
                      type="number"
                      value={settings.api.maxRequestSize}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          api: { ...prev.api, maxRequestSize: parseInt(e.target.value) },
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Allowed Origins (CORS)"
                      value={settings.api.allowedOrigins}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          api: { ...prev.api, allowedOrigins: e.target.value },
                        }))
                      }
                      helperText="Comma-separated list of allowed origins"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.api.enableCors}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              api: { ...prev.api, enableCors: e.target.checked },
                            }))
                          }
                        />
                      }
                      label="Enable CORS"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {selectedTab === 'storage' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Storage Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Max File Size (MB)"
                      type="number"
                      value={settings.storage.maxFileSize}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          storage: { ...prev.storage, maxFileSize: parseInt(e.target.value) },
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Storage Quota per Tenant (GB)"
                      type="number"
                      value={settings.storage.storageQuotaPerTenant}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          storage: {
                            ...prev.storage,
                            storageQuotaPerTenant: parseInt(e.target.value),
                          },
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Allowed File Types"
                      value={settings.storage.allowedFileTypes}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          storage: { ...prev.storage, allowedFileTypes: e.target.value },
                        }))
                      }
                      helperText="Comma-separated file extensions (e.g., jpg,png,mp4)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.storage.enableCompression}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              storage: { ...prev.storage, enableCompression: e.target.checked },
                            }))
                          }
                        />
                      }
                      label="Enable File Compression"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {selectedTab === 'notifications' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.emailEnabled}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                emailEnabled: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Enable Email Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Host"
                      value={settings.notifications.smtpHost}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, smtpHost: e.target.value },
                        }))
                      }
                      disabled={!settings.notifications.emailEnabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Port"
                      type="number"
                      value={settings.notifications.smtpPort}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            smtpPort: parseInt(e.target.value),
                          },
                        }))
                      }
                      disabled={!settings.notifications.emailEnabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP User"
                      value={settings.notifications.smtpUser}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, smtpUser: e.target.value },
                        }))
                      }
                      disabled={!settings.notifications.emailEnabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Password"
                      type={showPassword ? 'text' : 'password'}
                      value={settings.notifications.smtpPassword}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, smtpPassword: e.target.value },
                        }))
                      }
                      disabled={!settings.notifications.emailEnabled}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      startIcon={<Email />}
                      onClick={() => setTestEmailDialog(true)}
                      disabled={!settings.notifications.emailEnabled}
                    >
                      Test Email Configuration
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.enableSlackNotifications}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                enableSlackNotifications: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Enable Slack Notifications"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Slack Webhook URL"
                      value={settings.notifications.slackWebhookUrl}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            slackWebhookUrl: e.target.value,
                          },
                        }))
                      }
                      disabled={!settings.notifications.enableSlackNotifications}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {selectedTab === 'security' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Minimum Password Length"
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            passwordMinLength: parseInt(e.target.value),
                          },
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Session Timeout (hours)"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            sessionTimeout: parseInt(e.target.value),
                          },
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Max Login Attempts"
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            maxLoginAttempts: parseInt(e.target.value),
                          },
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.requireTwoFactor}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                security: {
                                  ...prev.security,
                                  requireTwoFactor: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Require Two-Factor Authentication"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.enableAuditLog}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                security: { ...prev.security, enableAuditLog: e.target.checked },
                              }))
                            }
                          />
                        }
                        label="Enable Audit Logging"
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {selectedTab === 'audit' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Audit Logs
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Resource</TableCell>
                        <TableCell>Details</TableCell>
                        <TableCell>IP Address</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(log.timestamp).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{log.user}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={log.action.replace('_', ' ')}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{log.resource}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {log.details}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {log.ipAddress}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Test Email Dialog */}
      <Dialog
        open={testEmailDialog}
        onClose={() => setTestEmailDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Test Email Configuration</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will send a test email to the admin email address to verify SMTP configuration.
          </Alert>
          <TextField
            fullWidth
            label="Test Email Address"
            value={settings.general.adminEmail}
            disabled
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleTestEmail} disabled={loading}>
            Send Test Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettingsPage;
