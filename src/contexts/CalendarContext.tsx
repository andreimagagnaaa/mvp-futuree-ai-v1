import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  category?: string;
  color?: string;
  location?: string;
  isRecurring?: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
  participants?: Array<{
    id: string;
    name: string;
    email: string;
    status: 'pending' | 'accepted' | 'declined' | 'tentative';
  }>;
  reminders?: Array<{
    id: string;
    type: 'email' | 'notification' | 'sms';
    minutes: number;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  isPrivate?: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarContextType {
  events: CalendarEvent[];
  categories: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;
}

const defaultCategories = [
  { id: uuidv4(), name: 'Trabalho', color: '#3B82F6' },
  { id: uuidv4(), name: 'Pessoal', color: '#10B981' },
  { id: uuidv4(), name: 'Importante', color: '#EF4444' },
  { id: uuidv4(), name: 'Reunião', color: '#8B5CF6' },
];

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar deve ser usado dentro de um CalendarProvider');
  }
  return context;
};

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    return savedEvents ? JSON.parse(savedEvents).map((event: any) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt)
    })) : [];
  });

  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('calendarCategories');
    return savedCategories ? JSON.parse(savedCategories) : defaultCategories;
  });

  const saveEvents = useCallback((newEvents: CalendarEvent[]) => {
    localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
    setEvents(newEvents);
  }, []);

  const saveCategories = useCallback((newCategories: typeof defaultCategories) => {
    localStorage.setItem('calendarCategories', JSON.stringify(newCategories));
    setCategories(newCategories);
  }, []);

  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newEvent: CalendarEvent = {
      ...eventData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    saveEvents([...events, newEvent]);
  }, [events, saveEvents]);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    const newEvents = events.map(event => 
      event.id === id ? { ...event, ...updates, updatedAt: new Date() } : event
    );
    saveEvents(newEvents);
  }, [events, saveEvents]);

  const deleteEvent = useCallback((id: string) => {
    const newEvents = events.filter(event => event.id !== id);
    saveEvents(newEvents);
  }, [events, saveEvents]);

  const addCategory = useCallback((name: string, color: string) => {
    const newCategory = { id: uuidv4(), name, color };
    saveCategories([...categories, newCategory]);
  }, [categories, saveCategories]);

  const updateCategory = useCallback((id: string, name: string, color: string) => {
    const newCategories = categories.map(category =>
      category.id === id ? { ...category, name, color } : category
    );
    saveCategories(newCategories);
  }, [categories, saveCategories]);

  const deleteCategory = useCallback((id: string) => {
    const newCategories = categories.filter(category => category.id !== id);
    saveCategories(newCategories);
  }, [categories, saveCategories]);

  return (
    <CalendarContext.Provider
      value={{
        events,
        categories,
        addEvent,
        updateEvent,
        deleteEvent,
        addCategory,
        updateCategory,
        deleteCategory
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}; 