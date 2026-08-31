import { Chip } from '@mui/material';
import { priorityLabels, statusLabels } from '@/data/mockData';
import { priorityColors, statusColors } from '@/utils/helpers';

export function PriorityChip({ priority }: { priority: string }) {
  return (
    <Chip
      label={priorityLabels[priority] || priority}
      color={priorityColors[priority] || 'default'}
      size="small"
      variant={priority === 'low' ? 'outlined' : 'filled'}
    />
  );
}

export function StatusChip({ status }: { status: string }) {
  return (
    <Chip
      label={statusLabels[status] || status}
      color={statusColors[status] || 'default'}
      size="small"
      variant={status === 'completed' ? 'filled' : 'outlined'}
    />
  );
}
