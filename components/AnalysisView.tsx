import React from 'react';
import { AnalysisResult, Employee, Criterion } from '../types';
import { CheckCircle, AlertTriangle, BookOpen, User, Printer, Share2, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisViewProps {
  employee: Employee;
  criteria: Criterion[];
  analysis: AnalysisResult;
  onReset: () => void;
  evaluatorId?: string;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ employee, criteria, analysis, onReset, evaluatorId }) => {
  const chartData = criteria.map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    score: c.score,
    full: 10
  }));

  const allRoles = [
    { jobTitle: employee.jobTitle, department: employee.department, reportsTo: employee.reportsTo },
    ...(employee.additionalRoles || [])
  ];

  const relevantRoles = evaluatorId 
    ? allRoles.filter(r => r.reportsTo === evaluatorId)
    : allRoles;

  const getScoreColor = (score: number) => {
    if (score < 5) return '#ef4444';
    if (score < 8) return '#eab308';
    return '#f97316'; // orange-500
  };

  const handleShare = async () => {
    const rolesStr = relevantRoles.map(r => `${r.jobTitle} (${r.department})`).join(', ');
    const textData = `
EVALUACIÓN DE COMPETENCIA - ISO 9001 (RR ETIQUETAS)
--------------------------------------------------
Colaborador: ${employee.name}
Funciones Evaluadas: ${rolesStr}
Nivel de Cumplimiento: ${analysis.isoComplianceLevel}

RESUMEN:
${analysis.summary}

FORTALEZAS:
${analysis.strengths.map(s => `- ${s}`).join('\n')}

ÁREAS DE MEJORA:
${analysis.weaknesses.map(w => `- ${w}`).join('\n')}

PLAN DE CAPACITACIÓN:
${analysis.trainingPlan.map(t => `- ${t}`).join('\n')}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Evaluación ISO 9001 - ${employee.name}`,
          text: textData,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      const subject = encodeURIComponent(`Evaluación de Competencia: ${employee.name}`);
      const body = encodeURIComponent(textData);
      window.open(`mailto:?subject=${subject}&body=${body}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 sm:pb-20 animate-fade-in">
      <div className="bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden print:shadow-none border border-slate-800">
        
        {/* Header */}
        <div className="bg-orange-600 text-white p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Award size={window.innerWidth < 640 ? 120 : 200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-orange-600 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl">RR</div>
              <div className="h-6 sm:h-8 w-px bg-orange-400"></div>
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-orange-200">ISO 9001:2015 Auditoría</div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black mb-2 tracking-tight">Informe de Competencia</h1>
            <p className="text-orange-100 text-sm sm:text-lg font-medium">Análisis detallado de desempeño y brechas de formación</p>
          </div>
        </div>

        {/* Employee Info Bar */}
        <div className="bg-slate-800 border-b border-slate-700 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-700 shadow-sm border border-slate-600 flex items-center justify-center text-slate-400">
                    <User size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Colaborador</p>
                    <p className="font-bold text-white text-base sm:text-lg leading-tight truncate">{employee.name}</p>
                </div>
            </div>
            <div className="md:col-span-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Funciones Evaluadas</p>
                 <div className="font-bold text-slate-300 leading-tight text-sm sm:text-base space-y-1">
                   {relevantRoles.map((r, i) => (
                     <div key={i}>{r.jobTitle} <span className="text-[10px] opacity-60 italic">({r.department})</span></div>
                   ))}
                 </div>
            </div>
            <div className="sm:text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cumplimiento ISO</p>
                <span className={`inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest ${
                    analysis.isoComplianceLevel.includes('Excelente') || analysis.isoComplianceLevel.includes('Alto') 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                    {analysis.isoComplianceLevel}
                </span>
            </div>
        </div>

        <div className="p-6 sm:p-10 space-y-8 sm:space-y-12">
            
            {/* Summary */}
            <section>
                <h3 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Resumen Ejecutivo
                </h3>
                <p className="text-slate-300 leading-relaxed text-base sm:text-lg italic font-medium bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-700">
                    "{analysis.summary}"
                </p>
            </section>

            {/* Chart */}
            <section className="bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-700 shadow-sm">
                <h3 className="text-[10px] sm:text-sm font-black text-white uppercase tracking-widest mb-6">Puntuación por Criterio</h3>
                <div className="h-60 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                          <XAxis type="number" domain={[0, 10]} hide />
                          <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                          <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', padding: '10px', backgroundColor: '#1e293b', color: '#fff' }}
                              cursor={{fill: '#334155'}}
                              itemStyle={{ color: '#fff', fontSize: '12px' }}
                          />
                          <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
                              {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                {/* Strengths */}
                <section className="bg-emerald-900/10 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-emerald-500/20">
                    <h3 className="text-[10px] sm:text-sm font-black text-emerald-400 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
                        <CheckCircle className="text-emerald-500 sm:w-5 sm:h-5" size={18}/>
                        Fortalezas
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                        {analysis.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-300 font-medium text-xs sm:text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                {str}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Weaknesses / Opportunities */}
                <section className="bg-amber-900/10 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-amber-500/20">
                    <h3 className="text-[10px] sm:text-sm font-black text-amber-400 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500 sm:w-5 sm:h-5" size={18}/>
                        Áreas de Mejora
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                        {analysis.weaknesses.map((weak, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-300 font-medium text-xs sm:text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                {weak}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* Training Plan (ISO Critical) */}
            <section className="bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 text-white relative overflow-hidden border border-slate-700">
                <div className="relative z-10">
                  <h3 className="text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-6 sm:mb-8 flex items-center gap-2">
                      <BookOpen className="text-orange-400 sm:w-5 sm:h-5" size={18}/>
                      Plan de Capacitación Sugerido (ISO 9001:7.2)
                  </h3>
                  <div className="grid gap-3 sm:gap-4">
                      {analysis.trainingPlan.map((plan, idx) => (
                          <div key={idx} className="bg-slate-900/50 backdrop-blur-md p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/5 flex items-center gap-4 sm:gap-5 group hover:bg-slate-900 transition-all">
                              <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-lg shadow-orange-600/20">
                                  {idx + 1}
                              </span>
                              <p className="text-slate-200 font-bold text-base sm:text-lg">{plan}</p>
                          </div>
                      ))}
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 opacity-5">
                  <BookOpen size={window.innerWidth < 640 ? 150 : 300} />
                </div>
            </section>

            <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-8 sm:pt-10 border-t border-slate-800 gap-6 print:hidden">
                <button 
                    onClick={onReset}
                    className="text-slate-500 hover:text-white font-bold px-6 py-3 transition-all uppercase tracking-widest text-[10px] sm:text-xs"
                >
                    Nueva Evaluación
                </button>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                    <button 
                        onClick={handleShare}
                        className="w-full sm:w-auto border border-slate-700 text-slate-400 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-sm hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Compartir
                    </button>
                    
                    <button 
                        onClick={() => window.print()}
                        className="w-full sm:w-auto bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-xl hover:bg-orange-50 hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <Printer size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Imprimir / PDF
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
