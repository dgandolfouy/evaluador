import React, { useState } from 'react';
import { Employee, Criterion } from '../types';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { RangeSlider } from './RangeSlider';
import { analyzeEvaluation } from '../services/geminiService';

export const EvaluationForm = ({ employee, initialCriteria, onComplete, onCancel }: any) => {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria.map((c: any) => ({ ...c, feedback: '' })));
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    // Verificamos que al menos un criterio tenga evidencia para que la IA tenga qué analizar
    const hasFeedback = criteria.some(c => c.feedback && c.feedback.length > 3);
    if (!hasFeedback) return alert("Por favor, escriba al menos una breve evidencia ISO 9001 para que la IA genere el informe.");

    setLoading(true);
    try {
      // Llamada a Gemini para análisis profundo
      const analysis = await analyzeEvaluation(employee, criteria);
      onComplete(criteria, analysis);
    } catch (e) {
      console.error(e);
      alert("Error en el análisis cualitativo. Se guardarán solo los puntajes.");
      onComplete(criteria, null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-32 animate-fade-in">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <p className="text-orange-500 font-black text-3xl uppercase tracking-tighter mb-1">{employee.name}</p>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{employee.jobTitle}</p>
      </div>

      <div className="space-y-6">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800">
            <h4 className="text-[14px] font-black text-white uppercase tracking-widest mb-10 border-b border-slate-800 pb-4">{c.name}</h4>
            
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

              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidencia ISO 9001</span>
                <textarea 
                  value={c.feedback || ''}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Describa hechos u observaciones..."
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-3xl p-5 text-slate-300 text-sm outline-none focus:border-orange-600/50 transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-10">
        <button onClick={onCancel} className="flex-1 bg-slate-900 text-slate-500 py-6 rounded-3xl font-black uppercase text-xs border border-slate-800">Cancelar</button>
        <button onClick={handleFinish} disabled={loading} className="flex-[2.5] bg-orange-600 text-white py-6 rounded-3xl font-black uppercase text-xs shadow-2xl flex items-center justify-center gap-4">
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
          {loading ? 'Generando Reporte IA...' : 'Finalizar Evaluación'}
        </button>
      </div>
    </div>
  );
};
