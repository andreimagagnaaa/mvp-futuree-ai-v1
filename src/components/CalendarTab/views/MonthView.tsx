import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '../../../contexts/CalendarContext';

interface MonthViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  selectedDate,
  events,
  onEventClick,
  onDateSelect
}) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      return isSameDay(eventStart, day);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {weekDays.map(day => (
          <div
            key={day}
            className="py-2 text-sm font-medium text-gray-500 dark:text-gray-400 text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grade do calendário */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-gray-200 dark:bg-gray-700">
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toString()}
              className={`min-h-[100px] bg-white dark:bg-gray-800 p-1 ${
                !isCurrentMonth && 'bg-gray-50 dark:bg-gray-900'
              }`}
              onClick={() => onDateSelect(day)}
            >
              <div className="flex items-center justify-center h-6">
                <span
                  className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday && 'bg-blue-600 text-white'}
                    ${!isToday && isCurrentMonth && 'text-gray-900 dark:text-white'}
                    ${!isCurrentMonth && 'text-gray-400 dark:text-gray-600'}
                  `}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-1 mt-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="px-2 py-1 text-xs rounded-md bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-800/30 cursor-pointer truncate"
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView; 