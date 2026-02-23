import React, { useState } from 'react';
import { Employee, Criterion } from '../types';
import { CheckCircle2, Loader2, ArrowLeft, Info } from 'lucide-react';
import { analyzeEvaluation } from '../services/geminiService';

export const EvaluationForm = ({ employee, initialCriteria, onComplete, onCancel }: any) => {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria.map((c: any) => ({ ...c, feedback: '' })));
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 pb-32 animate-fade-in">
      {/* Cabezal de Evaluación */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <p className="text-orange-500 font-black text-3xl sm:text-4xl uppercase tracking-tighter mb-2">{employee.name}</p>
        <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">{employee.jobTitle} • {employee.department}</p>
      </div>

      {/* Lista de Criterios */}
      <div className="space-y-6">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-6 sm:p-10 rounded-[3rem] border border-slate-800 shadow-lg group transition-all hover:border-slate-700">
            <div className="mb-8">
              <h4 className="text-[14px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-orange-600 rounded-full block"></span>
                {c.name}
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed max-w-2xl">{c.description}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* CONTROL DE PUNTAJE */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                     <Info size={12}/> Desempeño
                   </span>
                   <span className="text-5xl font-black text-white tracking-tighter">{c.score}<span className="text-slate-700 text-xl font-bold ml-1">/ 10</span></span>
                </div>
                
                {/* Deslizador de punto a punto */}
                <input 
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={c.score}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].score = parseInt(e.target.value);
                    setCriteria(newC);
                  }}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                
                <div className="flex justify-between px-1">
                  {[...Array(11)].map((_, i) => (
                    <span key={i} className={`text-[9px] font-black ${c.score === i ? 'text-orange-500' : 'text-slate-700'}`}>{i}</span>
                  ))}
                </div>
              </div>

              {/* BLOQUE DE EVIDENCIA */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidencia ISO 9001 (Hechos)</span>
                  <span className="text-[9px] font-bold text-slate-700">{c.feedback?.length || 0} / 500</span>
                </div>
                <textarea 
                  value={c.feedback || ''}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Describa hechos concretos, datos o situaciones..."
                  className="w-full h-36 bg-slate-950 border border-slate-800 rounded-3xl p-5 text-slate-300 text-sm outline-none focus:border-orange-600/50 focus:ring-1 focus:ring-orange-600/10 transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACCIONES */}
      <div className="flex gap-4 pt-10">
        <button onClick={onCancel} className="flex-1 bg-slate-900 text-slate-500 py-6 rounded-3xl font-black uppercase text-xs border border-slate-800 hover:text-white transition-all">
          Cancelar
        </button>
        <button onClick={handleFinish} disabled={loading} className="flex-[2.5] bg-orange-600 text-white py-6 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center justify-center gap-4 hover:bg-orange-500 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
          {loading ? 'Generando Reporte IA...' : 'Finalizar y Guardar'}
        </button>
      </div>
    </div>
  );
};
