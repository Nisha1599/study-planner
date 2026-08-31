import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  IconButton,
  Tooltip,
  Stack,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Assignment as AssignmentIcon,
  FilterList,
} from '@mui/icons-material';
import { mockAssignments, mockCourses } from '@/data/mockData';
import { PriorityChip, StatusChip } from '@/components/Chips';
import EmptyState from '@/components/EmptyState';
import { formatDate, daysUntil } from '@/utils/helpers';

interface Assignment {
  assignment_id: number;
  course_id: number;
  title: string;
  deadline: string;
  estimated_hours: number;
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  notes?: string;
}

const emptyForm: Omit<Assignment, 'assignment_id'> = {
  course_id: 1,
  title: '',
  deadline: '',
  estimated_hours: 1,
  priority: 'medium',
  status: 'not_started',
  completion_percentage: 0,
  notes: '',
};

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments as Assignment[]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCourse, setFilterCourse] = useState<number | 'all'>('all');
  const [form, setForm] = useState<Omit<Assignment, 'assignment_id'>>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const courseMap = useMemo(() => {
    const map: Record<number, typeof mockCourses[0]> = {};
    mockCourses.forEach((c) => (map[c.course_id] = c));
    return map;
  }, []);

  const filtered = useMemo(() => {
    if (filterCourse === 'all') return assignments;
    return assignments.filter((a) => a.course_id === filterCourse);
  }, [assignments, filterCourse]);

  const groupedByCourse = useMemo(() => {
    const groups: Record<number, Assignment[]> = {};
    filtered.forEach((a) => {
      if (!groups[a.course_id]) groups[a.course_id] = [];
      groups[a.course_id].push(a);
    });
    return groups;
  }, [filtered]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenEdit = (assignment: Assignment) => {
    setEditingId(assignment.assignment_id);
    setForm({ ...assignment });
    setErrors({});
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.deadline) errs.deadline = 'Deadline is required';
    if (form.estimated_hours <= 0) errs.estimated_hours = 'Must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId !== null) {
      setAssignments((prev) =>
        prev.map((a) => (a.assignment_id === editingId ? { ...form, assignment_id: editingId } : a))
      );
    } else {
      const newId = Math.max(...assignments.map((a) => a.assignment_id), 0) + 1;
      setAssignments((prev) => [...prev, { ...form, assignment_id: newId }]);
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    setAssignments((prev) => prev.filter((a) => a.assignment_id !== id));
  };

  const handleStatusChange = (id: number, newStatus: Assignment['status']) => {
    const completionMap: Record<string, number> = {
      not_started: 0,
      in_progress: 50,
      completed: 100,
    };
    setAssignments((prev) =>
      prev.map((a) =>
        a.assignment_id === id
          ? { ...a, status: newStatus, completion_percentage: completionMap[newStatus] }
          : a
      )
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Assignments
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manage your assignments across all courses.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd} size="large">
          Add Assignment
        </Button>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FilterList sx={{ color: 'text.secondary' }} />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Course</InputLabel>
          <Select
            value={filterCourse}
            label="Filter by Course"
            onChange={(e) => setFilterCourse(e.target.value as number | 'all')}
          >
            <MenuItem value="all">All Courses</MenuItem>
            {mockCourses.map((c) => (
              <MenuItem key={c.course_id} value={c.course_id}>
                {c.course_code} — {c.course_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Assignment list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<AssignmentIcon sx={{ fontSize: 56 }} />}
          title="No assignments yet"
          message="Add your first assignment to start planning your study schedule."
          action={
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
              Add Assignment
            </Button>
          }
        />
      ) : (
        <Stack spacing={3}>
          {Object.entries(groupedByCourse).map(([courseId, items]) => {
            const course = courseMap[Number(courseId)];
            return (
              <Card key={courseId}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: course?.color,
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {course?.course_name}
                    </Typography>
                    <Chip label={course?.course_code} size="small" variant="outlined" />
                    <Chip label={`${items.length} assignment${items.length > 1 ? 's' : ''}`} size="small" color="primary" variant="outlined" />
                  </Box>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="medium">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'background.default' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Deadline</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Est. Hours</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: 100 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((assignment) => {
                          const days = daysUntil(assignment.deadline);
                          return (
                            <TableRow key={assignment.assignment_id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {assignment.title}
                                </Typography>
                                {assignment.notes && (
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                    {assignment.notes}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{formatDate(assignment.deadline)}</Typography>
                                {assignment.status !== 'completed' && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: days <= 2 ? 'error.main' : 'text.secondary',
                                      fontWeight: days <= 2 ? 600 : 400,
                                    }}
                                  >
                                    {days === 0 ? 'Due today' : days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>{assignment.estimated_hours}h</TableCell>
                              <TableCell>
                                <PriorityChip priority={assignment.priority} />
                              </TableCell>
                              <TableCell>
                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                  <Select
                                    value={assignment.status}
                                    onChange={(e) => handleStatusChange(assignment.assignment_id, e.target.value as Assignment['status'])}
                                    variant="outlined"
                                  >
                                    <MenuItem value="not_started">Not Started</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                  </Select>
                                </FormControl>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 60 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={assignment.completion_percentage}
                                      sx={{ height: 6, borderRadius: 3 }}
                                    />
                                  </Box>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {assignment.completion_percentage}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={() => handleOpenEdit(assignment)}>
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" onClick={() => handleDelete(assignment.assignment_id)} color="error">
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          {editingId !== null ? 'Edit Assignment' : 'Add New Assignment'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={0} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Course</InputLabel>
              <Select
                value={form.course_id}
                label="Course"
                onChange={(e) => setForm({ ...form, course_id: e.target.value as number })}
              >
                {mockCourses.map((c) => (
                  <MenuItem key={c.course_id} value={c.course_id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color }} />
                      {c.course_code} — {c.course_name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              error={!!errors.deadline}
              helperText={errors.deadline}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Estimated Hours"
              type="number"
              value={form.estimated_hours}
              onChange={(e) => setForm({ ...form, estimated_hours: Number(e.target.value) })}
              error={!!errors.estimated_hours}
              helperText={errors.estimated_hours}
              inputProps={{ min: 0, step: 0.5 }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={form.priority}
                label="Priority"
                onChange={(e) => setForm({ ...form, priority: e.target.value as Assignment['priority'] })}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                label="Status"
                onChange={(e) => setForm({ ...form, status: e.target.value as Assignment['status'] })}
              >
                <MenuItem value="not_started">Not Started</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Notes (optional)"
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId !== null ? 'Save Changes' : 'Add Assignment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
