import React, { useState } from 'react';
import { Employee, Criterion } from '../types';
import { CheckCircle2, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { RangeSlider } from './RangeSlider';

export const EvaluationForm = ({ employee, initialCriteria, currentUser, onUpdateGlobalCriteria, onComplete, onCancel }: any) => {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria.map((c: any) => ({ ...c, feedback: '' })));
  const canEditStructure = currentUser?.name.includes("Daniel Gandolfo") || currentUser?.name.includes("Cristina");

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 pb-32 animate-fade-in">
      {/* Cabezal: Información del Colaborador */}
      <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex justify-between items-start shadow-2xl">
        <div>
          <p className="text-orange-500 font-black text-3xl uppercase tracking-tighter leading-none mb-2">{employee.name}</p>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{employee.jobTitle}</p>
        </div>
        {canEditStructure && (
          <div className="bg-orange-600/10 px-3 py-1 rounded-full border border-orange-600/20 flex items-center gap-2">
            <ShieldCheck size={14} className="text-orange-500" />
            <span className="text-[10px] font-black text-orange-500 uppercase">Editor Calidad</span>
          </div>
        )}
      </div>

      {/* Lista de Criterios: Estructura Vertical */}
      <div className="space-y-10">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] border border-slate-800 relative shadow-lg">
            <h4 className="text-[16px] font-black text-white uppercase mb-10 border-b border-slate-800 pb-4 tracking-widest">{c.name}</h4>
            
            <div className="flex flex-col gap-12">
              {/* BLOQUE DE PUNTAJE (Superior) */}
              <div className="space-y-6 bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Puntaje</span>
                   <span className="text-5xl font-black text-white tracking-tighter">{c.score}<span className="text-slate-700 text-xl font-bold">/10</span></span>
                </div>
                <RangeSlider value={c.score} onChange={(v) => {
                  const newC = [...criteria];
                  newC[idx].score = v;
                  setCriteria(newC);
                }} />
              </div>

              {/* BLOQUE DE EVIDENCIA (Inferior) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidencia ISO 9001</span>
                  <span className="text-[10px] font-bold text-slate-700">{c.feedback?.length || 0} / 500</span>
                </div>
                <textarea 
                  value={c.feedback || ''}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Escriba aquí los hechos observados..."
                  className="w-full h-36 bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-slate-300 text-sm outline-none resize-none shadow-inner transition-all focus:border-orange-500/50"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => onComplete(criteria)} 
        className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center justify-center gap-4 hover:bg-orange-500 transition-all"
      >
        <CheckCircle2 size={24} /> Finalizar y Siguiente
      </button>
    </div>
  );
};
