import React from 'react';
import { SavedEvaluation, Employee } from '../types';
import { Calendar, CheckCircle, Clock, Plus, BarChart2 } from 'lucide-react';

export const Dashboard = ({ evaluations, employees, currentUser, onNew, onQuickStart, onView }: any) => {
  const mySubordinates = employees.filter((e: Employee) => {
    const managerId = e.reportsTo;
    return managerId === currentUser?.id || (e.additionalRoles || []).some(r => r.reportsTo === currentUser?.id);
  });

  const totalSub = mySubordinates.length;
  const completed = mySubordinates.filter((e: Employee) => 
    evaluations.some((ev: SavedEvaluation) => ev.employeeId === e.id)
  ).length;
  const progress = totalSub > 0 ? (completed / totalSub) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-slate-900/50 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-600/20 text-orange-500 rounded-2xl"><BarChart2 /></div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progreso Real</h3>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-2">{Math.round(progress)}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-orange-600 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-600/20 text-blue-500 rounded-2xl"><CheckCircle /></div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Completados</h3>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">{completed} <span className="text-sm text-slate-500">/ {totalSub}</span></div>
        </div>

        <div className="bg-slate-900/50 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-600/20 text-emerald-500 rounded-2xl"><Plus /></div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Acción Rápida</h3>
          </div>
          <button
            onClick={() => onQuickStart(mySubordinates[0]?.id)}
            disabled={totalSub === 0}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            Nueva Evaluación
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Mis Colaboradores Directos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mySubordinates.map((emp: Employee) => {
            const hasEv = evaluations.some((ev: SavedEvaluation) => ev.employeeId === emp.id);
            const latestEv = [...evaluations].reverse().find((ev: SavedEvaluation) => ev.employeeId === emp.id);

            return (
              <div key={emp.id} className="bg-slate-900 p-5 rounded-[2rem] border border-slate-800 flex justify-between items-center group hover:border-orange-500/30 transition-all">
                <div>
                  <div className="font-black text-white text-sm uppercase tracking-tighter mb-1">{emp.name}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{emp.jobTitle}</div>
                  {hasEv && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[8px] font-black uppercase">
                      <CheckCircle size={8} /> Evaluado
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {hasEv ? (
                    <button onClick={() => onView(latestEv)} className="p-3 bg-slate-800 text-orange-500 rounded-2xl hover:bg-slate-700 transition-all"><BarChart2 size={18} /></button>
                  ) : (
                    <button onClick={() => onQuickStart(emp.id)} className="p-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-500 hover:scale-105 transition-all shadow-lg shadow-orange-600/20"><Plus size={18} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {mySubordinates.length === 0 && (
          <div className="text-center py-20 bg-slate-950 rounded-[3rem] border-2 border-dashed border-slate-900">
            <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">No tienes subordinados directos asignados</p>
          </div>
        )}
      </div>
    </div>
  );
};
