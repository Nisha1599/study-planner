import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Stack,
  Chip,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  AutoFixHigh,
  CheckCircle,
  Cancel,
  Schedule,
  AccessTime,
  School,
  Refresh,
} from '@mui/icons-material';
import { mockStudySessions, mockAssignments, mockCourses, dayShortLabels } from '@/data/mockData';
import EmptyState from '@/components/EmptyState';
import {
  formatTime,
  getStartOfWeek,
  getWeekDates,
  isSameDate,
} from '@/utils/helpers';

interface StudySession {
  session_id: number;
  assignment_id: number;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'completed' | 'incomplete';
}

const HOUR_START = 7;
const HOUR_END = 22;
const HOUR_HEIGHT = 48;

export default function Calendar() {
  const [sessions, setSessions] = useState<StudySession[]>(mockStudySessions as StudySession[]);
  const [weekStart, setWeekStart] = useState<Date>(() => getStartOfWeek(new Date('2026-09-01')));
  const [generating, setGenerating] = useState(false);
  const [detailSession, setDetailSession] = useState<StudySession | null>(null);

  const courseMap = useMemo(() => {
    const map: Record<number, typeof mockCourses[0]> = {};
    mockCourses.forEach((c) => (map[c.course_id] = c));
    return map;
  }, []);

  const assignmentMap = useMemo(() => {
    const map: Record<number, typeof mockAssignments[0]> = {};
    mockAssignments.forEach((a) => (map[a.assignment_id] = a));
    return map;
  }, []);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const weekSessions = useMemo(() => {
    return sessions.filter((s) => {
      const sessionDate = new Date(s.scheduled_start);
      return weekDates.some((d) => isSameDate(d, sessionDate));
    });
  }, [sessions, weekDates]);

  const getSessionsForDay = (date: Date): StudySession[] => {
    return weekSessions
      .filter((s) => isSameDate(new Date(s.scheduled_start), date))
      .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime());
  };

  const handlePrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const handleToday = () => setWeekStart(getStartOfWeek(new Date()));

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate plan generation
    setTimeout(() => {
      setGenerating(false);
    }, 1500);
  };

  const handleToggleStatus = (sessionId: number, newStatus: StudySession['status']) => {
    setSessions((prev) =>
      prev.map((s) => (s.session_id === sessionId ? { ...s, status: newStatus } : s))
    );
    setDetailSession(null);
  };

  const formatWeekRange = (): string => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  };

  const stats = useMemo(() => {
    const total = weekSessions.length;
    const completed = weekSessions.filter((s) => s.status === 'completed').length;
    const scheduled = weekSessions.filter((s) => s.status === 'scheduled').length;
    const incomplete = weekSessions.filter((s) => s.status === 'incomplete').length;
    const totalHours = weekSessions.reduce((sum, s) => {
      return sum + (new Date(s.scheduled_end).getTime() - new Date(s.scheduled_start).getTime()) / (1000 * 60 * 60);
    }, 0);
    return { total, completed, scheduled, incomplete, totalHours };
  }, [weekSessions]);

  const hours: number[] = [];
  for (let h = HOUR_START; h <= HOUR_END; h++) hours.push(h);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Study Plan
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Your AI-generated weekly study schedule.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={generating ? <Refresh className="spin" /> : <AutoFixHigh />}
            onClick={handleGenerate}
            disabled={generating}
            size="large"
          >
            {generating ? 'Generating...' : 'Generate Plan'}
          </Button>
        </Stack>
      </Box>

      {/* Week navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={handlePrevWeek} size="small">
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 180 }}>
          {formatWeekRange()}
        </Typography>
        <IconButton onClick={handleNextWeek} size="small">
          <ChevronRight />
        </IconButton>
        <Button size="small" onClick={handleToday} variant="text">
          This Week
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1}>
          <Chip label={`${stats.total} sessions`} size="small" color="primary" variant="outlined" />
          <Chip label={`${stats.completed} done`} size="small" color="success" variant="outlined" />
          <Chip label={`${stats.totalHours.toFixed(1)}h`} size="small" variant="outlined" />
        </Stack>
      </Box>

      {generating && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Generating your personalized study plan based on your assignments, deadlines, and available hours...
        </Alert>
      )}

      {weekSessions.length === 0 && !generating ? (
        <EmptyState
          icon={<Schedule sx={{ fontSize: 56 }} />}
          title="No study sessions scheduled"
          message="Click 'Generate Plan' to create your personalized study schedule based on your assignments and available hours."
          action={
            <Button variant="contained" startIcon={<AutoFixHigh />} onClick={handleGenerate}>
              Generate Plan
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent sx={{ overflowX: 'auto', p: { xs: 1, sm: 2 } } as any}>
            <Box sx={{ minWidth: 750 }}>
              {/* Day headers */}
              <Grid container spacing={0}>
                <Grid item sx={{ width: 60 }}>
                  <Box sx={{ height: 48 }} />
                </Grid>
                {weekDates.map((date, i) => {
                  const isToday = isSameDate(date, new Date());
                  return (
                    <Grid item xs key={i} sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          py: 1,
                          borderBottom: 2,
                          borderColor: isToday ? 'primary.main' : 'divider',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: isToday ? 'primary.main' : 'text.secondary',
                            fontWeight: 600,
                            display: 'block',
                          }}
                        >
                          {dayShortLabels[i]}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: isToday ? 'primary.main' : 'text.primary',
                            fontSize: '1.1rem',
                          }}
                        >
                          {date.getDate()}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Calendar grid */}
              <Grid container spacing={0}>
                {/* Hour labels */}
                <Grid item sx={{ width: 60 }}>
                  <Box sx={{ position: 'relative' }}>
                    {hours.map((h) => (
                      <Typography
                        key={h}
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          top: (h - HOUR_START) * HOUR_HEIGHT - 8,
                          right: 8,
                          color: 'text.secondary',
                          fontSize: '0.7rem',
                        }}
                      >
                        {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
                      </Typography>
                    ))}
                    <Box sx={{ height: (HOUR_END - HOUR_START) * HOUR_HEIGHT }} />
                  </Box>
                </Grid>

                {/* Day columns */}
                {weekDates.map((date, dayIdx) => {
                  const daySessions = getSessionsForDay(date);
                  return (
                    <Grid item xs key={dayIdx} sx={{ flex: 1, position: 'relative' }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          position: 'relative',
                          height: (HOUR_END - HOUR_START) * HOUR_HEIGHT,
                          bgcolor: 'background.default',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Hour lines */}
                        {hours.map((h) => (
                          <Box
                            key={h}
                            sx={{
                              position: 'absolute',
                              top: (h - HOUR_START) * HOUR_HEIGHT,
                              left: 0,
                              right: 0,
                              borderTop: '1px solid',
                              borderColor: 'divider',
                            }}
                          />
                        ))}

                        {/* Session blocks */}
                        {daySessions.map((session) => {
                          const start = new Date(session.scheduled_start);
                          const end = new Date(session.scheduled_end);
                          const startHour =
                            start.getHours() + start.getMinutes() / 60;
                          const endHour = end.getHours() + end.getMinutes() / 60;
                          const top = (startHour - HOUR_START) * HOUR_HEIGHT;
                          const height = (endHour - startHour) * HOUR_HEIGHT - 4;
                          const assignment = assignmentMap[session.assignment_id];
                          const course = assignment ? courseMap[assignment.course_id] : null;
                          const color = course?.color || '#3B82F6';

                          return (
                            <Box
                              key={session.session_id}
                              onClick={() => setDetailSession(session)}
                              sx={{
                                position: 'absolute',
                                top: top + 2,
                                left: 2,
                                right: 2,
                                height,
                                bgcolor: color,
                                opacity: session.status === 'completed' ? 0.5 : session.status === 'incomplete' ? 0.35 : 0.9,
                                borderRadius: 1.5,
                                p: 1,
                                cursor: 'pointer',
                                overflow: 'hidden',
                                border: session.status === 'completed' ? '1px solid' : 'none',
                                borderColor: 'rgba(0,0,0,0.1)',
                                transition: 'opacity 0.2s, transform 0.2s',
                                '&:hover': {
                                  opacity: 1,
                                  transform: 'scale(1.02)',
                                  zIndex: 10,
                                },
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#fff',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  display: 'block',
                                  lineHeight: 1.2,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {assignment?.title || 'Study Session'}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'rgba(255,255,255,0.85)',
                                  fontSize: '0.65rem',
                                  display: 'block',
                                }}
                              >
                                {formatTime(start.toTimeString().slice(0, 5))} – {formatTime(end.toTimeString().slice(0, 5))}
                              </Typography>
                              {session.status === 'completed' && (
                                <CheckCircle sx={{ color: '#fff', fontSize: 14, mt: 0.5 }} />
                              )}
                            </Box>
                          );
                        })}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {mockCourses.map((course) => (
          <Stack key={course.course_id} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: course.color }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {course.course_code}
            </Typography>
          </Stack>
        ))}
      </Box>

      {/* Session detail dialog */}
      <Dialog
        open={!!detailSession}
        onClose={() => setDetailSession(null)}
        maxWidth="xs"
        fullWidth
      >
        {detailSession && (() => {
          const assignment = assignmentMap[detailSession.assignment_id];
          const course = assignment ? courseMap[assignment.course_id] : null;
          const start = new Date(detailSession.scheduled_start);
          const end = new Date(detailSession.scheduled_end);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

          return (
            <>
              <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
                Study Session
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {course && (
                      <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: course.color }} />
                    )}
                    <Chip label={course?.course_code} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {assignment?.title || 'Study Session'}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2">
                      {start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2">
                      {formatTime(start.toTimeString().slice(0, 5))} – {formatTime(end.toTimeString().slice(0, 5))} ({duration.toFixed(1)}h)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2">
                      {course?.course_name}
                    </Typography>
                  </Box>
                  {assignment && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Assignment Progress
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={assignment.completion_percentage}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {assignment.completion_percentage}%
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                {detailSession.status === 'scheduled' && (
                  <>
                    <Button
                      startIcon={<CheckCircle />}
                      color="success"
                      variant="contained"
                      onClick={() => handleToggleStatus(detailSession.session_id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      color="error"
                      variant="outlined"
                      onClick={() => handleToggleStatus(detailSession.session_id, 'incomplete')}
                    >
                      Mark Incomplete
                    </Button>
                  </>
                )}
                {detailSession.status === 'completed' && (
                  <Button
                    startIcon={<Cancel />}
                    color="warning"
                    variant="outlined"
                    onClick={() => handleToggleStatus(detailSession.session_id, 'scheduled')}
                  >
                    Revert to Scheduled
                  </Button>
                )}
                {detailSession.status === 'incomplete' && (
                  <Button
                    startIcon={<CheckCircle />}
                    color="success"
                    variant="contained"
                    onClick={() => handleToggleStatus(detailSession.session_id, 'completed')}
                  >
                    Mark Complete
                  </Button>
                )}
                <Button onClick={() => setDetailSession(null)} color="inherit">
                  Close
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}
