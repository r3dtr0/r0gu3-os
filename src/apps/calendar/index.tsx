import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight,
  X, Trash2
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  color: string;
}

const EVENT_COLORS = [
  { name: 'Cyan', value: '#00f0ff' },
  { name: 'Magenta', value: '#ff00a0' },
  { name: 'Lime', value: '#39ff14' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateId() {
  return Math.random().toString(36).slice(2);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function Calendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('rogue_calendar_events');
      return saved ? JSON.parse(saved) : getDefaultEvents();
    } catch { return getDefaultEvents(); }
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [eventForm, setEventForm] = useState({ title: '', time: '12:00', color: EVENT_COLORS[0].value });

  function getDefaultEvents(): CalendarEvent[] {
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    return [
      { id: generateId(), title: 'Team Standup', date: formatDateKey(y, m, d), time: '09:00', color: '#00f0ff' },
      { id: generateId(), title: 'Code Review', date: formatDateKey(y, m, Math.min(d + 2, getDaysInMonth(y, m))), time: '14:00', color: '#8b5cf6' },
      { id: generateId(), title: 'Lunch with Sarah', date: formatDateKey(y, m, Math.min(d + 5, getDaysInMonth(y, m))), time: '12:30', color: '#39ff14' },
    ];
  }

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('rogue_calendar_events', JSON.stringify(newEvents));
  };

  const navigateMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = useMemo(() => {
    const days: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];
    // Previous month padding
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, month: prevMonth, year: prevYear, isCurrentMonth: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, month: currentMonth, year: currentYear, isCurrentMonth: true });
    }
    // Next month padding
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
    }
    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDay]);

  const getEventsForDate = (dateKey: string): CalendarEvent[] => {
    return events.filter(e => e.date === dateKey).sort((a, b) => a.time.localeCompare(b.time));
  };

  const openAddEvent = (dateKey: string) => {
    setSelectedDate(dateKey);
    setEventForm({ title: '', time: '12:00', color: EVENT_COLORS[0].value });
    setShowEventModal(true);
  };

  const addEvent = () => {
    if (!eventForm.title.trim()) return;
    const newEvent: CalendarEvent = {
      id: generateId(),
      title: eventForm.title.trim(),
      date: selectedDate,
      time: eventForm.time,
      color: eventForm.color,
    };
    saveEvents([...events, newEvent]);
    setShowEventModal(false);
  };

  const deleteEvent = (id: string) => {
    saveEvents(events.filter(e => e.id !== id));
  };

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Mini calendar
  const miniDaysInMonth = getDaysInMonth(currentYear, currentMonth);
  const miniFirstDay = getFirstDayOfMonth(currentYear, currentMonth);

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Sidebar - Mini Calendar & Events */}
      <div className="w-64 flex flex-col border-r flex-shrink-0" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        {/* Mini Calendar */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{MONTHS[currentMonth]} {currentYear}</span>
          </div>
          <div className="grid grid-cols-7 gap-0">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[10px] py-1 font-medium" style={{ color: 'var(--text-muted)' }}>{d}</div>
            ))}
            {Array.from({ length: miniFirstDay }, (_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: miniDaysInMonth }, (_, i) => {
              const day = i + 1;
              const dk = formatDateKey(currentYear, currentMonth, day);
              const hasEvents = getEventsForDate(dk).length > 0;
              const isToday = dk === todayKey;
              return (
                <div
                  key={day}
                  onClick={() => openAddEvent(dk)}
                  className="text-center text-[11px] py-1 cursor-pointer rounded hover:bg-white/5 transition relative"
                  style={{
                    color: isToday ? 'var(--bg-secondary)' : 'var(--text-secondary)',
                    background: isToday ? 'var(--accent-cyan)' : undefined,
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {day}
                  {hasEvents && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: 'var(--accent-cyan)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Upcoming</h3>
          {events
            .filter(e => e.date >= todayKey)
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
            .slice(0, 10)
            .map(event => (
              <div key={event.id} className="flex items-start gap-2 mb-2.5 p-2 rounded" style={{ background: 'var(--bg-secondary)' }}>
                <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: event.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{event.title}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{event.date} @ {event.time}</p>
                </div>
                <button onClick={() => deleteEvent(event.id)} className="p-0.5 rounded hover:bg-red-500/20 flex-shrink-0">
                  <Trash2 size={10} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {MONTHS[currentMonth]} <span style={{ color: 'var(--text-muted)' }}>{currentYear}</span>
            </h1>
            <div className="flex items-center gap-1">
              <button onClick={() => navigateMonth(-1)} className="p-1.5 rounded hover:bg-white/5 transition" style={{ color: 'var(--text-secondary)' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => navigateMonth(1)} className="p-1.5 rounded hover:bg-white/5 transition" style={{ color: 'var(--text-secondary)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1 rounded text-xs border transition hover:bg-white/5"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              Today
            </button>
          </div>

          <div className="flex items-center rounded-md border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
            {(['month', 'week', 'day'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1 text-xs capitalize transition"
                style={{
                  background: view === v ? 'var(--bg-elevated)' : 'transparent',
                  color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          {WEEKDAYS.map(d => (
            <div key={d} className="px-3 py-2 text-xs font-medium text-center" style={{ color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 overflow-y-auto">
          {calendarDays.map((dayInfo, i) => {
            const dk = formatDateKey(dayInfo.year, dayInfo.month, dayInfo.day);
            const dayEvents = getEventsForDate(dk);
            const isToday = dk === todayKey;

            return (
              <div
                key={i}
                onClick={() => openAddEvent(dk)}
                className="border-r border-b min-h-[80px] p-1.5 cursor-pointer transition hover:bg-white/[0.02]"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs w-6 h-6 flex items-center justify-center rounded-full"
                    style={{
                      color: dayInfo.isCurrentMonth ? (isToday ? 'var(--bg-secondary)' : 'var(--text-primary)') : 'var(--text-muted)',
                      background: isToday ? 'var(--accent-cyan)' : undefined,
                      fontWeight: isToday ? 700 : 400,
                      opacity: dayInfo.isCurrentMonth ? 1 : 0.4,
                    }}
                  >
                    {dayInfo.day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[9px] px-1 rounded-full" style={{ background: 'var(--accent-cyan)22', color: 'var(--accent-cyan)' }}>
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map(evt => (
                    <div
                      key={evt.id}
                      className="text-[10px] px-1.5 py-0.5 rounded truncate"
                      style={{
                        background: evt.color + '22',
                        color: evt.color,
                        borderLeft: `2px solid ${evt.color}`,
                      }}
                      onClick={e => { e.stopPropagation(); }}
                    >
                      {evt.time} {evt.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-[9px] px-1" style={{ color: 'var(--text-muted)' }}>+{dayEvents.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-96 rounded-xl border p-5 shadow-2xl" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Add Event — {selectedDate}
              </h3>
              <button onClick={() => setShowEventModal(false)} className="p-1 rounded hover:bg-white/10">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full rounded-md px-3 py-2 text-xs outline-none border"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  placeholder="Event title..."
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && addEvent()}
                />
              </div>

              <div>
                <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Time</label>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                  className="w-full rounded-md px-3 py-2 text-xs outline-none border"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Color</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setEventForm({ ...eventForm, color: c.value })}
                      className="w-6 h-6 rounded-full border-2 transition"
                      style={{
                        background: c.value,
                        borderColor: eventForm.color === c.value ? 'var(--text-primary)' : 'transparent',
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={addEvent}
              className="w-full mt-4 py-2 rounded-md text-xs font-medium transition"
              style={{ background: 'var(--accent-cyan)', color: '#000' }}
            >
              Add Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
