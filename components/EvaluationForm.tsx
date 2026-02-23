import React, { useState } from 'react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { RangeSlider } from './RangeSlider';

export const EvaluationForm = ({ employee, onComplete, onCancel }: any) => {
  const [criteria, setCriteria] = useState([
    { id: '1', name: 'Productividad', score: 5, feedback: '' },
    { id: '2', name: 'Calidad', score: 5, feedback: '' },
    { id: '3', name: 'Seguridad e Higiene', score: 5, feedback: '' },
    { id: '4', name: 'Trabajo en Equipo', score: 5, feedback: '' }
  ]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-10 space-y-12 pb-40">
      <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
        <button onClick={onCancel} className="text-slate-500 mb-4 flex items-center gap-1 text-[10px] font-black uppercase hover:text-white transition-colors">
          <ArrowLeft size={14}/> Volver al Panel
        </button>
        <p className="text-orange-500 font-black text-4xl uppercase tracking-tighter leading-none mb-2">{employee.name}</p>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{employee.jobTitle}</p>
      </div>

      <div className="space-y-16">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl relative">
            <h4 className="text-2xl font-black text-white uppercase mb-10 border-b border-slate-800 pb-4 tracking-widest">{c.name}</h4>
            
            <div className="space-y-12">
              {/* SELECTOR DE PUNTAJE GRANDE */}
              <div className="bg-slate-950 p-10 rounded-[3rem] border border-white/5 shadow-inner">
                <div className="flex justify-between items-end mb-10">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel de desempeño</p>
                   <p className="text-7xl font-black text-white leading-none tracking-tighter">{c.score}<span className="text-orange-600 text-2xl ml-1">/10</span></p>
                </div>
                <div className="px-4">
                  <RangeSlider value={c.score} onChange={(v: number) => {
                    const newC = [...criteria];
                    newC[idx].score = v;
                    setCriteria(newC);
                  }} />
                  <div className="flex justify-between mt-6 text-[10px] font-black text-slate-700 uppercase px-1 tracking-widest">
                    <span>Deficiente</span>
                    <span>Excelente</span>
                  </div>
                </div>
              </div>

              {/* ÚNICO CUADRO DE TEXTO CLARO */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Evidencia ISO 9001 (Hechos y Datos)</span>
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
          </div>
        ))}
      </div>

      <button onClick={() => onComplete(criteria, { isoComplianceLevel: "Alto", summary: "Evaluación completada manualmente.", strengths: [], weaknesses: [], trainingPlan: [] })} className="w-full bg-orange-600 text-white py-10 rounded-[3rem] font-black uppercase text-base shadow-2xl hover:bg-orange-500 transition-all active:scale-95">
        Finalizar Evaluación
      </button>
    </div>
  );
};
