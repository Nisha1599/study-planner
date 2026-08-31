// Centralized mock data — swap this file when the real Flask API is ready.
// Field names match the backend schema exactly.

export const mockCourses = [
  { course_id: 1, course_name: 'Data Structures & Algorithms', course_code: 'CS301', color: '#3B82F6' },
  { course_id: 2, course_name: 'Database Systems', course_code: 'CS350', color: '#22C55E' },
  { course_id: 3, course_name: 'Software Engineering', course_code: 'CS380', color: '#F59E0B' },
  { course_id: 4, course_name: 'Linear Algebra', course_code: 'MATH210', color: '#EF4444' },
  { course_id: 5, course_name: 'Technical Writing', course_code: 'ENG150', color: '#8B5CF6' },
];

export const mockAssignments = [
  {
    assignment_id: 1,
    course_id: 1,
    title: 'Binary Search Tree Implementation',
    deadline: '2026-09-05',
    estimated_hours: 6,
    priority: 'high',
    status: 'in_progress',
    completion_percentage: 40,
  },
  {
    assignment_id: 2,
    course_id: 2,
    title: 'ER Diagram for Hospital DB',
    deadline: '2026-09-08',
    estimated_hours: 4,
    priority: 'medium',
    status: 'not_started',
    completion_percentage: 0,
  },
  {
    assignment_id: 3,
    course_id: 3,
    title: 'Sprint 1 Retrospective Report',
    deadline: '2026-09-03',
    estimated_hours: 2,
    priority: 'high',
    status: 'completed',
    completion_percentage: 100,
  },
  {
    assignment_id: 4,
    course_id: 4,
    title: 'Problem Set 3: Eigenvalues',
    deadline: '2026-09-10',
    estimated_hours: 5,
    priority: 'medium',
    status: 'not_started',
    completion_percentage: 0,
  },
  {
    assignment_id: 5,
    course_id: 1,
    title: 'Graph Traversal Lab',
    deadline: '2026-09-12',
    estimated_hours: 3,
    priority: 'low',
    status: 'not_started',
    completion_percentage: 0,
  },
  {
    assignment_id: 6,
    course_id: 5,
    title: 'Research Paper Outline',
    deadline: '2026-09-07',
    estimated_hours: 3,
    priority: 'medium',
    status: 'in_progress',
    completion_percentage: 60,
  },
  {
    assignment_id: 7,
    course_id: 2,
    title: 'SQL Query Optimization Exercise',
    deadline: '2026-09-15',
    estimated_hours: 4,
    priority: 'low',
    status: 'not_started',
    completion_percentage: 0,
  },
  {
    assignment_id: 8,
    course_id: 4,
    title: 'Midterm Exam Review',
    deadline: '2026-09-06',
    estimated_hours: 8,
    priority: 'high',
    status: 'in_progress',
    completion_percentage: 25,
  },
];

export const mockStudySessions = [
  {
    session_id: 1,
    assignment_id: 1,
    scheduled_start: '2026-09-01T09:00',
    scheduled_end: '2026-09-01T11:00',
    status: 'completed',
  },
  {
    session_id: 2,
    assignment_id: 8,
    scheduled_start: '2026-09-01T14:00',
    scheduled_end: '2026-09-01T16:00',
    status: 'completed',
  },
  {
    session_id: 3,
    assignment_id: 2,
    scheduled_start: '2026-09-02T10:00',
    scheduled_end: '2026-09-02T12:00',
    status: 'scheduled',
  },
  {
    session_id: 4,
    assignment_id: 6,
    scheduled_start: '2026-09-02T15:00',
    scheduled_end: '2026-09-02T17:00',
    status: 'scheduled',
  },
  {
    session_id: 5,
    assignment_id: 1,
    scheduled_start: '2026-09-03T09:00',
    scheduled_end: '2026-09-03T11:30',
    status: 'scheduled',
  },
  {
    session_id: 6,
    assignment_id: 4,
    scheduled_start: '2026-09-03T13:00',
    scheduled_end: '2026-09-03T15:00',
    status: 'scheduled',
  },
  {
    session_id: 7,
    assignment_id: 8,
    scheduled_start: '2026-09-04T10:00',
    scheduled_end: '2026-09-04T12:00',
    status: 'scheduled',
  },
  {
    session_id: 8,
    assignment_id: 5,
    scheduled_start: '2026-09-04T14:00',
    scheduled_end: '2026-09-04T16:00',
    status: 'scheduled',
  },
  {
    session_id: 9,
    assignment_id: 2,
    scheduled_start: '2026-09-05T09:00',
    scheduled_end: '2026-09-05T11:00',
    status: 'scheduled',
  },
  {
    session_id: 10,
    assignment_id: 7,
    scheduled_start: '2026-09-05T13:00',
    scheduled_end: '2026-09-05T15:00',
    status: 'incomplete',
  },
];

export const mockAvailableHours = [
  { day_of_week: 0, start_time: '08:00', end_time: '12:00' },
  { day_of_week: 0, start_time: '14:00', end_time: '18:00' },
  { day_of_week: 1, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 2, start_time: '08:00', end_time: '12:00' },
  { day_of_week: 2, start_time: '14:00', end_time: '20:00' },
  { day_of_week: 3, start_time: '09:00', end_time: '16:00' },
  { day_of_week: 4, start_time: '08:00', end_time: '14:00' },
  { day_of_week: 5, start_time: '10:00', end_time: '16:00' },
];

export const mockUser = {
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  avatar: 'AC',
};

export const priorityLabels: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  scheduled: 'Scheduled',
  incomplete: 'Incomplete',
};

export const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const dayShortLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
