import React from 'react';
import { ViewType } from './index';
import DayView from './views/DayView';
import WeekView from './views/WeekView';
import MonthView from './views/MonthView';
import YearView from './views/YearView';
import AgendaView from './views/AgendaView';
import { useCalendar } from '../../contexts/CalendarContext';

interface CalendarViewProps {
  view: ViewType;
  selectedDate: Date;
  onEventClick: (event: any) => void;
  onDateSelect: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  view,
  selectedDate,
  onEventClick,
  onDateSelect
}) => {
  const { events } = useCalendar();

  const renderView = () => {
    switch (view) {
      case 'day':
        return (
          <DayView
            selectedDate={selectedDate}
            events={events}
            onEventClick={onEventClick}
            onDateSelect={onDateSelect}
          />
        );
      case 'week':
        return (
          <WeekView
            selectedDate={selectedDate}
            events={events}
            onEventClick={onEventClick}
            onDateSelect={onDateSelect}
          />
        );
      case 'month':
        return (
          <MonthView
            selectedDate={selectedDate}
            events={events}
            onEventClick={onEventClick}
            onDateSelect={onDateSelect}
          />
        );
      case 'year':
        return (
          <YearView
            selectedDate={selectedDate}
            events={events}
            onEventClick={onEventClick}
            onDateSelect={onDateSelect}
          />
        );
      case 'agenda':
        return (
          <AgendaView
            selectedDate={selectedDate}
            events={events}
            onEventClick={onEventClick}
            onDateSelect={onDateSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-auto">
      {renderView()}
    </div>
  );
};

export default CalendarView; 