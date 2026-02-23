import React, { useState } from 'react';
import { RangeSlider } from './RangeSlider';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { analyzeEvaluation } from '../services/geminiService';
import { Criterion } from '../types';

export const EvaluationForm = ({ employee, onComplete, onCancel }: any) => {
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: '1', name: 'Productividad', score: 5, feedback: '', category: 'Desempeño' },
    { id: '2', name: 'Calidad ISO', score: 5, feedback: '', category: 'Calidad' },
    { id: '3', name: 'Seguridad e Higiene', score: 5, feedback: '', category: 'Calidad' },
    { id: '4', name: 'Trabajo en Equipo', score: 5, feedback: '', category: 'Competencias Blandas' },
    { id: '5', name: 'Mantenimiento de Puesto', score: 5, feedback: '', category: 'Actitud' }
  ]);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const analysis = await analyzeEvaluation(employee, criteria);
      onComplete(criteria, analysis);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      alert("Error al analizar con IA. Se guardará con resumen manual.");
      onComplete(criteria, {
        summary: "Registro de evaluación finalizado. Revisión manual pendiente.",
        strengths: [],
        weaknesses: [],
        trainingPlan: ["Atención: Análisis AI falló."],
        isoComplianceLevel: "Pendiente"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-40 animate-fade-in text-slate-200">
      {/* Header - Compact */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-[1.5rem] border border-slate-800 shadow-2xl">
        <button onClick={onCancel} className="text-slate-500 mb-3 flex items-center gap-1 text-[10px] font-black uppercase hover:text-white transition-colors">
          <ArrowLeft size={14} /> Volver
        </button>
        <h2 className="text-orange-500 font-black text-3xl sm:text-4xl uppercase tracking-tighter leading-none mb-1">{employee.name}</h2>
        <p className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{employee.jobtitle || employee.jobTitle} • {employee.department}</p>
      </div>

      {/* Criteria - More compact vertical stack */}
      <div className="space-y-4">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-5 sm:p-8 rounded-[1.5rem] border border-slate-800 shadow-xl flex flex-col gap-5 sm:gap-6">
            <div className="border-b border-slate-800/50 pb-3">
              <span className="text-[10px] font-black text-orange-500/50 uppercase tracking-widest mb-0.5 block">{c.category}</span>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">{c.name}</h4>
            </div>

            {/* Score Slider Block - Streamlined */}
            <div className="bg-slate-950/50 p-5 sm:p-6 rounded-[1rem] border border-white/5 space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Calificación</p>
                <p className="text-3xl sm:text-4xl font-black text-white">{c.score}<span className="text-orange-600 text-base ml-1">/10</span></p>
              </div>
              <div className="w-full">
                <RangeSlider value={c.score} onChange={(v: number) => {
                  const newC = [...criteria];
                  newC[idx].score = v;
                  setCriteria(newC);
                }} />
              </div>
            </div>

            {/* Evidence Block - Compact */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Evidencia ISO 9001 (Auditoría)</label>
              <textarea
                value={c.feedback}
                onChange={(e) => {
                  const newC = [...criteria];
                  newC[idx].feedback = e.target.value;
                  setCriteria(newC);
                }}
                placeholder="Describa hechos observados o brechas..."
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-[1rem] p-4 text-white text-sm outline-none focus:border-orange-600/50 resize-none transition-all shadow-inner placeholder:opacity-30"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Button - Floating Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 z-50">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleFinish}
            disabled={loading}
            className="w-full bg-orange-600 text-white py-6 rounded-2xl font-black uppercase text-sm sm:text-base shadow-2xl hover:bg-orange-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>Analizando Desempeño...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={24} />
                <span>Finalizar y Generar Análisis</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
