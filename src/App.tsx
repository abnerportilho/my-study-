import { useState, useMemo, useEffect } from 'react';
import { useStudyData } from './hooks/useStudyData';
import { ActiveTimer } from './components/ActiveTimer';
import { DayModal } from './components/DayModal';
import { EvolutionChart } from './components/EvolutionChart';
import { formatDurationShort } from './utils/time';
import { AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { StudySession } from './types';

function TotalStudyDisplay({ sessions, activeSession }: { sessions: StudySession[], activeSession: StudySession | null }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const totalYearMs = useMemo(() => {
    const completed = sessions.reduce((acc, s) => acc + s.duration, 0);
    const active = activeSession ? now - activeSession.startTime : 0;
    return completed + active;
  }, [sessions, activeSession, now]);

  return <span className="font-mono text-2xl md:text-3xl font-bold text-white">{formatDurationShort(totalYearMs)}</span>;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function App() {
  const { sessions, activeSession, startSession, stopSession, deleteSession } = useStudyData();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'chart'>('calendar');
  
  const year = 2026;

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach(s => {
      map.set(s.date, (map.get(s.date) || 0) + s.duration);
    });
    return map;
  }, [sessions]);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      <header className="pt-20 pb-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex-1">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 inline-block">
            MY <span className="text-[#0055FF]">STUDY</span>
          </h1>
        </div>
        
        <div className="flex gap-2 bg-[#1A1A1A] p-1.5 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-[#0055FF] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Calendário
          </button>
          <button 
            onClick={() => setActiveTab('chart')}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'chart' ? 'bg-[#0055FF] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Gráfico de Evolução
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {activeTab === 'calendar' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {MONTHS.map((monthName, monthIndex) => {
            const daysInMonth = getDaysInMonth(year, monthIndex);
            const firstDayOfWeek = new Date(year, monthIndex, 1).getDay(); // 0 = Sunday
            
            const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

            return (
              <div key={monthIndex} className="bg-[#1A1A1A] border-4 border-gray-800/80 rounded-3xl p-6 hover:border-gray-600/80 transition-colors">
                <h2 className="font-display uppercase tracking-widest text-lg mb-6 text-gray-300">{monthName}</h2>
                
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[10px] text-gray-500 font-bold">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {blanks.map(b => (
                    <div key={`blank-${b}`} className="aspect-square" />
                  ))}
                  {days.map(day => {
                    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayTotal = sessionsByDate.get(dateStr) || 0;
                    const hasActive = activeSession?.date === dateStr;
                    const isPast = dateStr < todayStr;
                    
                    let bgClass = "bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-400 hover:text-white border border-white/10";
                    if (hasActive) {
                      bgClass = "bg-[#0055FF] text-white shadow-[0_0_15px_rgba(0,85,255,0.5)] border-[#0055FF]";
                    } else if (dayTotal > 0) {
                      const hours = dayTotal / (1000 * 60 * 60);
                      if (hours > 4) bgClass = "bg-white text-black font-bold border-white";
                      else if (hours > 2) bgClass = "bg-gray-300 text-black font-bold border-gray-300";
                      else bgClass = "bg-gray-500 text-white border-gray-500";
                    }

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`relative aspect-square rounded-lg flex items-center justify-center text-xs transition-all overflow-hidden ${bgClass}`}
                      >
                        <span className="relative z-10">{day}</span>
                        {isPast && !hasActive && (
                          <div className="absolute inset-0 bg-[#050505]/60 pointer-events-none"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <EvolutionChart sessions={sessions} year={year} />
        )}
      </main>

      <AnimatePresence>
        {selectedDate && (
          <DayModal
            date={selectedDate}
            sessions={sessions}
            activeSession={activeSession}
            onClose={() => setSelectedDate(null)}
            onStart={startSession}
            onStop={stopSession}
            onDelete={deleteSession}
          />
        )}
      </AnimatePresence>

      {activeSession && (
        <ActiveTimer session={activeSession} onStop={stopSession} />
      )}

      <div className="fixed bottom-8 right-8 bg-gradient-to-br from-[#001a4d] to-[#003399] border border-[#0055FF]/30 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,85,255,0.3)] z-40 flex flex-col items-end backdrop-blur-md">
        <span className="text-[10px] uppercase tracking-widest text-[#88BBFF] font-bold mb-1">Total Estudado</span>
        <TotalStudyDisplay sessions={sessions} activeSession={activeSession} />
      </div>
    </div>
  );
}
