import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Stack,
  Alert,
  TextField,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Notifications,
  Sync,
  Schedule,
  Save,
  Person,
  Language,
  Palette,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

const timezones = [
  'UTC-08:00 Pacific Time',
  'UTC-07:00 Mountain Time',
  'UTC-06:00 Central Time',
  'UTC-05:00 Eastern Time',
  'UTC+00:00 GMT',
  'UTC+01:00 Central European Time',
  'UTC+08:00 China Standard Time',
  'UTC+09:00 Japan Standard Time',
];

export default function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [calendarSync, setCalendarSync] = useState(false);
  const [timezone, setTimezone] = useState('UTC-05:00 Eastern Time');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Manage your account preferences and integrations.
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSaved(false)}>
          Settings saved successfully.
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Profile */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Person sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Profile
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                }}
              >
                {user?.avatar || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user?.name || 'Student'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user?.email || 'student@university.edu'}
                </Typography>
              </Box>
            </Box>
            <TextField
              label="Display Name"
              defaultValue={user?.name || ''}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email Address"
              defaultValue={user?.email || ''}
              fullWidth
              margin="normal"
              disabled
              helperText="Email cannot be changed in this version."
            />
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Schedule sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Preferences
              </Typography>
            </Box>
            <FormControl fullWidth margin="normal">
              <InputLabel>Timezone</InputLabel>
              <Select
                value={timezone}
                label="Timezone"
                onChange={(e) => setTimezone(e.target.value)}
              >
                {timezones.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Notifications sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
            </Box>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    color="primary"
                  />
                }
                label="Push notifications"
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', ml: 4, display: 'block' }}>
                Get notified about upcoming study sessions and deadlines.
              </Typography>
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={emailReminders}
                    onChange={(e) => setEmailReminders(e.target.checked)}
                    color="primary"
                  />
                }
                label="Email reminders"
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', ml: 4, display: 'block' }}>
                Receive daily email summaries of your study plan.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Calendar Sync */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Sync sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Calendar Integration
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={calendarSync}
                  onChange={(e) => setCalendarSync(e.target.checked)}
                  color="primary"
                />
              }
              label="Sync with Google Calendar"
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 4, display: 'block', mt: 1 }}>
              Automatically export your study sessions to your Google Calendar.
            </Typography>
            {calendarSync && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                Calendar sync will be available when the backend API is connected.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Save button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            size="large"
          >
            Save Changes
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
