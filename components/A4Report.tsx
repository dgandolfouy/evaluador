import React from 'react';

export const A4Report = ({ employee, criteria, analysis }: any) => {
  return (
    <div className="hoja-a4-rr bg-white text-slate-900 p-12 font-sans border border-slate-100 shadow-none">
      <div className="flex justify-between items-center border-b-2 border-orange-500 pb-6 mb-8">
        <p className="font-black text-xl uppercase tracking-tighter text-slate-800">RR Etiquetas</p>
        <p className="text-orange-600 text-[9px] font-bold uppercase tracking-widest">ISO 9001 Auditoría</p>
      </div>
      <div className="mb-8">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Resumen de Auditoría</h3>
        <p className="text-sm italic leading-relaxed border-l-4 border-slate-200 pl-4">
          "{analysis?.summary || 'Evaluación técnica completada. Análisis ISO 9001 pendiente de sincronización.'}"
        </p>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3">Fortalezas</h3>
          <ul className="text-xs space-y-2 text-slate-700">
            {analysis?.strengths?.map((s: string, i: number) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3">Plan de Capacitación</h3>
          <ul className="text-xs space-y-2 text-slate-700 font-bold">
            {analysis?.trainingPlan?.map((t: string, i: number) => <li key={i}>• {t}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};
