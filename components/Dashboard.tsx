import React from 'react';
import { SavedEvaluation, Employee } from '../types';
import { Calendar, CheckCircle, Clock, Plus, BarChart2 } from 'lucide-react';

export const Dashboard = ({ evaluations, employees, currentUser, onNew, onQuickStart, onView }: any) => {
  const mySubordinates = employees.filter((e: Employee) => e.reportsTo === currentUser?.id);
  const totalSub = mySubordinates.length;
  const totalEval = mySubordinates.filter((e: Employee) => evaluations.some((ev: any) => ev.employeeId === e.id)).length;
  const percent = totalSub > 0 ? Math.round((totalEval / totalSub) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* RESUMEN ANUAL ISO */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center justify-between shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase tracking-tighter">Control de Competencias</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <BarChart2 size={16} className="text-orange-500" /> Plan Anual ISO 9001:2015
          </p>
        </div>
        <div className="flex items-center gap-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 w-full md:w-auto">
          <div className="text-center">
            <p className="text-3xl font-black text-white">{percent}%</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Avance Anual</p>
          </div>
          <div className="w-px h-10 bg-slate-800"></div>
          <div className="flex-1 md:w-48">
             <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
             </div>
             <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase">{totalEval} de {totalSub} Colaboradores Evaluados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mySubordinates.map((emp: Employee) => {
          const lastEval = evaluations.find((ev: SavedEvaluation) => ev.employeeId === emp.id);
          return (
            <div key={emp.id} className={`p-6 rounded-[2.5rem] border ${lastEval ? 'bg-slate-900/40 border-green-500/20' : 'bg-slate-900 border-slate-800'} transition-all hover:scale-[1.02]`}>
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-orange-500 text-xl border border-slate-700">
                  {emp.name.substring(0,2).toUpperCase()}
                </div>
                {lastEval ? (
                  <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase flex items-center gap-2 border border-green-500/20">
                    <CheckCircle size={12}/> Evaluado
                  </span>
                ) : (
                  <span className="bg-orange-500/10 text-orange-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase flex items-center gap-2 border border-orange-500/20">
                    <Clock size={12}/> Pendiente
                  </span>
                )}
              </div>
              <h3 className="font-black uppercase text-base text-white mb-1 tracking-tight">{emp.name}</h3>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-6">{emp.jobTitle}</p>
              {lastEval ? (
                <div className="border-t border-slate-800/50 pt-5 mt-auto">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-4">
                    <Calendar size={14} className="text-orange-500/50"/> {new Date(lastEval.date).toLocaleDateString()} {new Date(lastEval.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <button onClick={() => onView(lastEval)} className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[11px] font-black uppercase transition-all shadow-lg">Ver Reporte</button>
                </div>
              ) : (
                <button onClick={() => onQuickStart(emp.id)} className="w-full py-4 bg-orange-600/5 hover:bg-orange-600 text-orange-500 hover:text-white border border-orange-500/20 hover:border-transparent rounded-2xl text-[11px] font-black uppercase transition-all">Iniciar Ahora</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
