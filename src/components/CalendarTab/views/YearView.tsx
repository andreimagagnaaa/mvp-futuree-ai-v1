import React from 'react';
import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '../../../contexts/CalendarContext';

interface YearViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect: (date: Date) => void;
}

const YearView: React.FC<YearViewProps> = ({
  selectedDate,
  events,
  onEventClick,
  onDateSelect
}) => {
  const yearStart = startOfYear(selectedDate);
  const yearEnd = endOfYear(selectedDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const getMonthDays = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calendarStart = startOfWeek(monthStart, { locale: ptBR });
    const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      return isSameDay(eventStart, day);
    });
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {months.map(month => (
        <div
          key={month.toString()}
          className="space-y-2"
        >
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {format(month, 'MMMM', { locale: ptBR })}
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {/* Cabeçalho dos dias da semana */}
            {weekDays.map(day => (
              <div
                key={day}
                className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center py-1"
              >
                {day}
              </div>
            ))}

            {/* Dias do mês */}
            {getMonthDays(month).map(day => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, month);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  onClick={() => onDateSelect(day)}
                  className={`
                    aspect-square flex items-center justify-center text-[10px] font-medium
                    cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700
                    ${!isCurrentMonth && 'text-gray-400 dark:text-gray-600'}
                    ${isToday && 'bg-blue-600 text-white hover:bg-blue-700'}
                    ${dayEvents.length > 0 && !isToday && 'text-blue-600 dark:text-blue-400'}
                  `}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default YearView; 