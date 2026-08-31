import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  School,
  Assignment,
} from '@mui/icons-material';
import { mockCourses, mockAssignments } from '@/data/mockData';
import EmptyState from '@/components/EmptyState';

interface Course {
  course_id: number;
  course_name: string;
  course_code: string;
  color: string;
}

const colorOptions = [
  '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
];

const emptyForm: Omit<Course, 'course_id'> = {
  course_name: '',
  course_code: '',
  color: colorOptions[0],
};

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>(mockCourses as Course[]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Course, 'course_id'>>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getAssignmentCount = (courseId: number): number =>
    mockAssignments.filter((a) => a.course_id === courseId).length;

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingId(course.course_id);
    setForm({ ...course });
    setErrors({});
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.course_name.trim()) errs.course_name = 'Course name is required';
    if (!form.course_code.trim()) errs.course_code = 'Course code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId !== null) {
      setCourses((prev) =>
        prev.map((c) => (c.course_id === editingId ? { ...form, course_id: editingId } : c))
      );
    } else {
      const newId = Math.max(...courses.map((c) => c.course_id), 0) + 1;
      setCourses((prev) => [...prev, { ...form, course_id: newId }]);
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.course_id !== id));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Courses
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manage your courses and their color tags.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd} size="large">
          Add Course
        </Button>
      </Box>

      {/* Course cards */}
      {courses.length === 0 ? (
        <EmptyState
          icon={<School sx={{ fontSize: 56 }} />}
          title="No courses yet"
          message="Add your first course to start organizing your assignments."
          action={
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
              Add Course
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.course_id}>
              <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
                <Box
                  sx={{
                    height: 6,
                    bgcolor: course.color,
                    borderRadius: '8px 8px 0 0',
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: course.color + '20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <School sx={{ color: course.color }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {course.course_code}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {getAssignmentCount(course.course_id)} assignments
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEdit(course)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(course.course_id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.primary', fontWeight: 500 }}>
                    {course.course_name}
                  </Typography>
                  <Chip
                    label={`Color: ${course.color}`}
                    size="small"
                    sx={{
                      mt: 1.5,
                      bgcolor: course.color + '20',
                      color: course.color,
                      fontWeight: 600,
                      border: 'none',
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          {editingId !== null ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={0} sx={{ mt: 1 }}>
            <TextField
              label="Course Name"
              value={form.course_name}
              onChange={(e) => setForm({ ...form, course_name: e.target.value })}
              error={!!errors.course_name}
              helperText={errors.course_name}
              required
            />
            <TextField
              label="Course Code"
              value={form.course_code}
              onChange={(e) => setForm({ ...form, course_code: e.target.value.toUpperCase() })}
              error={!!errors.course_code}
              helperText={errors.course_code}
              required
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                Color Tag
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {colorOptions.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: color,
                      cursor: 'pointer',
                      border: form.color === color ? '3px solid' : '3px solid transparent',
                      borderColor: form.color === color ? 'text.primary' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.1)' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId !== null ? 'Save Changes' : 'Add Course'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
