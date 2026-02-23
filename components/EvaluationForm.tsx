import React, { useState } from 'react';
import { Employee, Criterion } from '../types';
import { CheckCircle2, ShieldCheck, Plus, Trash2, Info } from 'lucide-react';
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
    if (confirm("¿Eliminar esta pregunta para siempre?")) {
      const updated = criteria.filter(c => c.id !== id);
      setCriteria(updated);
      onUpdateGlobalCriteria(updated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-10 pb-32 animate-fade-in">
      {/* CABEZAL: Nombres claros y visibles */}
      <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl flex justify-between items-center">
        <div>
          <p className="text-orange-500 font-black text-4xl uppercase tracking-tighter leading-none mb-2">{employee.name}</p>
          <p className="text-white text-sm font-bold uppercase tracking-[0.2em] opacity-80">{employee.jobTitle}</p>
        </div>
        {canEditStructure && (
          <div className="bg-orange-600/20 px-4 py-2 rounded-full border border-orange-600/40 flex items-center gap-2">
            <ShieldCheck size={16} className="text-orange-500" />
            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Editor Calidad</span>
          </div>
        )}
      </div>

      <div className="space-y-12">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-8 sm:p-12 rounded-[3rem] border border-slate-800 relative group shadow-xl">
            {canEditStructure && (
              <button onClick={() => handleRemove(c.id)} className="absolute top-8 right-8 p-2 text-slate-700 hover:text-red-500 transition-colors">
                <Trash2 size={24}/>
              </button>
            )}
            
            {/* TÍTULO DEL ITEM: Ahora en Blanco Brillante y más grande */}
            <div className="mb-10 border-b border-slate-800 pb-6">
              <h4 className="text-2xl font-black text-white uppercase tracking-widest mb-3 flex items-center gap-3">
                <span className="w-2 h-8 bg-orange-600 rounded-full block"></span>
                {c.name}
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl font-medium">
                {c.description}
              </p>
            </div>
            
            <div className="flex flex-col gap-12">
              {/* PUNTAJE: Fondo muy oscuro para que resalte el naranja */}
              <div className="space-y-8 bg-slate-950 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Info size={14} className="text-orange-500"/> Nivel de Desempeño
                   </span>
                   <span className="text-6xl font-black text-white tracking-tighter">
                     {c.score}<span className="text-orange-600 text-2xl ml-1">/10</span>
                   </span>
                </div>
                
                <div className="px-2">
                  <RangeSlider value={c.score} onChange={(v) => {
                    const newC = [...criteria];
                    newC[idx].score = v;
                    setCriteria(newC);
                  }} />
                </div>
              </div>

              {/* EVIDENCIA: Contraste alto para lectura fácil */}
              <div className="space-y-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Evidencia ISO 9001 (Hechos y Datos)
                </span>
                <textarea 
                  value={c.feedback || ''}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Ej: Cumple con los tiempos de entrega sin descartes técnicos..."
                  className="w-full h-40 bg-slate-950 border border-slate-800 rounded-[2rem] p-8 text-white text-base outline-none focus:border-orange-500 transition-all resize-none shadow-2xl placeholder:text-slate-700"
                />
              </div>
            </div>
          </div>
        ))}

        {canEditStructure && (
          !isAdding ? (
            <button onClick={() => setIsAdding(true)} className="w-full py-10 border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-400 font-black uppercase text-sm hover:border-orange-500 hover:text-orange-500 transition-all flex items-center justify-center gap-3">
              <Plus size={24}/> Crear Pregunta Específica para RR
            </button>
          ) : (
            <div className="bg-slate-900 p-10 rounded-[3rem] border border-orange-500/30 space-y-6 shadow-2xl">
              <input 
                placeholder="Nombre del criterio" 
                value={newCrit.name} 
                onChange={e => setNewCrit({...newCrit, name: e.target.value})} 
                className="w-full bg-slate-950 p-6 rounded-2xl text-white text-lg font-bold border border-slate-800 outline-none focus:border-orange-500" 
              />
              <textarea 
                placeholder="Explicación de qué se evalúa..." 
                value={newCrit.description} 
                onChange={e => setNewCrit({...newCrit, description: e.target.value})} 
                className="w-full bg-slate-950 p-6 rounded-2xl text-white text-sm border border-slate-800 h-32 outline-none focus:border-orange-500" 
              />
              <div className="flex gap-4">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-slate-800 rounded-2xl font-black uppercase text-xs">Cancelar</button>
                <button onClick={handleAddNew} className="flex-1 py-4 bg-orange-600 rounded-2xl font-black uppercase text-xs text-white">Guardar Pregunta</button>
              </div>
            </div>
          )
        )}
      </div>

      <button onClick={() => onComplete(criteria)} className="w-full bg-orange-600 text-white py-8 rounded-[2.5rem] font-black uppercase text-sm shadow-2xl shadow-orange-900/40 flex items-center justify-center gap-4 hover:bg-orange-500 hover:-translate-y-1 transition-all">
        <CheckCircle2 size={28} /> Finalizar Evaluación
      </button>
    </div>
  );
};
