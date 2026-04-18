import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, ShieldAlert, Wifi, Globe, Terminal, Server, Cpu } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Simulated chart data
const initialData = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  tráfico: Math.floor(Math.random() * 100) + 50,
  amenazas: Math.floor(Math.random() * 20),
}));

export default function CommandCenter() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(initialData);
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Update charts
      setChartData(prev => {
        const newData = [...prev.slice(1), {
          time: prev[prev.length - 1].time + 1,
          tráfico: Math.floor(Math.random() * 100) + 50,
          amenazas: Math.floor(Math.random() * 20),
        }];
        return newData;
      });

      // Update logs
      const actions = ["Análisis DPI completado", "Bloqueando IP sospechosa", "Ruta OSPF re-calculada", "Latencia estable", "Escaneo de puertos detectado", "Intento de DDoS mitigado"];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
      
      setLogs(prev => {
        const newLogs = [`[${timestamp}] ${randomAction}`, ...prev];
        return newLogs.slice(0, 8);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono overflow-hidden flex flex-col p-4 md:p-8">
      {/* Overlay Scanline Effect */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 pointer-events-none opacity-20" />
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-green-900/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 bg-green-900/20 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors border border-green-500/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 uppercase flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-green-500" />
            SkyTech Global C&C
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-green-400">Sistema Activo</span>
          </div>
          <div className="text-xs text-green-700 hidden sm:block">STATUS: SECURE</div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
        
        {/* Left Column: Data Streams */}
        <div className="flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-950/20 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-sm font-bold tracking-widest mb-4 flex items-center gap-2 text-green-400">
              <Activity className="w-4 h-4" /> TRÁFICO DE RED (TB/S)
            </h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTrafico" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #166534', color: '#22c55e' }} />
                  <Area type="monotone" dataKey="tráfico" stroke="#22c55e" fillOpacity={1} fill="url(#colorTrafico)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between text-xs text-green-600">
              <span>PEAK: 142.3 TB/S</span>
              <span>AVG: 87.5 TB/S</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6 backdrop-blur-sm flex-grow"
          >
            <h2 className="text-sm font-bold tracking-widest mb-4 flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-4 h-4" /> AMENAZAS MITIGADAS
            </h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #7f1d1d', color: '#ef4444' }} />
                  <Line type="stepAfter" dataKey="amenazas" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Center Column: Globe & Metrics */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Globe className="w-6 h-6"/>, label: "NODOS GLOBALES", value: "3,482" },
              { icon: <Wifi className="w-6 h-6"/>, label: "LATENCIA GBL", value: "12ms" },
              { icon: <Server className="w-6 h-6"/>, label: "ESTADO DE SERVIDORES", value: "99.999%" },
              { icon: <Cpu className="w-6 h-6"/>, label: "CARGA DE CPU T.", value: "42%" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-green-900/10 border border-green-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2"
              >
                <div className="text-green-500/80">{stat.icon}</div>
                <div className="text-2xl font-black text-green-400">{stat.value}</div>
                <div className="text-[10px] font-bold tracking-widest text-green-700">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-green-950/20 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm flex-grow flex flex-col"
          >
             <h2 className="text-sm font-bold tracking-widest mb-4 flex items-center gap-2 text-green-400 border-b border-green-900/50 pb-2">
              <Terminal className="w-4 h-4" /> TERMINAL DE REGISTRO EN VIVO
            </h2>
            <div className="flex-grow font-mono text-sm space-y-2 overflow-hidden relative">
              <AnimatePresence>
                {logs.map((log, index) => (
                  <motion.div
                    key={log + index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`
                      ${log.includes("Bloqueando") || log.includes("DDoS") ? "text-red-400" : "text-green-500"}
                      ${index === 0 ? "font-bold text-green-300" : "opacity-80"}
                    `}
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </div>
            
            {/* Fake interactive prompt */}
            <div className="mt-4 pt-4 border-t border-green-900/50 flex items-center gap-2 text-green-600">
              <span className="text-green-400">&gt;</span> <span className="animate-pulse">_</span>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
