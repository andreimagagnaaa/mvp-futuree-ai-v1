import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCalendar } from '../../contexts/CalendarContext';
import { CalendarEvent } from '../../contexts/CalendarContext';

interface EventModalProps {
  event?: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  selectedDate
}) => {
  const { addEvent, updateEvent, deleteEvent, categories } = useCalendar();
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    start: selectedDate,
    end: selectedDate,
    allDay: false,
    category: categories[0]?.id,
    location: '',
    isPrivate: false,
    notes: ''
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      });
    } else {
      setFormData({
        title: '',
        description: '',
        start: selectedDate,
        end: selectedDate,
        allDay: false,
        category: categories[0]?.id,
        location: '',
        isPrivate: false,
        notes: ''
      });
    }
  }, [event, selectedDate, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start || !formData.end) return;

    if (event) {
      updateEvent(event.id, formData);
    } else {
      addEvent(formData as Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onClose();
  };

  const handleDelete = () => {
    if (event) {
      deleteEvent(event.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end sm:items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-xl">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {event ? 'Editar Evento' : 'Novo Evento'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data de Início
                  </label>
                  <input
                    type="datetime-local"
                    value={format(formData.start || selectedDate, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setFormData({ ...formData, start: new Date(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data de Término
                  </label>
                  <input
                    type="datetime-local"
                    value={format(formData.end || selectedDate, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setFormData({ ...formData, end: new Date(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Localização
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Presencial ou link da reunião"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={formData.allDay}
                    onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Dia inteiro
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Evento privado
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
              {event && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Excluir
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {event ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal; 