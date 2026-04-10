import React, { useState } from 'react';
import './WorkspaceModules.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const VIEWS = ['Month', 'Week', 'Day'];

const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const WorkspaceCalendar = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [calView, setCalView] = useState('Month');

  const cells = getCalendarDays(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="wsm-page">
      <div className="wsm-page-header">
        <div>
          <h1 className="wsm-page-title">Calendar</h1>
          <p className="wsm-page-sub">Team calendar for events, tasks, and milestones.</p>
        </div>
        <button className="wsm-btn-primary">+ New Event</button>
      </div>

      <div className="wsm-cal-controls">
        <button className="wsm-btn-secondary" onClick={prevMonth}>←</button>
        <span className="wsm-cal-title">{MONTHS[month]} {year}</span>
        <button className="wsm-btn-secondary" onClick={nextMonth}>→</button>
        <div className="wsm-chips wsm-cal-view-chips">
          {VIEWS.map(v => (
            <button key={v} className={`wsm-chip${calView === v ? ' active' : ''}`} onClick={() => setCalView(v)}>{v}</button>
          ))}
        </div>
      </div>

      <div className="wsm-section">
        <div className="wsm-cal-grid">
          {DAYS.map(d => (
            <div key={d} className="wsm-cal-day-label">{d}</div>
          ))}
          {cells.map((day, i) => (
            <div
              key={i}
              className={`wsm-cal-cell${day ? ' wsm-cal-cell-filled' : ''}${day === today.getDate() && month === today.getMonth() && year === today.getFullYear() ? ' wsm-cal-cell-today' : ''}`}
            >
              {day || ''}
            </div>
          ))}
        </div>
      </div>

      <div className="wsm-permission-note">
        <strong>Permission rules:</strong> Members and above can create events. Viewers can only view the calendar.
      </div>
    </div>
  );
};

export default WorkspaceCalendar;
