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
    <div className="max-w-4xl mx-auto p-4 sm:p-10 space-y-12 pb-40">
      {/* CABEZAL LIMPIO */}
      <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <button onClick={onCancel} className="text-slate-500 mb-2 flex items-center gap-1 text-[10px] font-black uppercase hover:text-white transition-colors">
          <ArrowLeft size={14}/> Volver al Panel
        </button>
        <p className="text-orange-500 font-black text-4xl uppercase tracking-tighter leading-none mb-2">{employee.name}</p>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{employee.jobTitle}</p>
      </div>

      <div className="space-y-20">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-8 sm:p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl">
            {/* Título Blanco Sólido */}
            <h4 className="text-2xl font-black text-white uppercase mb-10 border-b border-slate-800 pb-4 tracking-widest">{c.name}</h4>
            
            {/* ESTRUCTURA VERTICAL: Puntaje arriba, Evidencia abajo */}
            <div className="flex flex-col gap-12">
              
              {/* BLOQUE DE PUNTAJE ESTIRADO */}
              <div className="bg-slate-950 p-8 sm:p-12 rounded-[2.5rem] border border-white/5 shadow-inner">
                <div className="flex justify-between items-end mb-10">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel de Desempeño</p>
                   <p className="text-7xl font-black text-white leading-none tracking-tighter">
                     {c.score}<span className="text-orange-600 text-2xl font-bold ml-1">/10</span>
                   </p>
                </div>
                <div className="w-full">
                  <RangeSlider value={c.score} onChange={(v: number) => {
                    const newC = [...criteria];
                    newC[idx].score = v;
                    setCriteria(newC);
                  }} />
                  <div className="flex justify-between mt-6 text-[10px] font-black text-slate-800 uppercase px-1">
                    <span>Deficiente</span>
                    <span>Excelente</span>
                  </div>
                </div>
              </div>

              {/* BLOQUE DE EVIDENCIA: Único cuadro editable */}
              <div className="space-y-4 px-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidencia ISO 9001 (Hechos Observados)</span>
                <textarea 
                  value={c.feedback}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Escriba aquí los hechos técnicos o situaciones observadas para la auditoría..."
                  className="w-full h-44 bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 text-white text-lg font-medium outline-none focus:border-orange-600/50 transition-all resize-none shadow-2xl"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleFinish} 
        disabled={loading} 
        className="w-full bg-orange-600 text-white py-10 rounded-[3.5rem] font-black uppercase text-base shadow-2xl flex items-center justify-center gap-4 hover:bg-orange-500 transition-all active:scale-95"
      >
        {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={32} />}
        {loading ? 'Sincronizando con RR Etiquetas...' : 'Finalizar y Guardar Evaluación'}
      </button>
    </div>
  );
};
