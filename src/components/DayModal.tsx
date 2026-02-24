import { StudySession } from '../types';
import { formatDuration, formatDurationShort } from '../utils/time';
import { X, Play, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DayModalProps {
  date: string; // YYYY-MM-DD
  sessions: StudySession[];
  activeSession: StudySession | null;
  onClose: () => void;
  onStart: (date: string) => void;
  onStop: () => void;
  onDelete: (id: string) => void;
}

export function DayModal({ date, sessions, activeSession, onClose, onStart, onStop, onDelete }: DayModalProps) {
  const daySessions = sessions.filter(s => s.date === date);
  const totalMs = daySessions.reduce((acc, s) => acc + s.duration, 0);
  
  const isActiveToday = activeSession?.date === date;

  const [elapsed, setElapsed] = useState(isActiveToday && activeSession ? Date.now() - activeSession.startTime : 0);

  useEffect(() => {
    if (!isActiveToday || !activeSession) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - activeSession.startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActiveToday, activeSession]);

  const totalIncludingActive = totalMs + (isActiveToday ? elapsed : 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="font-display text-xl uppercase tracking-wider">{date}</h2>
            <p className="text-gray-400 text-sm mt-1">Total: {formatDurationShort(totalIncludingActive)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {isActiveToday && activeSession ? (
            <div className="mb-8 bg-[#0055FF]/10 border border-[#0055FF]/30 rounded-2xl p-6 flex flex-col items-center">
              <span className="text-[#0055FF] text-xs uppercase tracking-widest font-bold mb-2">Cronômetro Rodando</span>
              <span className="font-mono text-5xl font-bold text-white mb-6">{formatDuration(elapsed)}</span>
              <button 
                onClick={onStop}
                className="w-full bg-[#0055FF] hover:bg-blue-600 text-white font-bold py-4 rounded-xl uppercase tracking-wider transition-colors"
              >
                Parar Sessão
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onStart(date)}
              disabled={!!activeSession}
              className="w-full mb-8 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <Play size={20} />
              {activeSession ? 'Outra sessão em andamento' : 'Iniciar Estudo'}
            </button>
          )}

          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-widest text-gray-500 font-bold">Histórico do Dia</h3>
            {daySessions.length === 0 ? (
              <p className="text-gray-600 text-sm italic">Nenhuma sessão registrada neste dia.</p>
            ) : (
              daySessions.map(session => (
                <div key={session.id} className="bg-[#1A1A1A] rounded-xl p-4 flex justify-between items-center group">
                  <div>
                    <p className="font-mono text-lg">{formatDuration(session.duration)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.startTime).toLocaleTimeString()} - {session.endTime ? new Date(session.endTime).toLocaleTimeString() : 'Em andamento'}
                    </p>
                  </div>
                  <button 
                    onClick={() => onDelete(session.id)}
                    className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
