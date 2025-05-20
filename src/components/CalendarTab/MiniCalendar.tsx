import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useCalendar } from '../../contexts/CalendarContext';

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const { events } = useCalendar();

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const startingDayIndex = getDay(startOfMonth(currentMonth));
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const hasEvents = (date: Date) => {
    return events.some(event => 
      isSameDay(new Date(event.start), date) || 
      isSameDay(new Date(event.end), date)
    );
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-medium text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startingDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="h-8" />
        ))}

        {days.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const hasEventOnDay = hasEvents(day);

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`
                h-8 w-full flex items-center justify-center rounded-lg text-sm relative
                ${!isCurrentMonth && 'text-gray-400 dark:text-gray-600'}
                ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isToday
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <span>{format(day, 'd')}</span>
              {hasEventOnDay && !isSelected && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar; 