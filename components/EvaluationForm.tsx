import React, { useState } from 'react';
import { Employee, Criterion } from '../types';
import { CheckCircle2, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { RangeSlider } from './RangeSlider';

export const EvaluationForm = ({ employee, initialCriteria, currentUser, onUpdateGlobalCriteria, onComplete, onCancel }: any) => {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria.map((c: any) => ({ ...c, feedback: '' })));
  const [isAdding, setIsAdding] = useState(false);
  const [newCrit, setNewCrit] = useState({ name: '', description: '' });

  const canEditStructure = currentUser?.name.includes("Daniel Gandolfo") || currentUser?.name.includes("Cristina");

  const handleAddNew = () => {
    if (!newCrit.name) return;
    const updated = [...criteria, { id: Date.now().toString(), name: newCrit.name, description: newCrit.description, score: 5, category: 'Calidad' }];
    setCriteria(updated);
    onUpdateGlobalCriteria(updated);
    setIsAdding(false);
    setNewCrit({ name: '', description: '' });
  };

  const handleRemove = (id: string) => {
    if (confirm("¿Eliminar pregunta definitivamente?")) {
      const updated = criteria.filter(c => c.id !== id);
      setCriteria(updated);
      onUpdateGlobalCriteria(updated);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 pb-32 animate-fade-in">
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

      <div className="space-y-10">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] border border-slate-800 relative shadow-lg overflow-hidden group">
            {canEditStructure && (
              <button onClick={() => handleRemove(c.id)} className="absolute top-6 right-6 p-2 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={20}/></button>
            )}
            
            <h4 className="text-[16px] font-black text-white uppercase mb-8 border-b border-slate-800 pb-4 tracking-widest">{c.name}</h4>
            
            <div className="flex flex-col gap-10">
              {/* PUNTAJE ARRIBA */}
              <div className="space-y-6 bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel de Desempeño</span>
                   <span className="text-5xl font-black text-white tracking-tighter">{c.score}<span className="text-slate-700 text-xl font-bold ml-1">/10</span></span>
                </div>
                <RangeSlider value={c.score} onChange={(v) => {
                  const newC = [...criteria];
                  newC[idx].score = v;
                  setCriteria(newC);
                }} />
              </div>

              {/* EVIDENCIA ABAJO */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidencia ISO 9001</span>
                <textarea 
                  value={c.feedback || ''}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Detalles técnicos u observaciones..."
                  className="w-full h-36 bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-slate-300 text-sm outline-none resize-none shadow-inner transition-all focus:border-orange-500/50"
                />
              </div>
            </div>
          </div>
        ))}

        {canEditStructure && (
          !isAdding ? (
            <button onClick={() => setIsAdding(true)} className="w-full py-8 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-slate-500 font-black uppercase text-xs hover:border-orange-500/50 hover:text-orange-500 transition-all flex items-center justify-center gap-2"><Plus size={20}/> Crear Criterio RR</button>
          ) : (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-orange-600/30 space-y-4">
              <input placeholder="Nombre" value={newCrit.name} onChange={e => setNewCrit({...newCrit, name: e.target.value})} className="w-full bg-slate-950 p-4 rounded-2xl text-white text-sm border border-slate-800" />
              <textarea placeholder="Descripción" value={newCrit.description} onChange={e => setNewCrit({...newCrit, description: e.target.value})} className="w-full bg-slate-950 p-4 rounded-2xl text-white text-sm border border-slate-800 h-24 resize-none" />
              <div className="flex gap-2"><button onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase">Cancelar</button><button onClick={handleAddNew} className="flex-1 py-3 bg-orange-600 rounded-xl text-[10px] font-black uppercase text-white">Guardar</button></div>
            </div>
          )
        )}
      </div>

      <button onClick={() => onComplete(criteria)} className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center justify-center gap-4 hover:bg-orange-500 transition-all">
        <CheckCircle2 size={24} /> Finalizar y Siguiente
      </button>
    </div>
  );
};
