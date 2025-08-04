import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Switch,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  AccountCircle,
  Security,
  Psychology,
  Image,
  VideoLibrary,
  Edit,
  Delete,
  Add,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const { user, userProfile, updateUserProfile, updateUserPassword, updateUserEmail, resendVerificationEmail } = useAuth();
  
  const [activeTab, setActiveTab] = useState(0);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [currentModelType, setCurrentModelType] = useState<'ai' | 'media'>('ai');
  const [currentProvider, setCurrentProvider] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
  });

  const [modelData, setModelData] = useState({
    provider: '',
    apiKey: '',
    endpoint: '',
    projectId: '',
    models: '',
    defaultModel: '',
  });

  const aiProviders = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'] },
    { id: 'gemini', name: 'Google Gemini', models: ['gemini-pro', 'gemini-pro-vision'] },
    { id: 'azureOpenAI', name: 'Azure OpenAI', models: ['gpt-4', 'gpt-35-turbo'] },
    { id: 'grok', name: 'Grok (X.AI)', models: ['grok-1'] },
    { id: 'claude', name: 'Anthropic Claude', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  ];

  const mediaProviders = [
    { id: 'veo', name: 'Google Veo (Video)', type: 'video' },
    { id: 'imagen', name: 'Google Imagen (Image)', type: 'image' },
    { id: 'dalle', name: 'DALL-E (OpenAI)', type: 'image' },
    { id: 'midjourney', name: 'Midjourney', type: 'image' },
    { id: 'runway', name: 'Runway ML', type: 'video' },
    { id: 'stability', name: 'Stability AI', type: 'image' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordDialogOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleEmailChange = async () => {
    try {
      await updateUserEmail(emailData.newEmail, emailData.password);
      setEmailDialogOpen(false);
      setEmailData({ newEmail: '', password: '' });
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const handleAddModel = () => {
    setModelData({
      provider: currentProvider,
      apiKey: '',
      endpoint: '',
      projectId: '',
      models: '',
      defaultModel: '',
    });
    setModelDialogOpen(true);
  };

  const handleSaveModel = async () => {
    if (!userProfile) return;

    const updatedProfile = { ...userProfile };
    
    if (currentModelType === 'ai') {
      if (!updatedProfile.aiModels) updatedProfile.aiModels = {};
      
      const provider = modelData.provider as keyof typeof updatedProfile.aiModels;
      
      if (provider === 'azureOpenAI') {
        updatedProfile.aiModels[provider] = {
          apiKey: modelData.apiKey,
          endpoint: modelData.endpoint || '',
          models: modelData.models.split(',').map(m => m.trim()),
          defaultModel: modelData.defaultModel,
        };
      } else {
        updatedProfile.aiModels[provider] = {
          apiKey: modelData.apiKey,
          models: modelData.models.split(',').map(m => m.trim()),
          defaultModel: modelData.defaultModel,
        } as any;
      }
    } else {
      if (!updatedProfile.mediaModels) updatedProfile.mediaModels = {};
      
      const provider = modelData.provider as keyof typeof updatedProfile.mediaModels;
      
      if (provider === 'veo' || provider === 'imagen') {
        updatedProfile.mediaModels[provider] = {
          apiKey: modelData.apiKey,
          projectId: modelData.projectId || '',
        };
      } else {
        updatedProfile.mediaModels[provider] = {
          apiKey: modelData.apiKey,
        } as any;
      }
    }

    try {
      await updateUserProfile(updatedProfile);
      setModelDialogOpen(false);
      setModelData({
        provider: '',
        apiKey: '',
        endpoint: '',
        projectId: '',
        models: '',
        defaultModel: '',
      });
    } catch (error) {
      console.error('Error saving model:', error);
    }
  };

  const handleDeleteModel = async (type: 'ai' | 'media', provider: string) => {
    if (!userProfile) return;

    const updatedProfile = { ...userProfile };
    
    if (type === 'ai' && updatedProfile.aiModels) {
      delete updatedProfile.aiModels[provider as keyof typeof updatedProfile.aiModels];
    } else if (type === 'media' && updatedProfile.mediaModels) {
      delete updatedProfile.mediaModels[provider as keyof typeof updatedProfile.mediaModels];
    }

    try {
      await updateUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const maskApiKey = (apiKey: string) => {
    if (apiKey.length <= 8) return '*'.repeat(apiKey.length);
    return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
  };

  if (!user || !userProfile) {
    return <Box>Loading...</Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your account, security, and AI model integrations
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Navigation */}
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
                <Tab icon={<AccountCircle />} iconPosition="start" label="Profile" />
                <Tab icon={<Security />} iconPosition="start" label="Security" />
                <Tab icon={<Psychology />} iconPosition="start" label="AI Models" />
                <Tab icon={<Image />} iconPosition="start" label="Media Generation" />
              </Tabs>
            </CardContent>
          </Card>
        </Grid>

        {/* Content */}
        <Grid item xs={12} md={9}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              {/* Profile Tab */}
              <TabPanel value={activeTab} index={0}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Profile Information
                </Typography>

                <Grid container spacing={3}>
                  {/* Avatar and Basic Info */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{ width: 80, height: 80, mr: 3 }}
                        src={user.photoURL || ''}
                      >
                        <AccountCircle sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {user.displayName || 'No Name'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user.email}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            label={user.emailVerified ? 'Verified' : 'Unverified'}
                            color={user.emailVerified ? 'success' : 'warning'}
                            size="small"
                          />
                          {!user.emailVerified && (
                            <Button size="small" onClick={resendVerificationEmail}>
                              Resend Verification
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Email Address
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setEmailDialogOpen(true)}
                      >
                        Change Email
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value={activeTab} index={1}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Security Settings
                </Typography>

                <Stack spacing={3}>
                  {/* Password */}
                  <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Password
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Last changed: {userProfile.security.lastPasswordChange ? 
                            new Date(userProfile.security.lastPasswordChange).toLocaleDateString() : 
                            'Never'
                          }
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<Lock />}
                        onClick={() => setPasswordDialogOpen(true)}
                      >
                        Change Password
                      </Button>
                    </Box>
                  </Paper>

                  {/* Two-Factor Authentication */}
                  <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Two-Factor Authentication
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Add an extra layer of security to your account
                        </Typography>
                      </Box>
                      <Switch
                        checked={userProfile.security.twoFactorEnabled}
                        onChange={(e) => updateUserProfile({
                          security: {
                            ...userProfile.security,
                            twoFactorEnabled: e.target.checked,
                          }
                        })}
                      />
                    </Box>
                  </Paper>

                  {/* Session Timeout */}
                  <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Session Timeout
                    </Typography>
                    <TextField
                      type="number"
                      label="Hours"
                      value={userProfile.security.sessionTimeout}
                      onChange={(e) => updateUserProfile({
                        security: {
                          ...userProfile.security,
                          sessionTimeout: parseInt(e.target.value),
                        }
                      })}
                      sx={{ width: 120 }}
                    />
                  </Paper>
                </Stack>
              </TabPanel>

              {/* AI Models Tab */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    AI Model Configurations
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      setCurrentModelType('ai');
                      setCurrentProvider('');
                      handleAddModel();
                    }}
                  >
                    Add AI Model
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {Object.entries(userProfile.aiModels || {}).map(([provider, config]) => {
                    const providerInfo = aiProviders.find(p => p.id === provider);
                    return (
                      <Grid item xs={12} md={6} key={provider}>
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6">
                                {providerInfo?.name || provider}
                              </Typography>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteModel('ai', provider)}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                API Key
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                                  {showApiKeys[`ai-${provider}`] ? config.apiKey : maskApiKey(config.apiKey)}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => toggleApiKeyVisibility(`ai-${provider}`)}
                                >
                                  {showApiKeys[`ai-${provider}`] ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Default Model
                              </Typography>
                              <Chip label={config.defaultModel} size="small" />
                            </Box>

                            <Box>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Available Models
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {config.models.map((model) => (
                                  <Chip key={model} label={model} size="small" variant="outlined" />
                                ))}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {Object.keys(userProfile.aiModels || {}).length === 0 && (
                  <Alert severity="info">
                    No AI models configured. Add your first AI model to start generating content.
                  </Alert>
                )}
              </TabPanel>

              {/* Media Generation Tab */}
              <TabPanel value={activeTab} index={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Media Generation Models
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      setCurrentModelType('media');
                      setCurrentProvider('');
                      handleAddModel();
                    }}
                  >
                    Add Media Model
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {Object.entries(userProfile.mediaModels || {}).map(([provider, config]) => {
                    const providerInfo = mediaProviders.find(p => p.id === provider);
                    return (
                      <Grid item xs={12} md={6} key={provider}>
                        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {providerInfo?.type === 'video' ? <VideoLibrary sx={{ mr: 1 }} /> : <Image sx={{ mr: 1 }} />}
                                <Typography variant="h6">
                                  {providerInfo?.name || provider}
                                </Typography>
                              </Box>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteModel('media', provider)}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                API Key
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                                  {showApiKeys[`media-${provider}`] ? config.apiKey : maskApiKey(config.apiKey)}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => toggleApiKeyVisibility(`media-${provider}`)}
                                >
                                  {showApiKeys[`media-${provider}`] ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </Box>
                            </Box>

                            {'projectId' in config && config.projectId && (
                              <Box>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                  Project ID
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {config.projectId}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {Object.keys(userProfile.mediaModels || {}).length === 0 && (
                  <Alert severity="info">
                    No media generation models configured. Add image or video generation models to create visual content.
                  </Alert>
                )}
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePasswordChange}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Email Address</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            You will need to verify your new email address.
          </Alert>
          <TextField
            fullWidth
            type="email"
            label="New Email Address"
            value={emailData.newEmail}
            onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={emailData.password}
            onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEmailChange}>
            Change Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Model Dialog */}
      <Dialog open={modelDialogOpen} onClose={() => setModelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add {currentModelType === 'ai' ? 'AI Model' : 'Media Generation Model'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Provider</InputLabel>
            <Select
              value={modelData.provider}
              onChange={(e) => setModelData(prev => ({ ...prev, provider: e.target.value }))}
              label="Provider"
            >
              {(currentModelType === 'ai' ? aiProviders : mediaProviders).map((provider) => (
                <MenuItem key={provider.id} value={provider.id}>
                  {provider.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="API Key"
            type="password"
            value={modelData.apiKey}
            onChange={(e) => setModelData(prev => ({ ...prev, apiKey: e.target.value }))}
            sx={{ mb: 2 }}
          />

          {modelData.provider === 'azureOpenAI' && (
            <TextField
              fullWidth
              label="Endpoint URL"
              value={modelData.endpoint}
              onChange={(e) => setModelData(prev => ({ ...prev, endpoint: e.target.value }))}
              sx={{ mb: 2 }}
            />
          )}

          {(modelData.provider === 'veo' || modelData.provider === 'imagen') && (
            <TextField
              fullWidth
              label="Project ID"
              value={modelData.projectId}
              onChange={(e) => setModelData(prev => ({ ...prev, projectId: e.target.value }))}
              sx={{ mb: 2 }}
            />
          )}

          {currentModelType === 'ai' && (
            <>
              <TextField
                fullWidth
                label="Available Models (comma-separated)"
                value={modelData.models}
                onChange={(e) => setModelData(prev => ({ ...prev, models: e.target.value }))}
                sx={{ mb: 2 }}
                helperText="e.g., gpt-4, gpt-3.5-turbo"
              />
              <TextField
                fullWidth
                label="Default Model"
                value={modelData.defaultModel}
                onChange={(e) => setModelData(prev => ({ ...prev, defaultModel: e.target.value }))}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModelDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveModel}>
            Save Model
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
