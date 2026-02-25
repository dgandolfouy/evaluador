import React from 'react';

export const A4Report = ({ employee, criteria, analysis }: any) => {
  return (
    <div className="hoja-a4-rr bg-white text-slate-900 p-10 font-sans shadow-none">
       {/* Logo y Encabezado */}
       <div className="flex justify-between items-center border-b-2 border-orange-500 pb-4 mb-6">
          <p className="font-black text-xl uppercase tracking-tighter">RR Etiquetas</p>
          <p className="text-[10px] font-bold uppercase text-orange-600">Auditoría ISO 9001:2015</p>
       </div>
       <div className="mb-6">
          <p className="text-slate-400 font-bold uppercase text-[9px]">Colaborador</p>
          <p className="font-black text-lg">{employee.name}</p>
       </div>
       <div className="mb-6">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Resumen</h3>
          <p className="text-xs italic leading-relaxed">{analysis?.summary}</p>
       </div>
       {/* Tabla de puntajes */}
       <div className="space-y-2">
          {criteria.map((c: any) => (
            <div key={c.id} className="flex justify-between text-[10px] border-b border-slate-100 py-1">
              <span className="font-bold">{c.name}</span>
              <span className="font-black">{c.score}/10</span>
            </div>
          ))}
       </div>
    </div>
  );
};
