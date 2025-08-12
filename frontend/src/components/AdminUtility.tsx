import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface AdminUtilityProps {
  open: boolean;
  onClose: () => void;
}

const AdminUtility: React.FC<AdminUtilityProps> = ({ open, onClose }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Super secret admin password for testing (in production, this would be done through secure backend processes)
  const ADMIN_PASSWORD = 'ceaser-super-admin-2024';

  const handleMakeSuperAdmin = async () => {
    if (password !== ADMIN_PASSWORD) {
      setError('Invalid admin password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateUserProfile({
        role: 'superadmin',
      });
      
      alert('You are now a Super Admin! Please refresh the page to see admin navigation.');
      onClose();
    } catch (err) {
      setError('Failed to update role. Please try again.');
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  const handleResetToUser = async () => {
    setLoading(true);
    setError('');

    try {
      await updateUserProfile({
        role: 'user',
      });
      
      alert('Role reset to user. Please refresh the page.');
      onClose();
    } catch (err) {
      setError('Failed to reset role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettings />
          <Typography variant="h6">Admin Utility</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          This utility is for testing purposes only. In production, super admin roles should be assigned through secure backend processes.
        </Alert>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Current Role: <strong>{userProfile?.role || 'user'}</strong>
          </Typography>
        </Box>

        {userProfile?.role === 'superadmin' ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are already a Super Admin. You can reset your role to user if needed.
            </Typography>
            <Button
              variant="outlined"
              color="warning"
              onClick={handleResetToUser}
              disabled={loading}
              fullWidth
            >
              Reset to User Role
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter the admin password to become a Super Admin:
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
            />
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {userProfile?.role !== 'superadmin' && (
          <Button
            variant="contained"
            onClick={handleMakeSuperAdmin}
            disabled={loading || !password}
          >
            {loading ? 'Updating...' : 'Make Super Admin'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AdminUtility;
