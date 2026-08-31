import { useState } from 'react';
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
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add,
  Delete,
  Schedule,
  Info,
  AccessTime,
} from '@mui/icons-material';
import { mockAvailableHours, dayLabels } from '@/data/mockData';
import EmptyState from '@/components/EmptyState';
import { formatTime, timeToMinutes, minutesToTime } from '@/utils/helpers';

interface AvailableBlock {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

const TIME_SLOTS: string[] = [];
for (let h = 7; h <= 22; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

const HOUR_HEIGHT = 28;

export default function Availability() {
  const [blocks, setBlocks] = useState<AvailableBlock[]>(mockAvailableHours as AvailableBlock[]);
  const [dragStart, setDragStart] = useState<{ day: number; slot: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const isSlotInBlock = (day: number, slotIndex: number): boolean => {
    const slotTime = TIME_SLOTS[slotIndex];
    const slotMinutes = timeToMinutes(slotTime);
    return blocks.some((b) => {
      if (b.day_of_week !== day) return false;
      const start = timeToMinutes(b.start_time);
      const end = timeToMinutes(b.end_time);
      return slotMinutes >= start && slotMinutes < end;
    });
  };

  const isSlotInDrag = (day: number, slotIndex: number): boolean => {
    if (!dragStart || dragStart.day !== day) return false;
    if (dragEnd === null) return slotIndex === dragStart.slot;
    const min = Math.min(dragStart.slot, dragEnd);
    const max = Math.max(dragStart.slot, dragEnd);
    return slotIndex >= min && slotIndex <= max;
  };

  const handleMouseDown = (day: number, slot: number) => {
    setDragStart({ day, slot });
    setDragEnd(slot);
  };

  const handleMouseEnter = (day: number, slot: number) => {
    if (dragStart && dragStart.day === day) {
      setDragEnd(slot);
    }
  };

  const handleMouseUp = () => {
    if (dragStart && dragEnd !== null) {
      const minSlot = Math.min(dragStart.slot, dragEnd);
      const maxSlot = Math.max(dragStart.slot, dragEnd);
      const startTime = TIME_SLOTS[minSlot];
      const endTime = minutesToTime(timeToMinutes(TIME_SLOTS[maxSlot]) + 30);
      addBlock(dragStart.day, startTime, endTime);
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const addBlock = (day: number, startTime: string, endTime: string) => {
    const newBlock: AvailableBlock = { day_of_week: day, start_time: startTime, end_time: endTime };
    setBlocks((prev) => {
      const dayBlocks = prev.filter((b) => b.day_of_week === day);
      const others = prev.filter((b) => b.day_of_week !== day);

      // Merge overlapping/adjacent blocks
      let merged = [...dayBlocks, newBlock].sort((a, b) =>
        timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
      );

      const result: AvailableBlock[] = [];
      for (const block of merged) {
        const last = result[result.length - 1];
        if (last && timeToMinutes(block.start_time) <= timeToMinutes(last.end_time)) {
          last.end_time = block.end_time > last.end_time ? block.end_time : last.end_time;
        } else {
          result.push({ ...block });
        }
      }
      return [...others, ...result];
    });
  };

  const removeBlock = (day: number, index: number) => {
    setBlocks((prev) => {
      const dayBlocks = prev.filter((b) => b.day_of_week === day);
      const others = prev.filter((b) => b.day_of_week !== day);
      dayBlocks.splice(index, 1);
      return [...others, ...dayBlocks];
    });
  };

  const getDayBlocks = (day: number): AvailableBlock[] =>
    blocks.filter((b) => b.day_of_week === day).sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  const totalHours = blocks.reduce((sum, b) => {
    return sum + (timeToMinutes(b.end_time) - timeToMinutes(b.start_time)) / 60;
  }, 0);

  return (
    <Box onMouseUp={handleMouseUp}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Available Hours
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Click and drag on the grid to mark when you're free to study.
          </Typography>
        </Box>
        <Chip
          icon={<AccessTime />}
          label={`${totalHours.toFixed(1)} hours/week available`}
          color="primary"
          variant="outlined"
          sx={{ fontSize: '0.875rem', py: 2, px: 1 }}
        />
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<Info />}>
        Drag across time slots to add availability. Click the X on a block to remove it. Your study plan uses these hours.
      </Alert>

      {blocks.length === 0 ? (
        <EmptyState
          icon={<Schedule sx={{ fontSize: 56 }} />}
          title="No availability set"
          message="Drag across the weekly grid to mark your free time. The scheduling algorithm needs this to generate your study plan."
        />
      ) : (
        <Card>
          <CardContent sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 700 }}>
              {/* Day headers */}
              <Grid container spacing={0}>
                <Grid item xs={1} sx={{ minWidth: 60 }}>
                  <Box sx={{ height: 36 }} />
                </Grid>
                {dayLabels.map((day) => (
                  <Grid item xs key={day} sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      align="center"
                      sx={{ fontWeight: 600, py: 1, color: 'text.secondary' }}
                    >
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Time grid */}
              <Grid container spacing={0} sx={{ position: 'relative' }}>
                {/* Time labels column */}
                <Grid item xs={1} sx={{ minWidth: 60 }}>
                  <Box sx={{ position: 'relative' }}>
                    {TIME_SLOTS.filter((_, i) => i % 2 === 0).map((time, i) => (
                      <Typography
                        key={time}
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          top: i * HOUR_HEIGHT * 2 - 8,
                          right: 8,
                          color: 'text.secondary',
                          fontSize: '0.7rem',
                        }}
                      >
                        {formatTime(time)}
                      </Typography>
                    ))}
                    <Box sx={{ height: TIME_SLOTS.length * (HOUR_HEIGHT / 2) }} />
                  </Box>
                </Grid>

                {/* Day columns */}
                {dayLabels.map((_, dayIdx) => (
                  <Grid item xs key={dayIdx} sx={{ flex: 1, position: 'relative' }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        position: 'relative',
                        height: TIME_SLOTS.length * (HOUR_HEIGHT / 2),
                        cursor: 'crosshair',
                        userSelect: 'none',
                        bgcolor: 'background.default',
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedDay(dayIdx);
                      }}
                    >
                      {/* Time slot lines */}
                      {TIME_SLOTS.map((_, slotIdx) => (
                        <Box
                          key={slotIdx}
                          onMouseDown={() => handleMouseDown(dayIdx, slotIdx)}
                          onMouseEnter={() => handleMouseEnter(dayIdx, slotIdx)}
                          sx={{
                            height: HOUR_HEIGHT / 2,
                            borderBottom: slotIdx % 2 === 1 ? '1px solid' : '1px dashed',
                            borderColor: slotIdx % 2 === 1 ? 'divider' : 'action.hover',
                            bgcolor: isSlotInBlock(dayIdx, slotIdx)
                              ? 'primary.main'
                              : isSlotInDrag(dayIdx, slotIdx)
                              ? 'primary.light'
                              : 'transparent',
                            opacity: isSlotInBlock(dayIdx, slotIdx) || isSlotInDrag(dayIdx, slotIdx) ? 0.7 : 1,
                            transition: 'background-color 0.1s',
                            '&:hover': {
                              bgcolor: isSlotInBlock(dayIdx, slotIdx) ? 'primary.main' : 'action.hover',
                            },
                          }}
                        />
                      ))}

                      {/* Render block labels */}
                      {getDayBlocks(dayIdx).map((block, blockIdx) => {
                        const startSlot = TIME_SLOTS.indexOf(block.start_time);
                        const endSlot = TIME_SLOTS.findIndex(
                          (t) => timeToMinutes(t) >= timeToMinutes(block.end_time)
                        );
                        const top = startSlot * (HOUR_HEIGHT / 2);
                        const height = (endSlot === -1 ? TIME_SLOTS.length : endSlot) * (HOUR_HEIGHT / 2) - top;
                        return (
                          <Box
                            key={blockIdx}
                            sx={{
                              position: 'absolute',
                              top: top + 2,
                              left: 2,
                              right: 2,
                              height: height - 4,
                              bgcolor: 'primary.main',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              px: 1,
                              color: '#fff',
                              pointerEvents: 'none',
                            }}
                          >
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                              {formatTime(block.start_time)} – {formatTime(block.end_time)}
                            </Typography>
                            <IconButton
                              size="small"
                              sx={{
                                p: 0.25,
                                color: '#fff',
                                pointerEvents: 'auto',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBlock(dayIdx, blockIdx);
                              }}
                            >
                              <Delete sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Summary of blocks */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Availability Summary
          </Typography>
          <Grid container spacing={2}>
            {dayLabels.map((day, dayIdx) => {
              const dayBlocks = getDayBlocks(dayIdx);
              const hours = dayBlocks.reduce(
                (sum, b) => sum + (timeToMinutes(b.end_time) - timeToMinutes(b.start_time)) / 60,
                0
              );
              return (
                <Grid item xs={12} sm={6} md={3} key={dayIdx}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {day}
                    </Typography>
                    {dayBlocks.length === 0 ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                        No availability
                      </Typography>
                    ) : (
                      <Stack spacing={0.5}>
                        {dayBlocks.map((b, i) => (
                          <Chip
                            key={i}
                            label={`${formatTime(b.start_time)} – ${formatTime(b.end_time)}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {hours.toFixed(1)} hours total
                        </Typography>
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
