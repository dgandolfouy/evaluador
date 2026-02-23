import React, { useState } from 'react';
import { RangeSlider } from './RangeSlider';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export const EvaluationForm = ({ employee, onComplete, onCancel }: any) => {
  const [criteria, setCriteria] = useState([
    { id: '1', name: 'Productividad', score: 5, feedback: '' },
    { id: '2', name: 'Calidad del Trabajo', score: 5, feedback: '' },
    { id: '3', name: 'Seguridad e Higiene', score: 5, feedback: '' },
    { id: '4', name: 'Trabajo en Equipo', score: 5, feedback: '' }
  ]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-10 space-y-8 pb-40">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <button onClick={onCancel} className="text-slate-500 mb-2 flex items-center gap-1 text-[10px] font-black uppercase"><ArrowLeft size={14}/> Volver</button>
        <p className="text-orange-500 font-black text-3xl uppercase tracking-tighter leading-none">{employee.name}</p>
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{employee.jobTitle}</p>
      </div>

      <div className="space-y-8">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-8 sm:p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl">
            <h4 className="text-xl font-black text-white uppercase mb-8 border-b border-slate-800 pb-4 tracking-widest">{c.name}</h4>
            
            <div className="flex flex-col gap-10">
              {/* SELECTOR ESTIRADO AL 100% */}
              <div className="bg-slate-950 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                <div className="flex justify-between items-center mb-8">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Puntaje</p>
                   <p className="text-5xl font-black text-white">{c.score}<span className="text-orange-600 text-xl font-bold ml-1">/10</span></p>
                </div>
                <div className="w-full">
                  <RangeSlider value={c.score} onChange={(v: number) => {
                    const newC = [...criteria];
                    newC[idx].score = v;
                    setCriteria(newC);
                  }} />
                </div>
              </div>

              {/* ÚNICO CUADRO DE EVIDENCIA */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Evidencia ISO 9001</span>
                <textarea 
                  value={c.feedback}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Escriba hechos y situaciones observadas..."
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-white text-base outline-none focus:border-orange-600/50 transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => onComplete(criteria, { summary: "Registro manual" })} className="w-full bg-orange-600 text-white py-8 rounded-[2.5rem] font-black uppercase text-sm shadow-2xl hover:bg-orange-500 transition-all">
        Finalizar Evaluación
      </button>
    </div>
  );
};
