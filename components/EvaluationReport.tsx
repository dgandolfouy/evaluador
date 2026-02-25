import React from 'react';
import { AnalysisResult, Employee, Criterion } from '../types';

export const EvaluationReport = ({ employee, criteria, analysis }: { employee: Employee, criteria: Criterion[], analysis: AnalysisResult }) => {
  return (
    <div className="bg-white text-slate-900 p-12 w-[210mm] min-h-[297mm] mx-auto shadow-sm print:shadow-none print:p-8 font-sans leading-relaxed">
      {/* HEADER CON LOGO */}
      <div className="flex justify-between items-start border-b-4 border-orange-500 pb-8 mb-8">
        <div className="w-48">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 445.41 237.71" className="w-full">
            <path fill="#ef7d00" d="M312.16,3.22c-52.77,0-95.56,42.79-95.56,95.56s42.79,95.56,95.56,95.56v-3.19c-51.01,0-92.38-41.37-92.38-92.38S261.15,6.4,312.16,6.4v-3.19h0Z"/>
            <path fill="#0f172a" fillRule="evenodd" d="M101.92,3.22C49.15,3.22,6.35,46.01,6.35,98.78s42.79,95.56,95.56,95.56,95.56-42.79,95.56-95.56S154.69,3.22,101.92,3.22ZM82.59,137.01c-7.81,0-11.25-5.46-13.67-9.31-2.47-4.18-5.08-8.62-7.83-13.4-2-3.49-2.28-5.71-2.28-9.7v-9.92h10.17c4.68-.01,9.27-4.1,9.28-9.01,0-4.61-4.23-8.36-9.81-8.36h-13.82v52.68c0,3.86-3.16,7.03-7.03,7.03h-15.19V60.55h40.04c16.36,0,25.95,11.68,26.2,23.54.22,10.01-6.02,20.16-17.59,23.51l18.53,29.4h-17.01.01ZM156.19,137.01c-7.81,0-11.25-5.46-13.67-9.31-2.47-4.18-5.09-8.62-7.83-13.4-2-3.49-2.28-5.71-2.28-9.7v-9.92h10.17c4.68-.01,9.28-4.1,9.28-9,0-4.61-4.23-8.36-9.81-8.36h-13.82v52.68c0,3.86-3.16,7.03-7.03,7.03h-15.19V60.55h40.04c16.36,0,25.95,11.68,26.2,23.54.22,10.01-6.02,20.15-17.59,23.51l18.53,29.4h-17.01,0Z"/>
          </svg>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-black text-slate-900 uppercase">Informe de Competencia</h1>
          <p className="text-orange-600 font-bold text-sm tracking-widest">SISTEMA ISO 9001:2015</p>
          <p className="text-slate-400 text-xs font-mono mt-1">Ref: RR-AUD-2026</p>
        </div>
      </div>

      {/* INFO EMPLEADO */}
      <div className="grid grid-cols-2 gap-8 mb-10 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Colaborador</p>
          <p className="text-xl font-black text-slate-800">{employee.name}</p>
          <p className="text-sm font-medium text-slate-500">{employee.jobtitle || employee.jobTitle}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado Auditoría</p>
          <span className="inline-block bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-xs font-black uppercase">
            {analysis.isoComplianceLevel || 'Evaluado'}
          </span>
          <p className="text-xs text-slate-500 mt-2">{new Date().toLocaleDateString('es-UY')}</p>
        </div>
      </div>

      {/* RESUMEN IA */}
      <div className="mb-10">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Resumen Ejecutivo
        </h3>
        <p className="text-lg text-slate-700 font-medium italic border-l-4 border-slate-200 pl-6 py-2">
          "{analysis.summary}"
        </p>
      </div>

      {/* GRÁFICA / PUNTUACIONES */}
      <div className="mb-10">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Puntuación por Criterio Técnico</h3>
        <div className="space-y-4">
          {criteria.map(c => (
            <div key={c.id} className="flex items-center gap-4">
              <p className="w-40 text-xs font-bold text-slate-600 uppercase leading-tight">{c.name}</p>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-orange-500" style={{ width: `${c.score * 10}%` }}></div>
              </div>
              <p className="w-12 text-right text-sm font-black text-slate-800">{c.score}<span className="text-[10px] text-slate-400">/10</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* FORTALEZAS Y MEJORAS */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
          <h4 className="text-emerald-700 text-xs font-black uppercase mb-4 tracking-widest flex items-center gap-2">✔ Fortalezas</h4>
          <ul className="text-sm space-y-2 text-emerald-900 font-medium">
            {analysis.strengths.map((s, i) => <li key={i} className="flex gap-2"><span>•</span> {s}</li>)}
          </ul>
        </div>
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
          <h4 className="text-amber-700 text-xs font-black uppercase mb-4 tracking-widest flex items-center gap-2">⚠ Áreas de Mejora</h4>
          <ul className="text-sm space-y-2 text-amber-900 font-medium">
            {analysis.weaknesses.map((w, i) => <li key={i} className="flex gap-2"><span>•</span> {w}</li>)}
          </ul>
        </div>
      </div>

      {/* PLAN DE CAPACITACIÓN */}
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-orange-500">Plan de Capacitación Sugerido (ISO 9001:7.2)</h4>
        <div className="space-y-3">
          {analysis.trainingPlan.map((t, i) => (
            <div key={i} className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center text-[10px] font-black">{i + 1}</span>
              <p className="text-sm font-bold text-white/90 leading-snug">{t}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
        <div>
          <div className="w-40 h-[1px] bg-slate-300 mb-2"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Firma Auditor ISO</p>
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">RR Etiquetas Uruguay - 2026</p>
      </div>
    </div>
  );
};
