import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  useTheme,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
} from '@mui/material';
import {
  AccountCircle,
  Business,
  Security,
  Notifications,
  Palette,
  Api,
  Edit,
  Delete,
  Add,
  Save,
  Lock,
  Key,
  Email,
  Sms,
  Web,
} from '@mui/icons-material';
import { useAppStore } from '../store/appStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const { tenantContext, setTenantContext } = useAppStore();

  const [activeTab, setActiveTab] = React.useState(0);
  const [showPassword, setShowPassword] = React.useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = React.useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = React.useState(false);

  // Mock settings data
  const [settings, setSettings] = React.useState({
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@acme-corp.com',
      avatar: '',
      role: 'Admin',
      timezone: 'America/New_York',
      language: 'en',
    },
    tenant: {
      name: 'Acme Corporation',
      domain: 'acme-corp',
      industry: 'Technology',
      size: '50-200',
      website: 'https://acme-corp.com',
    },
    notifications: {
      emailCampaignUpdates: true,
      emailPerformanceReports: true,
      emailBillingAlerts: true,
      pushCampaignUpdates: false,
      pushPerformanceAlerts: true,
      smsUrgentAlerts: false,
    },
    preferences: {
      darkMode: false,
      autoSave: true,
      showAdvancedFeatures: true,
      defaultCampaignBudget: 1000,
      defaultCreativeType: 'image',
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 8,
      allowApiAccess: true,
      ipWhitelist: [],
    },
  });

  const [apiKeys] = React.useState([
    {
      id: 'ak_001',
      name: 'Production API Key',
      lastUsed: '2024-07-30T14:30:00Z',
      created: '2024-06-15T09:00:00Z',
      permissions: ['campaigns:read', 'campaigns:write', 'creatives:read', 'creatives:write'],
    },
    {
      id: 'ak_002',
      name: 'Analytics Dashboard',
      lastUsed: '2024-07-29T16:45:00Z',
      created: '2024-07-01T10:30:00Z',
      permissions: ['campaigns:read', 'analytics:read'],
    },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // Here you would save settings to the backend
    console.log('Saving settings:', settings);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
          Settings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your account, preferences, and integrations
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Settings Navigation */}
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 0 }}>
              <Tabs
                orientation="vertical"
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    py: 2,
                    px: 3,
                  },
                }}
              >
                <Tab
                  icon={<AccountCircle />}
                  iconPosition="start"
                  label="Profile"
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab
                  icon={<Business />}
                  iconPosition="start"
                  label="Organization"
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab
                  icon={<Notifications />}
                  iconPosition="start"
                  label="Notifications"
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab
                  icon={<Palette />}
                  iconPosition="start"
                  label="Preferences"
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab
                  icon={<Security />}
                  iconPosition="start"
                  label="Security"
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab
                  icon={<Api />}
                  iconPosition="start"
                  label="API Keys"
                  sx={{ justifyContent: 'flex-start' }}
                />
              </Tabs>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings Content */}
        <Grid item xs={12} md={9}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              {/* Profile Settings */}
              <TabPanel value={activeTab} index={0}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Profile Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{ width: 80, height: 80, mr: 3 }}
                        src={settings.profile.avatar}
                      >
                        <AccountCircle sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {settings.profile.firstName} {settings.profile.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {settings.profile.role}
                        </Typography>
                        <Button size="small" sx={{ mt: 1 }}>
                          Change Photo
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={settings.profile.firstName}
                      onChange={(e) => handleSettingChange('profile', 'firstName', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={settings.profile.lastName}
                      onChange={(e) => handleSettingChange('profile', 'lastName', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={settings.profile.timezone}
                        onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
                        label="Timezone"
                      >
                        <MenuItem value="America/New_York">Eastern Time</MenuItem>
                        <MenuItem value="America/Chicago">Central Time</MenuItem>
                        <MenuItem value="America/Denver">Mountain Time</MenuItem>
                        <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                        <MenuItem value="UTC">UTC</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={settings.profile.language}
                        onChange={(e) => handleSettingChange('profile', 'language', e.target.value)}
                        label="Language"
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                        <MenuItem value="de">German</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Organization Settings */}
              <TabPanel value={activeTab} index={1}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Organization Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Organization Name"
                      value={settings.tenant.name}
                      onChange={(e) => handleSettingChange('tenant', 'name', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Domain"
                      value={settings.tenant.domain}
                      onChange={(e) => handleSettingChange('tenant', 'domain', e.target.value)}
                      helperText="Used for API calls and tenant identification"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={settings.tenant.website}
                      onChange={(e) => handleSettingChange('tenant', 'website', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Industry</InputLabel>
                      <Select
                        value={settings.tenant.industry}
                        onChange={(e) => handleSettingChange('tenant', 'industry', e.target.value)}
                        label="Industry"
                      >
                        <MenuItem value="Technology">Technology</MenuItem>
                        <MenuItem value="Healthcare">Healthcare</MenuItem>
                        <MenuItem value="Finance">Finance</MenuItem>
                        <MenuItem value="Retail">Retail</MenuItem>
                        <MenuItem value="Education">Education</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Company Size</InputLabel>
                      <Select
                        value={settings.tenant.size}
                        onChange={(e) => handleSettingChange('tenant', 'size', e.target.value)}
                        label="Company Size"
                      >
                        <MenuItem value="1-10">1-10 employees</MenuItem>
                        <MenuItem value="11-50">11-50 employees</MenuItem>
                        <MenuItem value="51-200">51-200 employees</MenuItem>
                        <MenuItem value="201-1000">201-1000 employees</MenuItem>
                        <MenuItem value="1000+">1000+ employees</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Notification Settings */}
              <TabPanel value={activeTab} index={2}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Notification Preferences
                </Typography>
                
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1 }} />
                      Email Notifications
                    </Typography>
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.emailCampaignUpdates}
                            onChange={(e) => handleSettingChange('notifications', 'emailCampaignUpdates', e.target.checked)}
                          />
                        }
                        label="Campaign status updates"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.emailPerformanceReports}
                            onChange={(e) => handleSettingChange('notifications', 'emailPerformanceReports', e.target.checked)}
                          />
                        }
                        label="Weekly performance reports"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.emailBillingAlerts}
                            onChange={(e) => handleSettingChange('notifications', 'emailBillingAlerts', e.target.checked)}
                          />
                        }
                        label="Billing and payment alerts"
                      />
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <Web sx={{ mr: 1 }} />
                      Push Notifications
                    </Typography>
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.pushCampaignUpdates}
                            onChange={(e) => handleSettingChange('notifications', 'pushCampaignUpdates', e.target.checked)}
                          />
                        }
                        label="Campaign updates"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.pushPerformanceAlerts}
                            onChange={(e) => handleSettingChange('notifications', 'pushPerformanceAlerts', e.target.checked)}
                          />
                        }
                        label="Performance alerts"
                      />
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <Sms sx={{ mr: 1 }} />
                      SMS Notifications
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.smsUrgentAlerts}
                          onChange={(e) => handleSettingChange('notifications', 'smsUrgentAlerts', e.target.checked)}
                        />
                      }
                      label="Urgent alerts only"
                    />
                  </Box>
                </Stack>
              </TabPanel>

              {/* Preferences */}
              <TabPanel value={activeTab} index={3}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Application Preferences
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.preferences.darkMode}
                          onChange={(e) => handleSettingChange('preferences', 'darkMode', e.target.checked)}
                        />
                      }
                      label="Dark mode"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.preferences.autoSave}
                          onChange={(e) => handleSettingChange('preferences', 'autoSave', e.target.checked)}
                        />
                      }
                      label="Auto-save campaigns and creatives"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.preferences.showAdvancedFeatures}
                          onChange={(e) => handleSettingChange('preferences', 'showAdvancedFeatures', e.target.checked)}
                        />
                      }
                      label="Show advanced features"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Default Campaign Budget"
                      type="number"
                      value={settings.preferences.defaultCampaignBudget}
                      onChange={(e) => handleSettingChange('preferences', 'defaultCampaignBudget', parseInt(e.target.value))}
                      InputProps={{
                        startAdornment: '$',
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Default Creative Type</InputLabel>
                      <Select
                        value={settings.preferences.defaultCreativeType}
                        onChange={(e) => handleSettingChange('preferences', 'defaultCreativeType', e.target.value)}
                        label="Default Creative Type"
                      >
                        <MenuItem value="image">Image</MenuItem>
                        <MenuItem value="video">Video</MenuItem>
                        <MenuItem value="carousel">Carousel</MenuItem>
                        <MenuItem value="text">Text</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Security Settings */}
              <TabPanel value={activeTab} index={4}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Security Settings
                </Typography>
                
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Two-Factor Authentication
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.twoFactorEnabled}
                          onChange={(e) => handleSettingChange('security', 'twoFactorEnabled', e.target.checked)}
                        />
                      }
                      label="Enable two-factor authentication"
                    />
                    {settings.security.twoFactorEnabled && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Two-factor authentication is enabled for your account.
                      </Alert>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Session Management
                    </Typography>
                    <TextField
                      label="Session Timeout (hours)"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      sx={{ width: 200 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                      API Access
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.allowApiAccess}
                          onChange={(e) => handleSettingChange('security', 'allowApiAccess', e.target.checked)}
                        />
                      }
                      label="Allow API access to this account"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Password
                    </Typography>
                    <Button variant="outlined" startIcon={<Lock />}>
                      Change Password
                    </Button>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: 'error.main' }}>
                      Danger Zone
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setDeleteAccountDialogOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </Box>
                </Stack>
              </TabPanel>

              {/* API Keys */}
              <TabPanel value={activeTab} index={5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    API Keys
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setApiKeyDialogOpen(true)}
                  >
                    Create API Key
                  </Button>
                </Box>

                <List>
                  {apiKeys.map((apiKey) => (
                    <React.Fragment key={apiKey.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Key />
                        </ListItemIcon>
                        <ListItemText
                          primary={apiKey.name}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Created: {formatDate(apiKey.created)}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Last used: {formatDate(apiKey.lastUsed)}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                {apiKey.permissions.map((permission) => (
                                  <Chip
                                    key={permission}
                                    label={permission}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => {}}>
                            <Edit />
                          </IconButton>
                          <IconButton edge="end" onClick={() => {}}>
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>

              {/* Save Button */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  size="large"
                >
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onClose={() => setApiKeyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="API Key Name"
            sx={{ mt: 2, mb: 3 }}
            placeholder="e.g., Production Integration"
          />
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Permissions
          </Typography>
          {/* Add permission checkboxes here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create API Key</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountDialogOpen} onClose={() => setDeleteAccountDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete your account? Type "DELETE" to confirm.
          </Typography>
          <TextField fullWidth sx={{ mt: 2 }} placeholder="Type DELETE to confirm" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
