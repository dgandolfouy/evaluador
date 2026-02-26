import React from 'react';

export const A4Report = ({ employee, criteria, analysis }: any) => {
  return (
    <div id="printable-report" className="hoja-a4-rr bg-white text-black p-10 max-w-[210mm] mx-auto shadow-2xl rounded-sm">
      <div className="flex justify-between items-center border-b-2 border-orange-500 pb-4 mb-6">
        <p className="font-black text-xl uppercase tracking-tighter">RR Etiquetas</p>
        <p className="text-orange-600 text-[10px] font-bold uppercase tracking-widest">Auditoría ISO 9001:2015</p>
      </div>
      <div className="mb-8">
        <p className="text-slate-400 font-bold uppercase text-[9px]">Colaborador Evaluado</p>
        <p className="font-black text-lg uppercase">{employee?.name}</p>
        <p className="text-sm text-slate-600 uppercase">{employee?.jobTitle} - {employee?.department}</p>
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
        <table className="w-full text-xs">
            <thead>
                <tr className="border-b border-slate-200 text-left">
                    <th className="py-2">Criterio</th>
                    <th className="py-2 text-right">Puntaje</th>
                </tr>
            </thead>
            <tbody>
                {criteria?.map((c: any) => (
                    <tr key={c.id} className="border-b border-slate-100">
                        <td className="py-2">{c.name}</td>
                        <td className="py-2 text-right font-bold">{c.score}/10</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
