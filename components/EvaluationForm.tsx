import React, { useState } from 'react';
import { Employee, Criterion } from '../types';
import { Plus, BrainCircuit, ClipboardList, Trash2, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { RangeSlider } from './RangeSlider';
import { generateIsoCriteria, analyzeEvaluation } from '../services/geminiService';

interface EvaluationFormProps {
  employee: Employee;
  onComplete: (criteria: Criterion[], analysis: any) => void;
  onCancel: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ employee, onComplete, onCancel }) => {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualName, setManualName] = useState('');

  const handleAddManual = () => {
    if (!manualName.trim()) return;
    const newCrit: Criterion = {
      id: Date.now().toString(),
      name: manualName.trim(),
      description: 'Criterio definido manualmente por Calidad',
      score: 5,
      category: 'Manual'
    };
    setCriteria([...criteria, newCrit]);
    setManualName('');
  };

  const handleAutoGenerate = async () => {
    setLoading(true);
    try {
      const aiCriteria = await generateIsoCriteria(employee);
      // Adaptamos la respuesta de la IA a nuestra estructura
      setCriteria(aiCriteria.map((c: any) => ({ ...c, score: c.score || 5 })));
    } catch (e) {
      alert("Error al conectar con la IA. Probá el modo manual.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (criteria.length === 0) return alert("Agregá al menos un criterio");
    setLoading(true);
    try {
      const analysis = await analyzeEvaluation(employee, criteria);
      onComplete(criteria, analysis);
    } catch (e) {
      alert("Error procesando el análisis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-32">
      <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
        <h3 className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-1">Evaluando a:</h3>
        <p className="text-orange-500 font-black text-2xl uppercase tracking-tighter">{employee.name}</p>
        <p className="text-slate-400 text-xs font-bold uppercase">{employee.jobTitle} • {employee.department}</p>
      </div>

      {criteria.length === 0 && !loading ? (
        <div className="grid grid-cols-1 gap-4">
          <button onClick={handleAutoGenerate} className="p-8 bg-orange-600 rounded-[2.5rem] flex flex-col items-center gap-4 shadow-xl hover:bg-orange-500 transition-all">
            <BrainCircuit size={48} className="text-white" />
            <div className="text-center">
              <p className="text-white font-black uppercase text-sm">Generar Criterios con IA</p>
              <p className="text-orange-200 text-[10px] uppercase font-bold">Basado en Puesto e ISO 9001</p>
            </div>
          </button>

          <div className="p-6 bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-800 space-y-4">
            <div className="flex flex-col items-center gap-2 mb-2">
               <ClipboardList className="text-slate-600" />
               <p className="text-[10px] font-black text-slate-500 uppercase">O Definir Criterios de Calidad</p>
            </div>
            <div className="flex gap-2">
              <input 
                value={manualName} 
                onChange={e => setManualName(e.target.value)} 
                placeholder="Ej: Puntualidad y asistencia..." 
                className="flex-1 bg-slate-800 p-4 rounded-2xl text-white text-sm outline-none border border-slate-700" 
              />
              <button onClick={handleAddManual} className="bg-slate-700 p-4 rounded-2xl text-white"><Plus /></button>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-500 font-black uppercase text-[10px] tracking-widest py-4">Cancelar Evaluación</button>
        </div>
      ) : null}

      {criteria.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          {criteria.map((c, idx) => (
            <div key={c.id} className="bg-slate-900 p-5 rounded-3xl border border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <label className="text-[11px] font-black text-white uppercase tracking-tight flex-1">{c.name}</label>
                <button onClick={() => setCriteria(criteria.filter((_, i) => i !== idx))} className="text-slate-600 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
              <RangeSlider 
                value={c.score} 
                onChange={(v) => {
                  const newC = [...criteria];
                  newC[idx].score = v;
                  setCriteria(newC);
                }} 
              />
            </div>
          ))}

          <div className="flex gap-3 pt-6">
            <button onClick={onCancel} className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black uppercase text-xs">Cancelar</button>
            <button onClick={handleFinish} className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />} Finalizar y Analizar
            </button>
          </div>
        </div>
      )}

      {loading && criteria.length === 0 && (
        <div className="text-center py-20">
          <Loader2 className="animate-spin mx-auto text-orange-500 mb-4" size={40} />
          <p className="text-slate-500 font-black uppercase text-xs tracking-widest">Sincronizando con la IA...</p>
        </div>
      )}
    </div>
  );
};
