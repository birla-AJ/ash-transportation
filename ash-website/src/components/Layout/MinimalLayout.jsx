import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Chip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  sub_admin: 'Sub Admin',
};

export default function MinimalLayout() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'background.paper' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocalShippingIcon color="secondary" />
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              Ash Transportation
            </Typography>
            <Chip
              size="small"
              label={ROLE_LABELS[user?.role] || user?.role}
              color="secondary"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 34, height: 34, fontSize: 14 }}>
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>{user?.name}</MenuItem>
            <MenuItem disabled sx={{ fontSize: 12, color: 'text.secondary' }}>
              {user?.email}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
