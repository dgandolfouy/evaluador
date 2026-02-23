import React, { useState } from 'react';
import { RangeSlider } from './RangeSlider';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { analyzeEvaluation } from '../services/geminiService';

export const EvaluationForm = ({ employee, onComplete, onCancel }: any) => {
  const [criteria, setCriteria] = useState([
    { id: '1', name: 'Productividad', score: 5, feedback: '' },
    { id: '2', name: 'Calidad del Trabajo', score: 5, feedback: '' }
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
    <div className="max-w-5xl mx-auto p-10 space-y-12 pb-40">
      <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
        <button onClick={onCancel} className="text-slate-500 mb-2 flex items-center gap-1 text-[10px] font-black uppercase"><ArrowLeft size={14}/> Volver</button>
        <p className="text-orange-500 font-black text-4xl uppercase tracking-tighter leading-none mb-2">{employee.name}</p>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{employee.jobTitle}</p>
      </div>

      <div className="space-y-16">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl">
            <h4 className="text-2xl font-black text-white uppercase mb-10 border-b border-slate-800 pb-4">{c.name}</h4>
            
            <div className="space-y-12">
              {/* PUNTAJE ESTIRADO AL 100% */}
              <div className="bg-slate-950 p-10 rounded-[3rem] border border-white/5">
                <div className="flex justify-between items-end mb-8">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel de desempeño</p>
                   <p className="text-7xl font-black text-white leading-none">{c.score}<span className="text-orange-600 text-2xl font-bold ml-1">/10</span></p>
                </div>
                <div className="w-full px-4">
                  <RangeSlider value={c.score} onChange={(v: number) => {
                    const newC = [...criteria];
                    newC[idx].score = v;
                    setCriteria(newC);
                  }} />
                </div>
              </div>

              {/* ÚNICO CUADRO DE EVIDENCIA */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Evidencia ISO 9001</span>
                <textarea 
                  value={c.feedback}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Describa hechos y situaciones observadas..."
                  className="w-full h-44 bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 text-white text-lg outline-none focus:border-orange-500/50 resize-none shadow-inner"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleFinish} disabled={loading} className="w-full bg-orange-600 text-white py-10 rounded-[3rem] font-black uppercase text-base shadow-2xl flex items-center justify-center gap-4 hover:bg-orange-500 transition-all">
        {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
        {loading ? 'Generando Informe IA...' : 'Finalizar Evaluación'}
      </button>
    </div>
  );
};
