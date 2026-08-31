import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItemButton,
  IconButton,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  CalendarMonth as CalendarIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Logout,
  Notifications,
  ChevronLeft,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

const drawerWidth = 240;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Assignments', path: '/assignments', icon: <AssignmentIcon /> },
  { label: 'Courses', path: '/courses', icon: <SchoolIcon /> },
  { label: 'Availability', path: '/availability', icon: <ScheduleIcon /> },
  { label: 'Calendar', path: '/calendar', icon: <CalendarIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/assignments': 'Assignments',
  '/courses': 'Courses',
  '/availability': 'Available Hours',
  '/calendar': 'Study Plan',
  '/settings': 'Settings',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const currentTitle = pageTitles[location.pathname] || 'Study Planner';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2.5,
          color: '#ffffff',
        }}
      >
        <SchoolIcon sx={{ fontSize: 28, color: '#3B82F6' }} />
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.2, fontSize: '1rem', fontWeight: 700 }}>
            Study Planner
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
            Plan. Study. Succeed.
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1 }} />
      <List sx={{ flex: 1, px: 0.5 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => handleNav(item.path)}
              sx={{
                color: active ? '#3B82F6' : '#CBD5E1',
                '& .MuiListItemIcon-root': { color: active ? '#3B82F6' : '#94A3B8' },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ p: 2, color: '#64748B' }}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          Personalized Study Planning
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', color: '#475569' }}>
          Capstone Project v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky">
          <Toolbar sx={{ gap: 2 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {currentTitle}
            </Typography>
            <Tooltip title="Notifications">
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={user?.name || 'Account'}>
              <IconButton onClick={handleMenu} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.avatar || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Sign Out" />
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            maxWidth: 1200,
            width: '100%',
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
