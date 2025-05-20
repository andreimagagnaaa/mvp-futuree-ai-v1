import React, { useMemo, useState, useEffect } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ViewType } from './index';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon,
  ViewColumnsIcon,
  TableCellsIcon,
  ListBulletIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface CalendarHeaderProps {
  view: ViewType;
  selectedDate: Date;
  onViewChange: (view: ViewType) => void;
  onDateChange: (date: Date) => void;
  onNewEvent: () => void;
  onToggleMiniCalendar: () => void;
}

const allViewOptions: Array<{ value: ViewType; label: string; icon: React.ComponentType<any>; mobileVisible?: boolean }> = [
  { value: 'day', label: 'Dia', icon: CalendarIcon, mobileVisible: false },
  { value: 'week', label: 'Semana', icon: ViewColumnsIcon, mobileVisible: false },
  { value: 'month', label: 'Mês', icon: TableCellsIcon, mobileVisible: true },
  { value: 'year', label: 'Ano', icon: CalendarDaysIcon, mobileVisible: false },
  { value: 'agenda', label: 'Agenda', icon: ListBulletIcon, mobileVisible: true }
];

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  view,
  selectedDate,
  onViewChange,
  onDateChange,
  onNewEvent,
  onToggleMiniCalendar
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      
      // Se estiver em modo mobile e a visualização atual não está disponível,
      // muda para a visualização de mês
      if (mobile && !allViewOptions.find(opt => opt.value === view)?.mobileVisible) {
        onViewChange('month');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view, onViewChange]);

  const viewOptions = useMemo(() => {
    return allViewOptions.filter(option => !isMobile || option.mobileVisible);
  }, [isMobile]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const modifier = direction === 'prev' ? -1 : 1;
    switch (view) {
      case 'day':
        onDateChange(direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1));
        break;
      case 'week':
        onDateChange(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1));
        break;
      case 'month':
        onDateChange(direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
        break;
      case 'year':
        onDateChange(new Date(selectedDate.getFullYear() + modifier, selectedDate.getMonth(), 1));
        break;
      default:
        onDateChange(direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1));
    }
  };

  const formatDateRange = () => {
    switch (view) {
      case 'day':
        return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        return `Semana de ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`;
      case 'month':
        return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'year':
        return format(selectedDate, 'yyyy');
      default:
        return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <button
          onClick={onNewEvent}
          className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Novo Evento</span>
          <span className="sm:hidden">Novo</span>
        </button>

        <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700">
          {viewOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onViewChange(value)}
              className={`px-2 sm:px-3 py-2 text-sm font-medium ${
                view === value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Botão do Mini Calendário (apenas mobile) */}
        <button
          onClick={onToggleMiniCalendar}
          className="lg:hidden inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <CalendarDaysIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Hoje
          </button>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white whitespace-nowrap">
          {formatDateRange()}
        </span>
      </div>
    </div>
  );
};

export default CalendarHeader; 