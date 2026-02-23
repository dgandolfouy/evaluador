import React, { useState } from 'react';
import { Employee, Criterion } from '../types';
import { Plus, Trash2, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { RangeSlider } from './RangeSlider';
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32 animate-fade-in">
      <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
        <button onClick={onCancel} className="text-slate-500 mb-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"><ArrowLeft size={14}/> Volver</button>
        <p className="text-orange-500 font-black text-3xl uppercase tracking-tighter leading-none mb-2">{employee.name}</p>
        <p className="text-slate-400 text-xs font-bold uppercase">{employee.jobTitle} • {employee.department}</p>
      </div>

      <div className="space-y-6">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm transition-all hover:border-slate-700">
            <h4 className="text-[12px] font-black text-white uppercase tracking-widest mb-8 border-b border-slate-800 pb-2">{c.name}</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex justify-between items-end mb-4">
                   <span className="text-xs font-bold text-slate-500 uppercase">Puntuación</span>
                   <span className="text-3xl font-black text-white">{c.score}<span className="text-slate-700 text-lg">/10</span></span>
                </div>
                <RangeSlider 
                  value={c.score} 
                  onChange={(v) => {
                    const newC = [...criteria];
                    newC[idx].score = v;
                    setCriteria(newC);
                  }} 
                />
                <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                  <span>Deficiente</span>
                  <span>Sobresaliente</span>
                </div>
              </div>

              {/* ESTE ES EL CAMBIO: Cuadro de texto funcional */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidencia ISO 9001</span>
                  <span className="text-[10px] font-bold text-slate-700">{c.feedback?.length || 0}/500</span>
                </div>
                <textarea 
                  value={c.feedback || ''}
                  onChange={(e) => {
                    const newC = [...criteria];
                    newC[idx].feedback = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="Describa hechos, datos o situaciones observadas..."
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 text-xs outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-8">
        <button onClick={onCancel} className="flex-1 bg-slate-900 text-slate-400 py-5 rounded-3xl font-black uppercase text-xs border border-slate-800 hover:text-white transition-all">Cancelar</button>
        <button onClick={handleFinish} disabled={loading} className="flex-[2] bg-orange-600 text-white py-5 rounded-3xl font-black uppercase text-xs shadow-xl shadow-orange-900/40 flex items-center justify-center gap-3 hover:bg-orange-500 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
          {loading ? 'Generando Informe IA...' : 'Finalizar Evaluación'}
        </button>
      </div>
    </div>
  );
};
