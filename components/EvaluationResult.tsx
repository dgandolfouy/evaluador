import React from 'react';
import { A4Report } from './A4Report';
import { Printer, ArrowLeft } from 'lucide-react';

export const EvaluationResult = ({ employee, criteria, analysis, onBack }: any) => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <div className="no-print bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex justify-between items-center mb-8">
        <div>
          <button onClick={onBack} className="text-slate-500 mb-2 flex items-center gap-2 text-[10px] font-black uppercase hover:text-white">
            <ArrowLeft size={14}/> Volver
          </button>
          <h2 className="text-white font-black text-3xl uppercase leading-none">{employee.name}</h2>
        </div>
        <button onClick={() => window.print()} className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2">
          <Printer size={18} /> Imprimir Reporte A4
        </button>
      </div>
      <A4Report employee={employee} criteria={criteria} analysis={analysis} />
    </div>
  );
};
