import React, { useState } from 'react';
import { RangeSlider } from './RangeSlider';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { analyzeEvaluation } from '../services/geminiService';

export const EvaluationForm = ({ employee, onComplete, onCancel }: any) => {
  const [criteria, setCriteria] = useState([
    { id: '1', name: 'Productividad', score: 5, feedback: '' },
    { id: '2', name: 'Calidad del Trabajo', score: 5, feedback: '' },
    { id: '3', name: 'Seguridad e Higiene', score: 5, feedback: '' },
    { id: '4', name: 'Trabajo en Equipo', score: 5, feedback: '' }
  ]);
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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 pb-40">
      {/* CABEZAL COMPACTO */}
      <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex justify-between items-center">
        <div>
          <button onClick={onCancel} className="text-slate-500 mb-1 flex items-center gap-1 text-[10px] font-black uppercase hover:text-white transition-colors">
            <ArrowLeft size={14}/> Volver
          </button>
          <p className="text-orange-500 font-black text-3xl uppercase tracking-tighter leading-none">{employee.name}</p>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{employee.jobTitle}</p>
        </div>
      </div>

      {/* ITEMS DE EVALUACIÓN */}
      <div className="space-y-6">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-lg">
            {/* Título simple y claro */}
            <h4 className="text-lg font-black text-white uppercase mb-6 border-b border-slate-800 pb-2 tracking-widest">{c.name}</h4>
            
            <div className="space-y-8">
              {/* BLOQUE DE PUNTAJE: ESTIRADO AL 100% */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                   <p className="text-[10px] font-black text-slate-500 uppercase">Puntaje</p>
                   <p className="text-5xl font-black text-white leading-none">
                     {c.score}<span className="text-orange-600 text-xl font-bold ml-1">/10</span>
                   </p>
                </div>
                
                <div className="w-full">
                  <RangeSlider value={c.score} onChange={(v: number) => {
                    const newC = [...criteria];
                    newC[idx].score = v;
                    setCriteria(newC);
                  }} />
                  <div className="flex justify-between mt-4 text-[9px] font-black text-slate-700 uppercase px-1">
                    <span>Deficiente</span>
                    <span>Excelente</span>
                  </div>
                </div>
              </div>

              {/* BLOQUE DE EVIDENCIA: Único cuadro, más compacto */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Evidencia ISO 9001</span>
                <textarea 
                  value={c.feedback}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Hechos observados..."
                  className="w-full h-28 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm font-medium outline-none focus:border-orange-600/50 transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleFinish} 
        disabled={loading} 
        className="w-full bg-orange-600 text-white py-6 rounded-[2rem] font-black uppercase text-sm shadow-2xl flex items-center justify-center gap-4 hover:bg-orange-500 transition-all active:scale-95"
      >
        {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
        {loading ? 'Procesando...' : 'Finalizar y Guardar Evaluación'}
      </button>
    </div>
  );
};
