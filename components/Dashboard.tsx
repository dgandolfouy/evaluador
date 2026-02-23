import React from 'react';
import { SavedEvaluation, Employee } from '../types';
import { Calendar, CheckCircle, Clock, Plus } from 'lucide-react';

export const Dashboard = ({ evaluations, employees, currentUser, onNew, onQuickStart, onView }: any) => {
  // Obtenemos subordinados directos para mostrar en las tarjetas principales
  const mySubordinates = employees.filter((e: Employee) => e.reportsTo === currentUser?.id);
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Control de Evaluaciones</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Gestión de Personal RR Etiquetas</p>
        </div>
        <button onClick={onNew} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center gap-2 transition-all">
          <Plus size={20}/> Nueva Evaluación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mySubordinates.map((emp: Employee) => {
          const lastEval = evaluations.find((ev: SavedEvaluation) => ev.employeeId === emp.id);
          
          return (
            <div key={emp.id} className={`p-6 rounded-[2.5rem] border ${lastEval ? 'bg-slate-900/40 border-green-500/20 shadow-lg shadow-green-500/5' : 'bg-slate-900 border-slate-800'} transition-all hover:scale-[1.02]`}>
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
                    <Calendar size={14} className="text-orange-500/50"/> Realizada: {new Date(lastEval.date).toLocaleDateString()}
                  </div>
                  <button onClick={() => onView(lastEval)} className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[11px] font-black uppercase transition-all shadow-lg">Ver Informe Detallado</button>
                </div>
              ) : (
                <button 
                  onClick={() => onQuickStart(emp.id)} 
                  className="w-full py-4 bg-orange-600/5 hover:bg-orange-600 text-orange-500 hover:text-white border border-orange-500/20 hover:border-transparent rounded-2xl text-[11px] font-black uppercase transition-all shadow-sm hover:shadow-orange-900/20"
                >
                  Iniciar Ahora
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
