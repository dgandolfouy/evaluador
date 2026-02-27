import React, { useRef, useState } from 'react';
import { A4Report } from './A4Report';
import { Printer, ArrowLeft, Share2, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export const EvaluationResult = ({ employee, criteria, analysis, evaluatorName, onBack }: any) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGeneratingPdf(true);
    try {
      // Small delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use html-to-image with specific settings to avoid CORS issues with fonts
      // We need to capture the element with white background explicitly
      const dataUrl = await toPng(reportRef.current, {
        quality: 1.0,
        backgroundColor: '#ffffff',
        filter: (node) => !node.classList?.contains('no-print'),
        skipAutoScale: true,
        cacheBust: true,
        pixelRatio: 2, // Higher resolution
        fontEmbedCSS: '', // Prevent CORS errors with Google Fonts
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Evaluacion_ISO9001_${employee.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to native print if PDF generation fails
      window.print();
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
${analysis.strengths.map((s: string) => `- ${s}`).join('\n')}

ÁREAS DE MEJORA:
${analysis.weaknesses.map((w: string) => `- ${w}`).join('\n')}

PLAN DE CAPACITACIÓN:
${analysis.trainingPlan.map((t: string) => `- ${t}`).join('\n')}
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
    <div className="space-y-8 pb-20">
      {/* Botonera Web - No se imprime */}
      <div className="no-print bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <button onClick={onBack} className="text-slate-500 mb-2 flex items-center gap-2 text-[10px] font-black uppercase hover:text-white">
            <ArrowLeft size={14}/> Volver
          </button>
          <h2 className="text-white font-black text-3xl uppercase tracking-tighter leading-none">{employee?.name}</h2>
          <p className="text-orange-500 text-xs font-bold uppercase mt-1">Evaluación Finalizada</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleDownloadPDF} 
            disabled={isGeneratingPdf}
            className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:bg-orange-500 transition-all shadow-lg shadow-orange-900/40 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
        </div>
      </div>

      {/* Web Summary View */}
      <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Loader2 size={14} className="text-orange-500" /> Resumen del Auditor IA
            </h3>
            <p className="text-xl text-white leading-relaxed font-medium italic">
              "{analysis?.summary}"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Fortalezas</h4>
              <ul className="space-y-3">
                {analysis?.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-slate-300 text-sm flex gap-3">
                    <span className="text-emerald-500 font-bold">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Áreas de Mejora</h4>
              <ul className="space-y-3">
                {analysis?.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="text-slate-300 text-sm flex gap-3">
                    <span className="text-red-500 font-bold">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cumplimiento ISO</p>
            <p className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter break-words">{analysis?.isoComplianceLevel}</p>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Plan de Capacitación</h4>
            <ul className="space-y-3">
              {analysis?.trainingPlan?.map((t: string, i: number) => (
                <li key={i} className="text-slate-300 text-sm flex gap-3">
                  <span className="text-blue-500 font-bold">•</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="no-print border-t border-slate-800 pt-12 mt-12">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 text-center">Vista Previa del Documento Oficial</p>
        <div className="bg-slate-950 p-4 sm:p-8 rounded-3xl border border-slate-800 overflow-x-auto">
          <div ref={reportRef} className="bg-white shadow-2xl mx-auto min-w-[800px] w-full max-w-[210mm]">
            <A4Report 
              employee={employee} 
              criteria={criteria} 
              analysis={analysis} 
              date={new Date().toISOString()} // Or pass the actual evaluation date if available
              evaluatorName={evaluatorName || "Supervisor"} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
