import { useEffect, useState } from 'react';
import { StudySession } from '../types';
import { formatDuration } from '../utils/time';
import { StopCircle } from 'lucide-react';

interface ActiveTimerProps {
  session: StudySession;
  onStop: () => void;
}

export function ActiveTimer({ session, onStop }: ActiveTimerProps) {
  const [elapsed, setElapsed] = useState(Date.now() - session.startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - session.startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startTime]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-white/10 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl z-50">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-display">Sessão Ativa • {session.date}</span>
        <span className="font-mono text-2xl font-bold text-[#0055FF]">{formatDuration(elapsed)}</span>
      </div>
      <button 
        onClick={onStop}
        className="bg-white text-black hover:bg-red-500 hover:text-white transition-colors rounded-full p-3 flex items-center justify-center"
      >
        <StopCircle size={24} />
      </button>
    </div>
  );
}
