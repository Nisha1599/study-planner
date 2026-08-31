import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Stack,
  Button,
  Avatar,
  AvatarGroup,
  Paper,
} from '@mui/material';
import {
  Assignment,
  Schedule,
  TrendingUp,
  AccessTime,
  CheckCircle,
  RadioButtonUnchecked,
  Warning,
  ArrowForward,
  School,
} from '@mui/icons-material';
import { mockAssignments, mockStudySessions, mockCourses } from '@/data/mockData';
import { PriorityChip, StatusChip } from '@/components/Chips';
import { formatDate, daysUntil, formatTime } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const total = mockAssignments.length;
    const completed = mockAssignments.filter((a) => a.status === 'completed').length;
    const inProgress = mockAssignments.filter((a) => a.status === 'in_progress').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const upcomingDeadlines = [...mockAssignments]
      .filter((a) => a.status !== 'completed')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);

    const weekSessions = mockStudySessions.filter((s) => s.status === 'scheduled');
    const totalHours = weekSessions.reduce((sum, s) => {
      const start = new Date(s.scheduled_start).getTime();
      const end = new Date(s.scheduled_end).getTime();
      return sum + (end - start) / (1000 * 60 * 60);
    }, 0);

    return { total, completed, inProgress, completionRate, upcomingDeadlines, weekSessions, totalHours };
  }, []);

  const courseMap = useMemo(() => {
    const map: Record<number, typeof mockCourses[0]> = {};
    mockCourses.forEach((c) => (map[c.course_id] = c));
    return map;
  }, []);

  const summaryCards = [
    {
      label: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines.length,
      icon: <Assignment />,
      color: '#3B82F6',
      bg: '#EFF6FF',
    },
    {
      label: "This Week's Sessions",
      value: stats.weekSessions.length,
      icon: <Schedule />,
      color: '#22C55E',
      bg: '#F0FDF4',
    },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: <TrendingUp />,
      color: '#F59E0B',
      bg: '#FFFBEB',
    },
    {
      label: 'Hours Scheduled',
      value: `${stats.totalHours.toFixed(1)}h`,
      icon: <AccessTime />,
      color: '#8B5CF6',
      bg: '#F5F3FF',
    },
  ];

  return (
    <Box>
      {/* Welcome header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Here's your study overview for this week.
        </Typography>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      {card.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: card.bg,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming deadlines */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Upcoming Deadlines
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/assignments')}
                >
                  View All
                </Button>
              </Box>
              {stats.upcomingDeadlines.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
                  No upcoming deadlines. You're all caught up!
                </Typography>
              ) : (
                <List>
                  {stats.upcomingDeadlines.map((assignment) => {
                    const course = courseMap[assignment.course_id];
                    const days = daysUntil(assignment.deadline);
                    return (
                      <ListItem
                        key={assignment.assignment_id}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 4,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: course?.color || '#3B82F6',
                              mr: 1,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {assignment.title}
                              </Typography>
                              <PriorityChip priority={assignment.priority} />
                            </Stack>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {course?.course_code} · {formatDate(assignment.deadline)}
                            </Typography>
                          }
                        />
                        <Box sx={{ textAlign: 'right' }}>
                          {days <= 2 ? (
                            <Chip
                              icon={<Warning sx={{ fontSize: 16 }} />}
                              label={days === 0 ? 'Today!' : days === 1 ? '1 day left' : `${days} days left`}
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {days} days left
                            </Typography>
                          )}
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* This week's sessions + progress */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    This Week's Plan
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/calendar')}
                  >
                    Calendar
                  </Button>
                </Box>
                <List dense>
                  {stats.weekSessions.slice(0, 4).map((session) => {
                    const assignment = mockAssignments.find((a) => a.assignment_id === session.assignment_id);
                    const course = assignment ? courseMap[assignment.course_id] : null;
                    return (
                      <ListItem key={session.session_id} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {session.status === 'completed' ? (
                            <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                          ) : (
                            <RadioButtonUnchecked sx={{ color: 'text.secondary', fontSize: 20 }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {assignment?.title || 'Study Session'}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {formatDate(session.scheduled_start.split('T')[0])} · {formatTime(session.scheduled_start.split('T')[1])}
                            </Typography>
                          }
                        />
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: course?.color || '#3B82F6',
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>

            {/* Progress summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Overall Progress
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Assignments Completed
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats.completed}/{stats.total}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.completionRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  {mockCourses.slice(0, 4).map((course) => (
                    <Chip
                      key={course.course_id}
                      label={course.course_code}
                      size="small"
                      sx={{
                        bgcolor: course.color + '20',
                        color: course.color,
                        fontWeight: 600,
                        border: 'none',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
