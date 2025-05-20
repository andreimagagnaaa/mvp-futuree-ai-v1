import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '../../../contexts/CalendarContext';

interface AgendaViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect: (date: Date) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({
  selectedDate,
  events,
  onEventClick
}) => {
  // Agrupa eventos por data
  const groupedEvents = events.reduce((groups, event) => {
    const date = format(new Date(event.start), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, CalendarEvent[]>);

  // Ordena as datas
  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {sortedDates.map(date => {
        const dayEvents = groupedEvents[date];
        const eventDate = new Date(date);
        const isToday = isSameDay(eventDate, new Date());

        return (
          <div key={date} className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`px-2 py-1 rounded-md text-sm font-medium ${
                  isToday
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {format(eventDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </div>
            </div>

            <div className="space-y-2">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-100"
                >
                  <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                    {event.allDay ? (
                      'Dia todo'
                    ) : (
                      format(new Date(event.start), 'HH:mm')
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {event.title}
                    </h3>
                    {event.location && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {event.category && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {event.category}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {sortedDates.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum evento encontrado
          </p>
        </div>
      )}
    </div>
  );
};

export default AgendaView; 