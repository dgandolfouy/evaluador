import React, { useState } from 'react';
import { Employee, Criterion } from '../types';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { RangeSlider } from './RangeSlider';
import { analyzeEvaluation } from '../services/geminiService';

export const EvaluationForm = ({ employee, initialCriteria, onComplete, onCancel }: any) => {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria.map((c: any) => ({ ...c, feedback: '' })));
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    const hasFeedback = criteria.some(c => c.feedback && c.feedback.length > 2);
    if (!hasFeedback) return alert("Por favor, escriba evidencia en al menos un criterio para el reporte.");

    setLoading(true);
    try {
      const analysis = await analyzeEvaluation(employee, criteria);
      onComplete(criteria, analysis);
    } catch (e) {
      onComplete(criteria, null);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 pb-32 animate-fade-in">
      {/* Cabezal de Colaborador */}
      <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
        <button onClick={onCancel} className="text-slate-500 mb-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
          <ArrowLeft size={14}/> Volver
        </button>
        <p className="text-orange-500 font-black text-3xl uppercase tracking-tighter leading-none mb-2">{employee.name}</p>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{employee.jobTitle} • {employee.department}</p>
      </div>

      {/* Lista de Criterios en Bloques Verticales */}
      <div className="space-y-10">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] border border-slate-800 shadow-lg">
            {/* Título y Descripción */}
            <div className="mb-10">
              <h4 className="text-[16px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-orange-600 rounded-full block"></span>
                {c.name}
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">{c.description}</p>
            </div>
            
            <div className="space-y-12">
              {/* BLOQUE 1: PUNTAJE (Solo arriba) */}
              <div className="space-y-6 bg-slate-950/50 p-6 rounded-3xl border border-slate-800/50">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel de Desempeño</span>
                   <span className="text-5xl font-black text-white tracking-tighter">{c.score}<span className="text-slate-700 text-xl font-bold ml-1">/ 10</span></span>
                </div>
                
                <div className="px-2">
                  <input 
                    type="range" min="0" max="10" step="1"
                    value={c.score}
                    onChange={(e) => {
                      const newC = [...criteria];
                      newC[idx].score = parseInt(e.target.value);
                      setCriteria(newC);
                    }}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex justify-between mt-4 px-1">
                    {[...Array(11)].map((_, i) => (
                      <span key={i} className={`text-[10px] font-black transition-colors ${c.score === i ? 'text-orange-500' : 'text-slate-800'}`}>{i}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* BLOQUE 2: EVIDENCIA (Solo abajo) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidencia ISO 9001 (Hechos Observados)</span>
                  <span className="text-[10px] font-bold text-slate-700">{c.feedback?.length || 0} / 500</span>
                </div>
                <textarea 
                  value={c.feedback || ''}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Describa aquí hechos concretos, datos técnicos o situaciones observadas para la auditoría..."
                  className="w-full h-40 bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-slate-300 text-sm outline-none focus:border-orange-600/50 transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Acciones Finales */}
      <div className="flex flex-col sm:flex-row gap-4 pt-10">
        <button onClick={onCancel} className="order-2 sm:order-1 flex-1 bg-slate-900 text-slate-500 py-6 rounded-3xl font-black uppercase text-xs border border-slate-800 hover:text-white transition-all">
          Cancelar
        </button>
        <button 
          onClick={handleFinish} 
          disabled={loading} 
          className="order-1 sm:order-2 flex-[2] bg-orange-600 text-white py-6 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center justify-center gap-4 hover:bg-orange-500 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
          {loading ? 'Generando Reporte IA...' : 'Finalizar y Guardar'}
        </button>
      </div>
    </div>
  );
};
