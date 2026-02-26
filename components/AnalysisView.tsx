import React, { useRef, useState } from 'react';
import { AnalysisResult, Employee, Criterion } from '../types';
import { CheckCircle, AlertTriangle, BookOpen, User, Printer, Share2, Award, Download, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface AnalysisViewProps {
  employee: Employee;
  criteria: Criterion[];
  analysis: AnalysisResult;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ employee, criteria, analysis, onReset }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const chartData = criteria.map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    score: c.score,
    full: 10
  }));

  const getScoreColor = (score: number) => {
    if (score < 5) return '#ef4444';
    if (score < 8) return '#eab308';
    return '#0ea5e9';
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGeneratingPdf(true);
    try {
      // Wait for a moment to ensure charts are rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await toPng(reportRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        filter: (node) => !node.classList?.contains('no-pdf')
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Evaluacion_ISO9001_${employee.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to native print if PDF generation fails
      if (confirm("Hubo un problema generando el archivo PDF automáticamente. ¿Desea abrir el diálogo de impresión para guardarlo como PDF?")) {
        window.print();
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = async () => {
    const textData = `
EVALUACIÓN DE COMPETENCIA - ISO 9001 (RR ETIQUETAS)
--------------------------------------------------
Colaborador: ${employee.name}
Puesto: ${employee.jobTitle}
Departamento: ${employee.department}
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
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(textData);
        alert('Informe copiado al portapapeles. Puede pegarlo en WhatsApp o Email.');
      } catch (err) {
        const subject = encodeURIComponent(`Evaluación de Competencia: ${employee.name}`);
        const body = encodeURIComponent(textData);
        window.open(`mailto:?subject=${subject}&body=${body}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <div id="printable-report" ref={reportRef} className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden print:shadow-none border border-slate-100 print:border-none">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Award size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white text-slate-900 rounded-xl flex items-center justify-center font-black text-2xl">RR</div>
              <div className="h-8 w-px bg-slate-700"></div>
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">ISO 9001:2015 Auditoría</div>
            </div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">Informe de Competencia</h1>
            <p className="text-slate-400 text-lg font-medium">Análisis detallado de desempeño y brechas de formación</p>
          </div>
        </div>

        {/* Employee Info Bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                    <User size={28} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Colaborador</p>
                    <p className="font-bold text-slate-900 text-lg leading-tight">{employee.name}</p>
                </div>
            </div>
            <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Puesto</p>
                 <p className="font-bold text-slate-700 leading-tight">{employee.jobTitle}</p>
            </div>
            <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Departamento</p>
                 <p className="font-bold text-slate-700 leading-tight">{employee.department}</p>
            </div>
            <div className="md:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cumplimiento ISO</p>
                <span className={`inline-block px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                    analysis.isoComplianceLevel.includes('Excelente') || analysis.isoComplianceLevel.includes('Alto') 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                    {analysis.isoComplianceLevel}
                </span>
            </div>
        </div>

        <div className="p-10 space-y-12">
            
            {/* Summary */}
            <section>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Resumen Ejecutivo
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg italic font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    "{analysis.summary}"
                </p>
            </section>

            {/* Chart */}
            <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Puntuación por Criterio</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                          <XAxis type="number" domain={[0, 10]} hide />
                          <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 11, fontWeight: 600, fill: '#64748b'}} />
                          <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                              cursor={{fill: '#f8fafc'}}
                          />
                          <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={24}>
                              {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Strengths */}
                <section className="bg-emerald-50/30 p-8 rounded-3xl border border-emerald-100/50">
                    <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <CheckCircle className="text-emerald-500" size={20}/>
                        Fortalezas
                    </h3>
                    <ul className="space-y-4">
                        {analysis.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                {str}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Weaknesses / Opportunities */}
                <section className="bg-amber-50/30 p-8 rounded-3xl border border-amber-100/50">
                    <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" size={20}/>
                        Áreas de Mejora
                    </h3>
                    <ul className="space-y-4">
                        {analysis.weaknesses.map((weak, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                {weak}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* Training Plan (ISO Critical) */}
            <section className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <BookOpen className="text-blue-400" size={20}/>
                      Plan de Capacitación Sugerido (ISO 9001:7.2)
                  </h3>
                  <div className="grid gap-4">
                      {analysis.trainingPlan.map((plan, idx) => (
                          <div key={idx} className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex items-center gap-5 group hover:bg-white/10 transition-all">
                              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/20">
                                  {idx + 1}
                              </span>
                              <p className="text-slate-200 font-bold text-lg">{plan}</p>
                          </div>
                      ))}
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 opacity-5">
                  <BookOpen size={300} />
                </div>
            </section>

            <div className="flex flex-col-reverse md:flex-row justify-between items-center pt-10 border-t border-slate-100 gap-6 print:hidden no-pdf">
                <button 
                    onClick={onReset}
                    className="text-slate-400 hover:text-slate-900 font-bold px-6 py-3 transition-all uppercase tracking-widest text-xs"
                >
                    Nueva Evaluación
                </button>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <button 
                        onClick={handleShare}
                        className="flex-1 md:flex-none border border-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-bold shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                    >
                        <Share2 size={18} />
                        Compartir
                    </button>
                    
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPdf}
                        className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-slate-800 hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        {isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
