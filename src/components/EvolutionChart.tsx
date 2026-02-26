import { useMemo, useState } from 'react';
import { StudySession } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

interface EvolutionChartProps {
  sessions: StudySession[];
  year: number;
}

type Timeframe = 'days' | 'weeks' | 'months';

export function EvolutionChart({ sessions, year }: EvolutionChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('days');

  const data = useMemo(() => {
    const map = new Map<string, number>();

    sessions.forEach(session => {
      const [y, m, d] = session.date.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      // Ensure we only process sessions for the selected year
      if (date.getFullYear() !== year) return;

      let key = '';
      if (timeframe === 'days') {
        key = session.date; // YYYY-MM-DD
      } else if (timeframe === 'weeks') {
        // Calculate week number
        const start = new Date(year, 0, 1);
        const diff = date.getTime() - start.getTime();
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        const week = Math.floor(diff / oneWeek) + 1;
        key = `Semana ${week}`;
      } else if (timeframe === 'months') {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        key = months[date.getMonth()];
      }

      map.set(key, (map.get(key) || 0) + session.duration);
    });

    // Generate continuous data based on timeframe
    const result = [];
    if (timeframe === 'days') {
      // Get all days of the year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const duration = map.get(dateStr) || 0;
        result.push({
          name: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
          hours: Number((duration / (1000 * 60 * 60)).toFixed(2)),
          rawDate: dateStr
        });
      }
    } else if (timeframe === 'weeks') {
      for (let w = 1; w <= 52; w++) {
        const key = `Semana ${w}`;
        const duration = map.get(key) || 0;
        result.push({
          name: `S${w}`,
          fullName: key,
          hours: Number((duration / (1000 * 60 * 60)).toFixed(2))
        });
      }
    } else if (timeframe === 'months') {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      months.forEach(m => {
        const duration = map.get(m) || 0;
        result.push({
          name: m,
          hours: Number((duration / (1000 * 60 * 60)).toFixed(2))
        });
      });
    }

    return result;
  }, [sessions, year, timeframe]);

  const formatTooltip = (value: number) => {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    return [`${hours}h ${minutes}m`, 'Tempo de Estudo'];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="font-display text-2xl uppercase tracking-widest text-white">Evolução</h2>
        
        <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-white/5">
          {(['days', 'weeks', 'months'] as Timeframe[]).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                timeframe === t 
                  ? 'bg-white text-black' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {t === 'days' ? 'Dias' : t === 'weeks' ? 'Semanas' : 'Meses'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#666" 
              tick={{ fill: '#666', fontSize: 12 }} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="#666" 
              tick={{ fill: '#666', fontSize: 12 }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}h`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#0055FF', fontWeight: 'bold' }}
              formatter={formatTooltip}
              labelStyle={{ color: '#888', marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="hours" 
              stroke="#0055FF" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#0055FF', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
