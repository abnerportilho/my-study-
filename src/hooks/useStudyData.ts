import { useState, useEffect } from 'react';
import { StudySession } from '../types';

const DEFAULT_SESSIONS: StudySession[] = [
  {
    id: 'mock-1',
    date: '2026-02-24',
    startTime: new Date('2026-02-24T10:00:00').getTime(),
    endTime: new Date('2026-02-24T11:30:00').getTime(),
    duration: 90 * 60 * 1000, // 1h 30m
    subject: 'Lógica de Programação'
  },
  {
    id: 'mock-2',
    date: '2026-02-25',
    startTime: new Date('2026-02-25T14:00:00').getTime(),
    endTime: new Date('2026-02-25T15:14:00').getTime(),
    duration: 74 * 60 * 1000, // 1h 14m
    subject: 'React & TypeScript'
  }
];

export function useStudyData() {
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem('chronos_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : DEFAULT_SESSIONS;
      }
    } catch (e) {
      console.error('Failed to parse sessions', e);
    }
    return DEFAULT_SESSIONS;
  });

  const [activeSession, setActiveSession] = useState<StudySession | null>(() => {
    try {
      const saved = localStorage.getItem('chronos_active_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse active session', e);
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('chronos_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('chronos_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('chronos_active_session');
    }
  }, [activeSession]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'chronos_sessions' && e.newValue) {
        setSessions(JSON.parse(e.newValue));
      }
      if (e.key === 'chronos_active_session') {
        setActiveSession(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const startSession = (date: string, subject: string = 'Estudo Geral') => {
    if (activeSession) return;
    const newSession: StudySession = {
      id: Date.now().toString(),
      date,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      subject,
    };
    setActiveSession(newSession);
  };

  const stopSession = () => {
    if (!activeSession) return;
    const endTime = Date.now();
    const duration = endTime - activeSession.startTime;
    const completedSession = { ...activeSession, endTime, duration };
    setSessions(prev => [...prev, completedSession]);
    setActiveSession(null);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return { sessions, activeSession, startSession, stopSession, deleteSession };
}
