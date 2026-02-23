import React, { useState } from 'react';
import { Employee, Criterion } from '../types';
import { CheckCircle2, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { RangeSlider } from './RangeSlider';

export const EvaluationForm = ({ employee, initialCriteria, currentUser, onComplete, onCancel }: any) => {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria.map((c: any) => ({ ...c, feedback: '' })));
  const canEditStructure = currentUser?.name.includes("Daniel Gandolfo") || currentUser?.name.includes("Cristina");

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-10 space-y-12 animate-fade-in pb-40">
      {/* Cabezal de Ficha */}
      <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-orange-500 font-black text-4xl uppercase tracking-tighter leading-none mb-2">{employee.name}</p>
          <p className="text-white/80 text-sm font-bold uppercase tracking-[0.2em]">{employee.jobTitle}</p>
        </div>
        {canEditStructure && (
          <div className="bg-orange-600/20 px-4 py-2 rounded-full border border-orange-600/40 flex items-center gap-2">
            <ShieldCheck size={18} className="text-orange-500" />
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Gestión Calidad</span>
          </div>
        )}
      </div>

      <div className="space-y-16">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-10 sm:p-14 rounded-[4rem] border border-slate-800 shadow-2xl relative">
            {/* Rayita naranja decorativa lateral */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-orange-600 rounded-r-full shadow-[0_0_15px_rgba(234,88,12,0.5)]"></div>
            
            <div className="mb-12 border-b border-slate-800 pb-8">
              <h4 className="text-2xl font-black text-white uppercase tracking-widest mb-4 leading-tight">{c.name}</h4>
              <p className="text-slate-400 text-base leading-relaxed max-w-2xl">{c.description}</p>
            </div>
            
            <div className="space-y-14">
              {/* Selector Estirado y Texto Redistribuido */}
              <div className="bg-slate-950 p-10 rounded-[3rem] border border-white/5 shadow-inner">
                <div className="flex justify-between items-end mb-10">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Evaluación de Desempeño</p>
                   <p className="text-6xl font-black text-white tracking-tighter leading-none">{c.score}<span className="text-orange-600 text-2xl font-bold ml-1">/10</span></p>
                </div>
                
                <div className="px-2">
                  <RangeSlider value={c.score} onChange={(v) => {
                    const newC = [...criteria];
                    newC[idx].score = v;
                    setCriteria(newC);
                  }} />
                  <div className="flex justify-between mt-6 text-[10px] font-black text-slate-700 uppercase tracking-widest px-1">
                    <span>Deficiente</span>
                    <span>Excelente</span>
                  </div>
                </div>
              </div>

              {/* Área de Comentarios Blindada */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidencia ISO 9001 (Hechos Observados)</span>
                  <span className="text-[10px] font-bold text-slate-800">{c.feedback?.length || 0} / 500</span>
                </div>
                <textarea 
                  value={c.feedback || ''}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Escriba aquí los datos técnicos o situaciones observadas..."
                  className="w-full h-44 bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 text-white text-lg font-medium outline-none focus:border-orange-600/50 transition-all resize-none shadow-2xl placeholder:text-slate-800"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 pt-10">
        <button onClick={onCancel} className="flex-1 bg-slate-900 text-slate-500 py-8 rounded-[2.5rem] font-black uppercase text-xs border border-slate-800 hover:text-white transition-all">Cancelar Evaluación</button>
        <button onClick={() => onComplete(criteria)} className="flex-[2] bg-orange-600 text-white py-8 rounded-[2.5rem] font-black uppercase text-xs shadow-2xl shadow-orange-900/40 flex items-center justify-center gap-4 hover:bg-orange-500 hover:-translate-y-1 transition-all">
          <CheckCircle2 size={24} /> Finalizar y Guardar Informe
        </button>
      </div>
    </div>
  );
};
