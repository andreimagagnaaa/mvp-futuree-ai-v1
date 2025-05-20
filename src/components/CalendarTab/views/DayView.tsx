import React from 'react';
import { format, addHours, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '../../../contexts/CalendarContext';

interface DayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect: (date: Date) => void;
}

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  events,
  onEventClick,
  onDateSelect
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = addHours(startOfDay(selectedDate), i);
    return {
      time: format(hour, 'HH:mm', { locale: ptBR }),
      date: hour
    };
  });

  const getDayEvents = () => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      return format(eventStart, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    });
  };

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // duração em horas
    
    return {
      top: `${startHour * 60}px`,
      height: `${duration * 60}px`
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho do dia atual - visível apenas em mobile */}
      <div className="sm:hidden px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="relative min-h-full">
          {/* Grade de horas */}
          <div className="absolute top-0 left-0 w-full">
            {hours.map(({ time, date }) => (
              <div
                key={time}
                className="flex border-t border-gray-200 dark:border-gray-700"
                style={{ height: '60px' }}
              >
                <div className="w-12 sm:w-16 pr-2 text-right text-xs sm:text-sm text-gray-500 dark:text-gray-400 select-none">
                  {time}
                </div>
                <div
                  className="flex-1 relative"
                  onClick={() => onDateSelect(date)}
                >
                  <div className="absolute inset-0 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors duration-100" />
                </div>
              </div>
            ))}
          </div>

          {/* Eventos */}
          <div className="absolute top-0 left-12 sm:left-16 right-0">
            {getDayEvents().map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="absolute left-0 right-0 mx-1 sm:mx-2 p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-800/30 cursor-pointer transition-colors duration-100 overflow-hidden"
                style={getEventPosition(event)}
              >
                <div className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
                  {event.title}
                </div>
                {event.location && (
                  <div className="hidden sm:block text-xs text-blue-700 dark:text-blue-300 mt-1 truncate">
                    {event.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView; 