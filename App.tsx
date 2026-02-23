import React from 'react';
import { SavedEvaluation, Employee } from '../types';
import { Calendar, CheckCircle, Clock, Plus } from 'lucide-react';

export const Dashboard = ({ evaluations, employees, currentUser, onNew, onView }: any) => {
  // Obtenemos la lista de subordinados para saber a quiénes falta evaluar
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mySubordinates.map((emp: Employee) => {
          const lastEval = evaluations.find((ev: SavedEvaluation) => ev.employeeId === emp.id);
          
          return (
            <div key={emp.id} className={`p-6 rounded-[2.5rem] border ${lastEval ? 'bg-slate-900/40 border-green-500/20' : 'bg-slate-900 border-slate-800'} transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-orange-500">
                  {emp.name.substring(0,2).toUpperCase()}
                </div>
                {lastEval ? (
                  <span className="bg-green-500/10 text-green-500 text-[9px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                    <CheckCircle size={10}/> Evaluado
                  </span>
                ) : (
                  <span className="bg-orange-500/10 text-orange-500 text-[9px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                    <Clock size={10}/> Pendiente
                  </span>
                )}
              </div>
              
              <h3 className="font-black uppercase text-sm mb-1">{emp.name}</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-4">{emp.jobTitle}</p>
              
              {lastEval ? (
                <div className="border-t border-slate-800 pt-4 mt-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-4">
                    <Calendar size={12}/> {new Date(lastEval.date).toLocaleDateString()}
                  </div>
                  <button onClick={() => onView(lastEval)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase transition-all">Ver Informe</button>
                </div>
              ) : (
                <button onClick={() => onNew()} className="w-full py-3 border border-dashed border-slate-700 hover:border-orange-500/50 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-orange-500 transition-all">Iniciar Ahora</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
