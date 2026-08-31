import { Box, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 6,
        px: 3,
        borderStyle: 'dashed',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      {icon && (
        <Box sx={{ mb: 2, color: 'text.secondary', opacity: 0.5 }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 400 }}>
        {message}
      </Typography>
      {action}
    </Paper>
  );
}
