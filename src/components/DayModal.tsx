import { StudySession } from '../types';
import { formatDuration, formatDurationShort } from '../utils/time';
import { X, Play, Trash2, BookOpen, Clock, Target, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface DayModalProps {
  date: string; // YYYY-MM-DD
  sessions: StudySession[];
  activeSession: StudySession | null;
  onClose: () => void;
  onStart: (date: string, subject: string) => void;
  onStop: () => void;
  onDelete: (id: string) => void;
}

export function DayModal({ date, sessions, activeSession, onClose, onStart, onStop, onDelete }: DayModalProps) {
  const daySessions = sessions.filter(s => s.date === date);
  const isActiveToday = activeSession?.date === date;
  
  const [elapsed, setElapsed] = useState(isActiveToday && activeSession ? Date.now() - activeSession.startTime : 0);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (!isActiveToday || !activeSession) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - activeSession.startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActiveToday, activeSession]);

  const totalMs = daySessions.reduce((acc, s) => acc + s.duration, 0);
  const totalIncludingActive = totalMs + (isActiveToday ? elapsed : 0);
  const sessionCount = daySessions.length + (isActiveToday ? 1 : 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] w-full max-w-4xl overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] max-h-full"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#0A0A0A] to-[#111]">
          <div>
            <h2 className="font-display text-2xl md:text-3xl uppercase tracking-widest text-white">{date}</h2>
            <p className="text-[#0055FF] font-bold text-sm tracking-widest uppercase mt-1">Detalhes do Dia</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Column: Timer / Start Action */}
          <div className="p-6 md:p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center items-center bg-[#050505]">
            {isActiveToday && activeSession ? (
              <div className="flex flex-col items-center w-full">
                <div className="relative flex items-center justify-center mb-12 mt-4">
                  {/* Pulsing rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-[#0055FF] animate-ping opacity-20"></div>
                  <div className="absolute inset-[-20px] rounded-full border border-[#0055FF] animate-pulse opacity-10"></div>
                  
                  <div className="relative bg-gradient-to-b from-[#001a4d] to-[#000] border border-[#0055FF]/30 w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,85,255,0.2)]">
                    <span className="text-[#88BBFF] text-xs uppercase tracking-widest font-bold mb-2">{activeSession.subject || 'Estudo Geral'}</span>
                    <span className="font-mono text-5xl font-bold text-white">{formatDuration(elapsed)}</span>
                    <Activity className="text-[#0055FF] mt-4 animate-pulse" size={24} />
                  </div>
                </div>
                <button 
                  onClick={onStop}
                  className="w-full max-w-xs bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 font-bold py-4 rounded-2xl uppercase tracking-widest transition-all"
                >
                  Encerrar Sessão
                </button>
              </div>
            ) : (
              <div className="w-full max-w-xs flex flex-col items-center">
                <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-6 border border-white/5">
                  <Clock size={40} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-display uppercase tracking-widest mb-6 text-center">Nova Sessão</h3>
                
                <input 
                  type="text" 
                  placeholder="O que vai estudar?" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#0055FF] transition-colors mb-6 text-center"
                />
                
                <button 
                  onClick={() => onStart(date, subject || 'Estudo Geral')}
                  disabled={!!activeSession}
                  className="w-full bg-[#0055FF] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,85,255,0.3)] hover:shadow-[0_0_30px_rgba(0,85,255,0.5)]"
                >
                  <Play size={20} fill="currentColor" />
                  {activeSession ? 'Ocupado' : 'Iniciar'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Stats & History */}
          <div className="p-6 md:p-8 md:w-1/2 flex flex-col bg-[#0A0A0A] overflow-y-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Target size={16} />
                  <span className="text-xs uppercase tracking-widest font-bold">Total</span>
                </div>
                <p className="font-mono text-xl text-white">{formatDurationShort(totalIncludingActive)}</p>
              </div>
              <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <BookOpen size={16} />
                  <span className="text-xs uppercase tracking-widest font-bold">Sessões</span>
                </div>
                <p className="font-mono text-xl text-white">{sessionCount}</p>
              </div>
            </div>

            <h3 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4 flex items-center gap-2">
              <Clock size={16} />
              Histórico
            </h3>
            
            <div className="space-y-3 flex-1">
              {daySessions.length === 0 && !isActiveToday ? (
                <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-gray-600 text-sm uppercase tracking-widest">Nenhum registro</p>
                </div>
              ) : (
                <>
                  {isActiveToday && activeSession && (
                    <div className="bg-gradient-to-r from-[#0055FF]/20 to-transparent border-l-4 border-[#0055FF] rounded-r-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[#88BBFF] text-sm uppercase tracking-wider mb-1">{activeSession.subject || 'Estudo Geral'}</p>
                        <p className="font-mono text-lg text-white">{formatDuration(elapsed)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0055FF] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0055FF]"></span>
                        </span>
                        <span className="text-xs text-[#0055FF] uppercase tracking-widest font-bold">Ativo</span>
                      </div>
                    </div>
                  )}
                  {daySessions.slice().reverse().map(session => (
                    <div key={session.id} className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 flex justify-between items-center group hover:border-white/10 transition-colors">
                      <div>
                        <p className="font-bold text-gray-300 text-sm uppercase tracking-wider mb-1">{session.subject || 'Estudo Geral'}</p>
                        <div className="flex items-baseline gap-3">
                          <p className="font-mono text-lg text-white">{formatDuration(session.duration)}</p>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {session.endTime ? new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onDelete(session.id)}
                        className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-black/20 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
