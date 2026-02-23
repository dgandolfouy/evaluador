import React, { useState } from 'react';
import { RangeSlider } from './RangeSlider';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { analyzeEvaluation } from '../services/geminiService';

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
    <div className="max-w-4xl mx-auto p-4 sm:p-10 space-y-10 pb-40 text-white">
      {/* CABEZAL */}
      <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
        <button onClick={onCancel} className="text-slate-500 mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
          <ArrowLeft size={14}/> Volver al Panel
        </button>
        <h2 className="text-orange-500 font-black text-4xl uppercase tracking-tighter leading-none">{employee.name}</h2>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{employee.jobTitle}</p>
      </div>

      {/* ITEMS DE EVALUACIÓN VERTICALES */}
      <div className="space-y-16">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col gap-10">
            <h4 className="text-2xl font-black text-white uppercase border-b border-slate-800 pb-6 tracking-widest">{c.name}</h4>
            
            <div className="bg-slate-950 p-10 rounded-[2.5rem] border border-white/5 shadow-inner">
              <div className="flex justify-between items-end mb-10">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel de Desempeño</p>
                 <p className="text-7xl font-black text-white leading-none tracking-tighter">{c.score}<span className="text-orange-600 text-2xl font-bold ml-1">/10</span></p>
              </div>
              <div className="w-full px-2">
                <RangeSlider value={c.score} onChange={(v: number) => {
                  const newC = [...criteria];
                  newC[idx].score = v;
                  setCriteria(newC);
                }} />
              </div>
            </div>

            <div className="space-y-4 px-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidencia ISO 9001 (Hechos Observados)</span>
              <textarea 
                value={c.feedback}
                onChange={(e) => {
                  const newC = [...criteria];
                  newC[idx].feedback = e.target.value;
                  setCriteria(newC);
                }}
                placeholder="Describa aquí hechos técnicos o situaciones observadas..."
                className="w-full h-44 bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 text-white text-lg font-medium outline-none focus:border-orange-600/50 transition-all resize-none shadow-2xl"
              />
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleFinish} disabled={loading} className="w-full bg-orange-600 text-white py-10 rounded-[3.5rem] font-black uppercase text-base shadow-2xl hover:bg-orange-500 transition-all active:scale-95 flex items-center justify-center gap-4">
        {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={32} />}
        {loading ? 'Generando Informe...' : 'Finalizar y Guardar Evaluación'}
      </button>
    </div>
  );
};
