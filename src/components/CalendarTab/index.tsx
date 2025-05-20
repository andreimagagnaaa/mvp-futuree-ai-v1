import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CalendarHeader from './CalendarHeader';
import CalendarView from './CalendarView';
import EventModal from './EventModal';
import MiniCalendar from './MiniCalendar';
import { CalendarProvider } from '../../contexts/CalendarContext';

export type ViewType = 'day' | 'week' | 'month' | 'year' | 'agenda';

const CalendarContent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const toggleMiniCalendar = () => {
    setShowMiniCalendar(!showMiniCalendar);
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Calendário
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Gerencie sua agenda e compromissos em um só lugar
              </p>
            </div>
            <CalendarHeader
              view={view}
              selectedDate={selectedDate}
              onViewChange={handleViewChange}
              onDateChange={handleDateChange}
              onNewEvent={handleNewEvent}
              onToggleMiniCalendar={toggleMiniCalendar}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex h-full gap-4">
            {/* Mini Calendário para Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <MiniCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateChange}
                />
              </div>
            </div>

            {/* Mini Calendário para Mobile (Drawer) */}
            {showMiniCalendar && (
              <div className="lg:hidden fixed inset-0 z-40">
                <div
                  className="fixed inset-0 bg-black bg-opacity-25"
                  onClick={toggleMiniCalendar}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl shadow-lg p-4 transform transition-transform duration-300">
                  <div className="mb-4">
                    <button
                      onClick={toggleMiniCalendar}
                      className="float-right text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <span className="sr-only">Fechar</span>
                      ×
                    </button>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Calendário
                    </h3>
                  </div>
                  <MiniCalendar
                    selectedDate={selectedDate}
                    onDateSelect={(date) => {
                      handleDateChange(date);
                      toggleMiniCalendar();
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <CalendarView
                view={view}
                selectedDate={selectedDate}
                onEventClick={handleEventClick}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setShowEventModal(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {showEventModal && (
        <EventModal
          event={selectedEvent}
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

const CalendarTab: React.FC = () => {
  return (
    <CalendarProvider>
      <CalendarContent />
    </CalendarProvider>
  );
};

export default CalendarTab; 