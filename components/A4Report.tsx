import React from 'react';
import { Logo } from './Logo';

export const A4Report = ({ employee, criteria, analysis, date, evaluatorName }: any) => {
  return (
    <div id="printable-report" className="hoja-a4-rr bg-white text-black p-10 max-w-[210mm] mx-auto shadow-2xl rounded-sm">
      <div className="flex justify-between items-center border-b-2 border-orange-500 pb-4 mb-6">
        <Logo className="w-48 text-black" variant="pdf" />
        <div className="text-right">
          <p className="text-orange-600 text-[10px] font-bold uppercase tracking-widest">Auditoría ISO 9001:2015</p>
          <p className="text-slate-400 text-[9px] font-bold uppercase mt-1">{date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Evaluación de Desempeño {new Date(date || Date.now()).getFullYear()}</h1>
        <div className="w-16 h-1 bg-orange-500 mx-auto mt-2"></div>
      </div>

      <div className="mb-8 flex justify-between items-end">
        <div>
          <p className="text-slate-400 font-bold uppercase text-[9px]">Colaborador Evaluado</p>
          <p className="font-black text-lg uppercase">{employee?.name}</p>
          <p className="text-sm text-slate-600 uppercase">{employee?.jobTitle} - {employee?.department}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 font-bold uppercase text-[9px]">Evaluado por</p>
          <p className="font-bold text-sm text-slate-800 capitalize">{evaluatorName?.toLowerCase() || 'Administrador'}</p>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Análisis de Desempeño</h3>
        <p className="text-sm italic leading-relaxed text-slate-700 border-l-4 border-slate-200 pl-4">
          {analysis?.summary || 'Evaluación técnica completada. Análisis ISO 9001 pendiente de sincronización.'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-10">
        <div>
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3">Fortalezas</h3>
          <ul className="text-xs space-y-2 text-slate-700">
            {analysis?.strengths?.map((s: string, i: number) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3 font-sans">Plan de Capacitación</h3>
          <ul className="text-xs space-y-2 text-slate-700 font-bold">
            {analysis?.trainingPlan?.map((t: string, i: number) => <li key={i}>• {t}</li>)}
          </ul>
        </div>
      </div>
      
      <div className="mt-10 pt-4 border-t border-slate-200">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3">Detalle de Evaluación</h3>
        <div className="space-y-4">
          {criteria?.map((c: any) => (
            <div key={c.id} className="flex items-center gap-4 text-xs border-b border-slate-100 pb-2">
              <div className="w-1/3 font-medium text-slate-800">{c.name}</div>
              <div className="flex-1 relative h-2 bg-slate-100 rounded-full">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full shadow-sm"
                  style={{ left: `${((c.score - 1) / 9) * 100}%` }}
                ></div>
              </div>
              <div className="w-10 text-right font-bold text-slate-900">{c.score}/10</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
