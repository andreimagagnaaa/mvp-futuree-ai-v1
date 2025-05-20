import React from 'react';
import { format, addDays, startOfWeek, addHours, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '../../../contexts/CalendarContext';

interface WeekViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  selectedDate,
  events,
  onEventClick,
  onDateSelect
}) => {
  const weekStart = startOfWeek(selectedDate, { locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = addHours(startOfDay(selectedDate), i);
    return {
      time: format(hour, 'HH:mm', { locale: ptBR }),
      date: hour
    };
  });

  const getWeekEvents = () => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventWeekStart = startOfWeek(eventStart, { locale: ptBR });
      const selectedWeekStart = startOfWeek(selectedDate, { locale: ptBR });
      return format(eventWeekStart, 'yyyy-MM-dd') === format(selectedWeekStart, 'yyyy-MM-dd');
    });
  };

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // duração em horas
    const dayIndex = weekDays.findIndex(day => 
      format(day, 'yyyy-MM-dd') === format(start, 'yyyy-MM-dd')
    );
    
    return {
      top: `${startHour * 60}px`,
      height: `${duration * 60}px`,
      left: `${(dayIndex / 7) * 100}%`,
      width: '14.285%' // 100/7
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho dos dias da semana */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <div className="w-16" /> {/* Espaço para as horas */}
        {weekDays.map(day => (
          <div
            key={day.toString()}
            className="flex-1 text-center py-2"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {format(day, 'EEE', { locale: ptBR })}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {format(day, 'd', { locale: ptBR })}
            </div>
          </div>
        ))}
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
                <div className="w-16 pr-2 text-right text-sm text-gray-500 dark:text-gray-400">
                  {time}
                </div>
                <div className="flex-1 flex">
                  {weekDays.map(day => (
                    <div
                      key={day.toString()}
                      className="flex-1 relative border-l border-gray-200 dark:border-gray-700 first:border-l-0"
                      onClick={() => {
                        const clickedDate = new Date(day);
                        clickedDate.setHours(date.getHours());
                        clickedDate.setMinutes(date.getMinutes());
                        onDateSelect(clickedDate);
                      }}
                    >
                      <div className="absolute inset-0 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors duration-100" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Eventos */}
          <div className="absolute top-0 left-16 right-0">
            {getWeekEvents().map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="absolute mx-1 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-800/30 cursor-pointer transition-colors duration-100"
                style={getEventPosition(event)}
              >
                <div className="text-xs font-medium text-blue-900 dark:text-blue-100 truncate">
                  {event.title}
                </div>
                {event.location && (
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-0.5 truncate">
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

export default WeekView; 