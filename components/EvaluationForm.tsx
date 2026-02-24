import React, { useState } from 'react';
import { RangeSlider } from './RangeSlider';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { analyzeEvaluation } from '../services/geminiService'; // IMPORT EN SINGULAR

export const EvaluationForm = ({ employee, onComplete, onCancel }: any) => {
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState([
    { id: '1', name: 'Productividad y Eficiencia', score: 5, feedback: '' },
    { id: '2', name: 'Calidad y Cumplimiento ISO', score: 5, feedback: '' },
    { id: '3', name: 'Seguridad e Higiene RR', score: 5, feedback: '' },
    { id: '4', name: 'Trabajo en Equipo y Actitud', score: 5, feedback: '' },
    { id: '5', name: 'Mantenimiento de Puesto/Máquina', score: 5, feedback: '' }
  ]);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const analysis = await analyzeEvaluation(employee, criteria);
      onComplete(criteria, analysis);
    } catch (e) {
      onComplete(criteria, null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 pb-40 text-white animate-fade-in">
      <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
        <button onClick={onCancel} className="text-slate-500 mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
          <ArrowLeft size={14}/> Volver
        </button>
        <h2 className="text-orange-500 font-black text-4xl uppercase tracking-tighter leading-none">{employee.name}</h2>
        <p className="text-white/60 text-xs font-bold uppercase mt-2">{employee.jobtitle || employee.jobTitle}</p>
      </div>

      <div className="space-y-12">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col gap-8">
            <h4 className="text-xl font-black text-white uppercase tracking-widest border-b border-slate-800 pb-4">{c.name}</h4>
            <div className="bg-slate-950 p-8 rounded-[2rem] border border-white/5">
              <div className="flex justify-between items-end mb-8">
                 <p className="text-[10px] font-black text-slate-500 uppercase">Puntuación</p>
                 <p className="text-6xl font-black text-white">{c.score}<span className="text-orange-600 text-xl ml-1">/10</span></p>
              </div>
              <RangeSlider value={c.score} onChange={(v: number) => {
                const newC = [...criteria];
                newC[idx].score = v;
                setCriteria(newC);
              }} />
            </div>
            <textarea 
              value={c.feedback}
              onChange={(e) => {
                const newC = [...criteria];
                newC[idx].feedback = e.target.value;
                setCriteria(newC);
              }}
              placeholder="Evidencia técnica observada..."
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-white text-lg focus:border-orange-600 outline-none transition-all resize-none"
            />
          </div>
        ))}
      </div>

      <button onClick={handleFinish} disabled={loading} className="w-full bg-orange-600 py-10 rounded-[3.5rem] font-black uppercase text-xl shadow-2xl flex items-center justify-center gap-4 hover:bg-orange-500 active:scale-95 transition-all">
        {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={32} />}
        {loading ? 'Analizando con IA...' : 'Finalizar Evaluación'}
      </button>
    </div>
  );
};
