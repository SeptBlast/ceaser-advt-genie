import React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Campaign,
  Analytics,
  CreditCard,
  Settings,
  Notifications,
  LightMode,
  DarkMode,
  HealthAndSafety as HealthIcon,
  Logout,
  Person,
  People,
  AutoAwesome as MagicIcon,
  Speed as SpeedIcon,
  EmojiObjects as CreativeIcon,
  FavoriteRounded as LoyalIcon,
  Business,
  Receipt,
  Support,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useThemeMode } from '../ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { useHealth } from '../hooks/useApi';
import ThemeAwareLogo from './ThemeAwareLogo';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  description: string;
  roles?: string[]; // Optional roles that can access this item
}

// Ceaser-themed navigation items with dog-inspired terminology
const navigationItems: NavigationItem[] = [
  {
    text: 'Command Center',
    icon: <Dashboard />,
    path: '/dashboard',
    description: 'Your mission control hub',
  },
  {
    text: 'Pack Campaigns',
    icon: <Campaign />,
    path: '/campaigns',
    description: 'Organize your hunting expeditions',
  },
  {
    text: 'Creative Fetch',
    icon: <CreativeIcon />,
    path: '/creatives',
    description: 'Fetch amazing creative assets',
  },
  {
    text: 'Sniff Analytics',
    icon: <Analytics />,
    path: '/analytics',
    description: 'Track your performance scent',
  },
  {
    text: 'Treat Billing',
    icon: <CreditCard />,
    path: '/billing',
    description: 'Manage your rewards',
  },
  {
    text: 'Pack Settings',
    icon: <Settings />,
    path: '/settings',
    description: 'Configure your territory',
  },
  {
    text: 'Pack Team',
    icon: <People />,
    path: '/team',
    description: 'Manage your pack members',
    roles: ['tenant_admin', 'superadmin'], // Only visible to tenant admins and super admins
  },
];

// Admin navigation items for super admin users
const adminNavigationItems: NavigationItem[] = [
  {
    text: 'Super Admin Dashboard',
    icon: <AdminPanelSettings />,
    path: '/admin',
    description: 'Super admin control center',
  },
  {
    text: 'Tenant Management',
    icon: <Business />,
    path: '/admin/tenants',
    description: 'Manage all platform tenants',
  },
  {
    text: 'Global Billing',
    icon: <Receipt />,
    path: '/admin/billing',
    description: 'Platform-wide billing management',
  },
  {
    text: 'Support Center',
    icon: <Support />,
    path: '/admin/support',
    description: 'Global customer support management',
  },
  {
    text: 'System Configuration',
    icon: <Settings />,
    path: '/admin/settings',
    description: 'Platform system settings',
  },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();
  const { user, logout, userProfile } = useAuth();
  const { healthStatus } = useHealth();
  
  const {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
  } = useAppStore();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    await logout();
    navigate('/');
  };

  const isMenuOpen = Boolean(anchorEl);

  // Ceaser brand header with personality
  const CeaserBrandHeader = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      px: 3, 
      py: 2,
      background: theme.palette.gradient?.primary || theme.palette.primary.main,
      color: 'white',
      borderRadius: '0 0 16px 16px',
      mb: 2,
    }}>
      <ThemeAwareLogo width={45} height={45} />
      {/* <PetsIcon sx={{ mr: 2, fontSize: 32 }} /> */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          Ceaser
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
          The Ad Genius
        </Typography>
      </Box>
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        <Tooltip title="Loyal like a Labrador">
          <LoyalIcon sx={{ fontSize: 20, opacity: 0.8 }} />
        </Tooltip>
        <Tooltip title="Smart like a Border Collie">
          <MagicIcon sx={{ fontSize: 20, opacity: 0.8 }} />
        </Tooltip>
        <Tooltip title="Fast like a Greyhound">
          <SpeedIcon sx={{ fontSize: 20, opacity: 0.8 }} />
        </Tooltip>
      </Box>
    </Box>
  );

  // Enhanced navigation item with subtle animations
  const NavigationItem = ({ item }: { item: NavigationItem }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <Tooltip title={item.description} placement="right">
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={isActive}
            onClick={() => navigate(item.path)}
            sx={{
              minHeight: 48,
              borderRadius: 2,
              mx: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateX(4px)',
              },
              '&.Mui-selected': {
                background: theme.palette.gradient?.primary || theme.palette.primary.main,
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
                '&:hover': {
                  background: theme.palette.gradient?.primary || theme.palette.primary.main,
                  opacity: 0.9,
                },
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 40,
                transition: 'transform 0.3s ease',
                ...(isActive && {
                  transform: 'scale(1.1)',
                }),
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
              }}
            />
          </ListItemButton>
        </ListItem>
      </Tooltip>
    );
  };

  // Health status indicator
  const HealthIndicator = () => (
    <Box sx={{ px: 2, py: 1 }}>
      <Chip
        icon={<HealthIcon />}
        label={healthStatus?.status === 'healthy' ? 'All Systems Go!' : 'Checking Health...'}
        color={healthStatus?.status === 'healthy' ? 'success' : 'default'}
        size="small"
        sx={{ 
          width: '100%',
          '& .MuiChip-icon': {
            color: 'inherit',
          },
        }}
      />
    </Box>
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Ceaser Brand Header */}
      <CeaserBrandHeader />
      
      {/* Navigation */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {navigationItems
          .filter((item) => {
            // If item has roles requirement, check if user has one of those roles
            if (item.roles && item.roles.length > 0) {
              return item.roles.includes(userProfile?.role || 'user');
            }
            // If no roles requirement, show to all authenticated users
            return true;
          })
          .map((item) => (
            <NavigationItem key={item.path} item={item} />
          ))}
        
        {/* Admin Section - Only show for super admin users */}
        {userProfile?.role === 'superadmin' && (
          <>
            <Divider sx={{ mx: 2, my: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
                Super Admin
              </Typography>
            </Divider>
            {adminNavigationItems.map((item) => (
              <NavigationItem key={item.path} item={item} />
            ))}
          </>
        )}
      </List>

      <Divider sx={{ mx: 2, mb: 2 }} />
      
      {/* Health Status */}
      <HealthIndicator />
      
      {/* User Info */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}>
          <Avatar 
            src={user?.photoURL || undefined} 
            sx={{ 
              width: 32, 
              height: 32, 
              mr: 1.5,
              bgcolor: theme.palette.secondary.main,
            }}
          >
            {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.displayName || 'Pack Member'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {navigationItems.find(item => item.path === location.pathname)?.text || 
             adminNavigationItems.find(item => item.path === location.pathname)?.text || 
             'Ceaser\'s Den'}
          </Typography>

          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={0} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Tooltip title="Profile">
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                src={user?.photoURL || undefined} 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
