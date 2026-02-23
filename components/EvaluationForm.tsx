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
    if (confirm("¿Eliminar pregunta?")) {
      const updated = criteria.filter(c => c.id !== id);
      setCriteria(updated);
      onUpdateGlobalCriteria(updated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-12 pb-40 animate-fade-in">
      {/* CABEZAL: Nombres claros y alto contraste */}
      <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex justify-between items-center">
        <div>
          <p className="text-orange-500 font-black text-4xl uppercase tracking-tighter leading-none mb-3">{employee.name}</p>
          <p className="text-white text-sm font-bold uppercase tracking-[0.3em] opacity-90">{employee.jobTitle}</p>
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
          <div key={c.id} className="bg-slate-900/50 p-8 sm:p-12 rounded-[3.5rem] border border-slate-800 relative shadow-xl">
            {canEditStructure && (
              <button onClick={() => handleRemove(c.id)} className="absolute top-10 right-10 p-2 text-slate-600 hover:text-red-500 transition-colors">
                <Trash2 size={24}/>
              </button>
            )}
            
            {/* TÍTULO DEL ITEM: Blanco Puro y Visible */}
            <div className="mb-10 border-b border-slate-800 pb-8">
              <h4 className="text-2xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="w-2 h-8 bg-orange-600 rounded-full block"></span>
                {c.name}
              </h4>
              <p className="text-slate-300 text-base leading-relaxed font-medium">
                {c.description}
              </p>
            </div>
            
            {/* SECCIÓN DE PUNTAJE: Bloque Superior */}
            <div className="mb-12 bg-slate-950 p-10 rounded-[2.5rem] border border-white/5">
              <div className="flex justify-between items-center mb-10">
                 <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Nivel de Desempeño</span>
                 <span className="text-6xl font-black text-white tracking-tighter">
                   {c.score}<span className="text-orange-600 text-2xl ml-1">/10</span>
                 </span>
              </div>
              <div className="px-4">
                <RangeSlider value={c.score} onChange={(v) => {
                  const newC = [...criteria];
                  newC[idx].score = v;
                  setCriteria(newC);
                }} />
              </div>
            </div>

            {/* SECCIÓN DE EVIDENCIA: Bloque Inferior */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Evidencia ISO 9001 (Hechos Observados)</span>
                <span className="text-[10px] font-bold text-slate-700">{c.feedback?.length || 0} / 500</span>
              </div>
              <textarea 
                value={c.feedback || ''}
                onChange={(e) => {
                  const newC = [...criteria];
                  newC[idx].feedback = e.target.value;
                  setCriteria(newC);
                }}
                placeholder="Describa aquí datos técnicos o situaciones observadas..."
                className="w-full h-44 bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 text-white text-lg outline-none focus:border-orange-500/50 transition-all resize-none shadow-inner"
              />
            </div>
          </div>
        ))}

        {canEditStructure && (
          !isAdding ? (
            <button onClick={() => setIsAdding(true)} className="w-full py-12 border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-400 font-black uppercase text-sm hover:border-orange-500 hover:text-orange-500 transition-all flex items-center justify-center gap-4">
              <Plus size={24}/> Añadir Pregunta para RR Etiquetas
            </button>
          ) : (
            <div className="bg-slate-900 p-12 rounded-[3.5rem] border border-orange-600/30 space-y-6 shadow-2xl">
              <input placeholder="Nombre del criterio" value={newCrit.name} onChange={e => setNewCrit({...newCrit, name: e.target.value})} className="w-full bg-slate-950 p-6 rounded-3xl text-white text-xl font-bold border border-slate-800" />
              <textarea placeholder="¿Qué se evalúa en este item?" value={newCrit.description} onChange={e => setNewCrit({...newCrit, description: e.target.value})} className="w-full bg-slate-950 p-6 rounded-3xl text-white text-sm border border-slate-800 h-32" />
              <div className="flex gap-4">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-slate-800 rounded-2xl text-xs font-black uppercase">Cancelar</button>
                <button onClick={handleAddNew} className="flex-1 py-4 bg-orange-600 rounded-2xl text-xs font-black uppercase text-white">Guardar Pregunta</button>
              </div>
            </div>
          )
        )}
      </div>

      <button onClick={() => onComplete(criteria)} className="w-full bg-orange-600 text-white py-10 rounded-[3rem] font-black uppercase text-base shadow-2xl shadow-orange-900/40 flex items-center justify-center gap-4 hover:bg-orange-500 transition-all">
        <CheckCircle2 size={32} /> Finalizar Evaluación
      </button>
    </div>
  );
};
