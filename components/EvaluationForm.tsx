import React, { useState } from 'react';
import { Employee, Criterion } from '../types';
import { CheckCircle2, Loader2, Plus, Trash2, Edit3 } from 'lucide-react';
import { RangeSlider } from './RangeSlider';
import { analyzeEvaluation } from '../services/geminiService';

export const EvaluationForm = ({ employee, initialCriteria, currentUser, onUpdateGlobalCriteria, onComplete, onCancel }: any) => {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria.map((c: any) => ({ ...c, feedback: '' })));
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCrit, setNewCrit] = useState({ name: '', description: '' });

  const hasPermission = currentUser?.name.includes("Daniel Gandolfo") || currentUser?.name.includes("Cristina");

  const handleAddCriteria = () => {
    if (!hasPermission) return alert("Favor comunicarse con Gerencia de Calidad para modificar criterios.");
    const updated = [...criteria, { id: Date.now().toString(), ...newCrit, score: 5, category: 'Calidad' }];
    setCriteria(updated);
    onUpdateGlobalCriteria(updated);
    setIsAdding(false);
    setNewCrit({ name: '', description: '' });
  };

  const handleRemoveCriteria = (id: string) => {
    if (!hasPermission) return alert("Favor comunicarse con Gerencia de Calidad.");
    const updated = criteria.filter(c => c.id !== id);
    setCriteria(updated);
    onUpdateGlobalCriteria(updated);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const analysis = await analyzeEvaluation(employee, criteria);
      onComplete(criteria, analysis);
    } catch (e) {
      onComplete(criteria, null);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-fade-in">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <p className="text-orange-500 font-black text-3xl uppercase tracking-tighter mb-1">{employee.name}</p>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{employee.jobTitle}</p>
      </div>

      <div className="space-y-6">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 relative">
            {hasPermission && (
              <button onClick={() => handleRemoveCriteria(c.id)} className="absolute top-6 right-6 text-red-500/30 hover:text-red-500"><Trash2 size={20}/></button>
            )}
            <h4 className="text-[14px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-orange-600 rounded-full block"></span>
              {c.name}
            </h4>
            <p className="text-slate-500 text-xs mb-8">{c.description}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <span className="text-4xl font-black text-white">{c.score}<span className="text-slate-700 text-xl font-bold ml-1">/ 10</span></span>
                </div>
                <RangeSlider value={c.score} onChange={(v) => {
                  const newC = [...criteria];
                  newC[idx].score = v;
                  setCriteria(newC);
                }} />
              </div>
              <textarea 
                value={c.feedback || ''}
                onChange={(e) => {
                  const newC = [...criteria];
                  newC[idx].feedback = e.target.value;
                  setCriteria(newC);
                }}
                placeholder="Evidencia ISO 9001..."
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-3xl p-5 text-slate-300 text-sm outline-none focus:border-orange-600/50"
              />
            </div>
          </div>
        ))}

        {hasPermission && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="w-full py-6 border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-500 font-black uppercase text-xs hover:border-orange-500/50 hover:text-orange-500 transition-all flex items-center justify-center gap-2">
            <Plus size={20}/> Añadir Nueva Pregunta de Calidad
          </button>
        )}

        {isAdding && (
          <div className="bg-slate-900 p-8 rounded-[3rem] border border-orange-500/30 space-y-4">
            <input placeholder="Nombre de la pregunta" value={newCrit.name} onChange={e => setNewCrit({...newCrit, name: e.target.value})} className="w-full bg-slate-950 p-4 rounded-2xl text-white text-sm border border-slate-800" />
            <textarea placeholder="Descripción del criterio" value={newCrit.description} onChange={e => setNewCrit({...newCrit, description: e.target.value})} className="w-full bg-slate-950 p-4 rounded-2xl text-white text-sm border border-slate-800" />
            <div className="flex gap-2">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-slate-800 rounded-xl text-xs font-black uppercase">Cancelar</button>
              <button onClick={handleAddCriteria} className="flex-1 py-3 bg-orange-600 rounded-xl text-xs font-black uppercase">Guardar Pregunta</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-10">
        <button onClick={onCancel} className="flex-1 bg-slate-900 text-slate-500 py-6 rounded-3xl font-black uppercase text-xs border border-slate-800">Cancelar</button>
        <button onClick={handleFinish} disabled={loading} className="flex-[2.5] bg-orange-600 text-white py-6 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
          {loading ? 'Generando Reporte...' : 'Finalizar Evaluación'}
        </button>
      </div>
    </div>
  );
};
