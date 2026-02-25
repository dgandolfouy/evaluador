import React from 'react';

export const A4Report = ({ employee, criteria, analysis }: any) => {
  return (
    <div className="reporte-imprimible bg-white text-slate-900 p-12 font-sans">
      <div className="flex justify-between items-center border-b-2 border-orange-500 pb-6 mb-8">
        <p className="font-black text-xl uppercase tracking-tighter text-slate-800">RR Etiquetas</p>
        <p className="text-orange-600 text-[9px] font-bold uppercase tracking-widest">ISO 9001:2015 AUDITORÍA</p>
      </div>
      <div className="mb-8">
        <p className="text-slate-400 font-bold uppercase text-[8px]">Colaborador</p>
        <p className="font-black text-lg uppercase text-slate-800">{employee?.name}</p>
        <p className="text-slate-500 text-xs font-medium">{employee?.jobtitle || employee?.jobTitle}</p>
      </div>
      <div className="mb-8">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2 border-b">Resumen de Desempeño</h3>
        <p className="text-sm italic leading-relaxed text-slate-700">
          {analysis?.summary || 'Evaluación técnica completada. Análisis ISO 9001 pendiente de sincronización.'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-10">
        <div>
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3">Fortalezas Técnicas</h3>
          <ul className="text-xs space-y-2 text-slate-700 font-medium">
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
