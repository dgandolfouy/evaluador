import React from 'react';

export const A4Report = ({ employee, criteria, analysis }: any) => {
  return (
    <div className="bg-white text-slate-900 p-10 w-[210mm] min-h-[297mm] mx-auto font-sans shadow-lg print:shadow-none print:m-0">
      {/* HEADER CON LOGO SVG */}
      <div className="flex justify-between items-center border-b-2 border-orange-500 pb-6 mb-8">
        <div className="w-44">
          <svg viewBox="0 0 445.41 237.71" xmlns="http://www.w3.org/2000/svg">
            <path fill="#ef7d00" d="M312.16,3.22c-52.77,0-95.56,42.79-95.56,95.56s42.79,95.56,95.56,95.56v-3.19c-51.01,0-92.38-41.37-92.38-92.38S261.15,6.4,312.16,6.4v-3.19h0Z"/>
            <path fill="#0f172a" fillRule="evenodd" d="M101.92,3.22C49.15,3.22,6.35,46.01,6.35,98.78s42.79,95.56,95.56,95.56,95.56-42.79,95.56-95.56S154.69,3.22,101.92,3.22ZM82.59,137.01c-7.81,0-11.25-5.46-13.67-9.31-2.47-4.18-5.08-8.62-7.83-13.4-2-3.49-2.28-5.71-2.28-9.7v-9.92h10.17c4.68-.01,9.27-4.1,9.28-9.01,0-4.61-4.23-8.36-9.81-8.36h-13.82v52.68c0,3.86-3.16,7.03-7.03,7.03h-15.19V60.55h40.04c16.36,0,25.95,11.68,26.2,23.54.22,10.01-6.02,20.16-17.59,23.51l18.53,29.4h-17.01.01ZM156.19,137.01c-7.81,0-11.25-5.46-13.67-9.31-2.47-4.18-5.09-8.62-7.83-13.4-2-3.49-2.28-5.71-2.28-9.7v-9.92h10.17c4.68-.01,9.28-4.1,9.28-9,0-4.61-4.23-8.36-9.81-8.36h-13.82v52.68c0,3.86-3.16,7.03-7.03,7.03h-15.19V60.55h40.04c16.36,0,25.95,11.68,26.2,23.54.22,10.01-6.02,20.15-17.59,23.51l18.53,29.4h-17.01,0Z"/>
          </svg>
        </div>
        <div className="text-right">
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">Reporte de Auditoría</h1>
          <p className="text-orange-600 font-bold text-[10px] tracking-[0.2em] mt-1">SISTEMA DE CALIDAD ISO 9001:2015</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Colaborador Evaluado</p>
          <p className="text-lg font-black text-slate-800">{employee.name}</p>
          <p className="text-xs text-slate-500 font-medium">{employee.jobtitle || employee.jobTitle}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Estado de Competencia</p>
          <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase mt-1">
            {analysis.isoComplianceLevel || 'Pendiente'}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resumen Ejecutivo</h3>
        <p className="text-sm text-slate-700 leading-relaxed italic border-l-4 border-slate-200 pl-4">
          "{analysis.summary}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Fortalezas Técnicas</h3>
          <ul className="text-xs space-y-2 text-slate-700 font-medium">
            {analysis.strengths.map((s: string, i: number) => <li key={i} className="flex gap-2"><span>•</span> {s}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Plan de Capacitación Sugerido</h3>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <ul className="text-xs space-y-2 text-orange-900 font-bold">
              {analysis.trainingPlan.map((t: string, i: number) => <li key={i} className="flex gap-2"><span>•</span> {t}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-end">
        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          RR Etiquetas Uruguay | Gestión de Procesos Certificados
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase hover:bg-orange-600 transition-colors no-print">
          Imprimir Reporte A4
        </button>
      </div>
    </div>
  );
};
