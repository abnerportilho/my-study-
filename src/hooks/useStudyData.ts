import { useState, useEffect } from 'react';
import { StudySession } from '../types';

export function useStudyData() {
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('chronos_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSession, setActiveSession] = useState<StudySession | null>(() => {
    const saved = localStorage.getItem('chronos_active_session');
    return saved ? JSON.parse(saved) : null;
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

  const startSession = (date: string) => {
    if (activeSession) return;
    const newSession: StudySession = {
      id: Date.now().toString(),
      date,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
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
