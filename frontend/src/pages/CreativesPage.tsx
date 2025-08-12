import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Fab,
  useTheme,
  alpha,
  Avatar,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  AutoAwesome,
  Download,
  Share,
  Psychology,
  Image as ImageIcon,
  VideoFile,
  ViewCarousel,
  Article,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

const CreativesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { 
    creatives, 
    loading, 
    fetchCreatives, 
    fetchCampaigns,
    deleteCreative,
    campaigns,
    generateCreativeWithAI
  } = useAppStore();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedCreative, setSelectedCreative] = React.useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [creativeType, setCreativeType] = useState('video');
  const [generating, setGenerating] = useState(false);
  // Example: Replace with actual available models from backend/config
  const availableModels = [
    { value: 'openai-gpt4-video', label: 'OpenAI GPT-4 Video' },
    { value: 'google-palm2-video', label: 'Google PaLM2 Video' },
    { value: 'stability-ai-video', label: 'Stability AI Video' },
  ];

  React.useEffect(() => {
    fetchCreatives();
    fetchCampaigns();
  }, [fetchCreatives, fetchCampaigns]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, creative: any) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCreative(creative);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCreative(null);
  };

  const handleEdit = () => {
    if (selectedCreative) {
      navigate(`/creatives/${selectedCreative.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedCreative) {
      try {
        await deleteCreative(selectedCreative.id);
        setDeleteDialogOpen(false);
        setSelectedCreative(null);
      } catch (error) {
        console.error('Failed to delete creative:', error);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon />;
      case 'video':
        return <VideoFile />;
      case 'carousel':
        return <ViewCarousel />;
      case 'text':
        return <Article />;
      default:
        return <ImageIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'primary';
      case 'video':
        return 'secondary';
      case 'carousel':
        return 'success';
      case 'text':
        return 'info';
      default:
        return 'default';
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
      case 'generated':
        return 'info';
      case 'approved':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Mock data for demonstration
  const mockCreatives = [
    {
      id: '1',
      campaignId: '1',
      campaignName: 'Summer Sale 2024',
      type: 'image',
      status: 'active',
      content: {
        headline: 'Summer Sale - Up to 50% Off!',
        description: 'Limited time offer on all summer collection items.',
        callToAction: 'Shop Now',
        imageUrl: 'https://picsum.photos/400/300?random=1',
      },
      aiMetadata: {
        generatedBy: 'AI Engine v2.1',
        confidence: 0.92,
      },
      performance: {
        impressions: 125000,
        clicks: 3250,
        ctr: 2.6,
        conversions: 287,
        conversionRate: 8.8,
      },
      createdAt: '2024-07-15T10:30:00Z',
    },
    {
      id: '2',
      campaignId: '1',
      campaignName: 'Summer Sale 2024',
      type: 'video',
      status: 'active',
      content: {
        headline: 'See Our Summer Collection',
        description: 'Discover the latest trends in our summer lineup.',
        callToAction: 'Watch & Shop',
        videoUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://picsum.photos/400/300?random=2',
      },
      aiMetadata: {
        generatedBy: 'AI Engine v2.1',
        confidence: 0.88,
      },
      performance: {
        impressions: 89000,
        clicks: 4120,
        ctr: 4.6,
        conversions: 356,
        conversionRate: 8.6,
      },
      createdAt: '2024-07-14T14:20:00Z',
    },
    {
      id: '3',
      campaignId: '2',
      campaignName: 'Brand Awareness Q2',
      type: 'carousel',
      status: 'paused',
      content: {
        headline: 'Discover Our Brand Story',
        description: 'From our beginnings to today, see what makes us unique.',
        callToAction: 'Learn More',
        imageUrl: 'https://picsum.photos/400/300?random=3',
      },
      performance: {
        impressions: 67000,
        clicks: 1890,
        ctr: 2.8,
        conversions: 134,
        conversionRate: 7.1,
      },
      createdAt: '2024-06-20T09:15:00Z',
    },
  ];

  const displayCreatives = creatives.length > 0 ? creatives : mockCreatives;

  // Handle AI Creative Generation
  const handleGenerateCreative = async () => {
    if (!selectedCampaign || !creativeType || !aiPrompt || !selectedModel) return;
    setGenerating(true);
    try {
      await generateCreativeWithAI({
        campaignId: selectedCampaign,
        type: creativeType,
        prompt: aiPrompt,
        model: selectedModel,
      });
      setGenerateDialogOpen(false);
      setAiPrompt('');
      setSelectedModel('');
      setCreativeType('video');
    } catch (e) {
      // Optionally show error
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
            AI Creative Studio
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Create and manage AI-powered advertising creatives
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<AutoAwesome />}
            onClick={() => setGenerateDialogOpen(true)}
            size="large"
          >
            Generate with AI
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/creatives/new')}
            size="large"
          >
            Create Manual
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {displayCreatives.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Creatives
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>
                {displayCreatives.filter(c => c.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Creatives
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                {displayCreatives.filter(c => c.aiMetadata).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                AI Generated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                3.2%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Avg. CTR
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Creatives Grid */}
      <Grid container spacing={3}>
        {loading.creatives ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={28} />
                  <Skeleton variant="text" height={20} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          displayCreatives.map((creative) => (
            <Grid item xs={12} sm={6} md={4} key={creative.id}>
              <Card 
                elevation={0} 
                sx={{ 
                  border: 1, 
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
                onClick={() => navigate(`/creatives/${creative.id}`)}
              >
                {/* Creative Preview */}
                <Box sx={{ position: 'relative' }}>
                  {/* Show video if S3 or provider video URL exists */}
                  {creative.type === 'video' && ((creative.content as any).s3VideoUrl || creative.content.videoUrl || (creative.content as any).providerVideoUrl) ? (
                    <video
                      height="200"
                      width="100%"
                      controls
                      poster={creative.content.thumbnailUrl || creative.content.imageUrl}
                      style={{ objectFit: 'cover', maxHeight: 200 }}
                    >
                      {(creative.content as any).s3VideoUrl && <source src={(creative.content as any).s3VideoUrl} type="video/mp4" />}
                      {(creative.content as any).providerVideoUrl && <source src={(creative.content as any).providerVideoUrl} type="video/mp4" />}
                      {creative.content.videoUrl && <source src={creative.content.videoUrl} type="video/mp4" />}
                      Your browser does not support the video tag.
                    </video>
                  ) : creative.content.imageUrl || creative.content.thumbnailUrl ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={creative.content.imageUrl || creative.content.thumbnailUrl}
                      alt={creative.content.headline}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <Avatar sx={{ width: 64, height: 64, mb: 1 }}>
                        {getTypeIcon(creative.type)}
                      </Avatar>
                      <Typography variant="body2" color="textSecondary">
                        {creative.type.charAt(0).toUpperCase() + creative.type.slice(1)} Creative
                      </Typography>
                    </Box>
                  )}

                  {/* Type & AI Badge */}
                  <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 1 }}>
                    <Chip
                      icon={getTypeIcon(creative.type)}
                      label={creative.type}
                      size="small"
                      color={getTypeColor(creative.type)}
                    />
                    {creative.aiMetadata && (
                      <Chip
                        icon={<Psychology />}
                        label="AI"
                        size="small"
                        color="secondary"
                      />
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      size="small"
                      sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                      onClick={(e) => handleMenuOpen(e, creative)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                <CardContent>
                  {/* Campaign info */}
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                    {'campaignName' in creative ? (creative as any).campaignName : (campaigns?.find(c => c.id === creative.campaignId)?.name || 'Unknown Campaign')}
                  </Typography>

                  {/* Headline */}
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {creative.content.headline}
                  </Typography>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {creative.content.description}
                  </Typography>

                  {/* Status and Performance */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={creative.status}
                      size="small"
                      color={getStatusColor(creative.status)}
                      variant="outlined"
                    />
                    {creative.performance && (
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 'medium' }}>
                        CTR: {creative.performance.ctr}%
                      </Typography>
                    )}
                  </Box>

                  {/* Performance Metrics */}
                  {creative.performance && (
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          Impressions
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {(creative.performance.impressions / 1000).toFixed(0)}K
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          Clicks
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {creative.performance.clicks.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          Conversions
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {creative.performance.conversions}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedCreative && navigate(`/creatives/${selectedCreative.id}`)}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Edit Creative
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <Download sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <Share sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Creative</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this creative? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Generate Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Creative with AI</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Campaign</InputLabel>
                <Select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  label="Campaign"
                >
                  {campaigns && campaigns.map((c: any) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Creative Type</InputLabel>
                <Select
                  value={creativeType}
                  label="Creative Type"
                  onChange={(e) => setCreativeType(e.target.value)}
                >
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="carousel">Carousel</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Model</InputLabel>
                <Select
                  value={selectedModel}
                  label="Model"
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  {availableModels.map((m) => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="AI Prompt"
                multiline
                rows={4}
                placeholder="Describe the creative you want to generate..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)} disabled={generating}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={handleGenerateCreative}
            disabled={generating || !selectedCampaign || !creativeType || !aiPrompt || !selectedModel}
          >
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="secondary"
        aria-label="generate creative"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setGenerateDialogOpen(true)}
      >
        <AutoAwesome />
      </Fab>
    </Box>
  );
};

export default CreativesPage;
