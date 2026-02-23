import React, { useState } from 'react';
import { Employee, Criterion } from '../types';
import { Plus, Trash2, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { RangeSlider } from './RangeSlider';
import { analyzeEvaluation } from '../services/geminiService';

interface EvaluationFormProps {
  employee: Employee;
  initialCriteria: Criterion[];
  onComplete: (criteria: Criterion[], analysis: any) => void;
  onCancel: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ 
  employee, 
  initialCriteria, 
  onComplete, 
  onCancel 
}) => {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria);
  const [loading, setLoading] = useState(false);
  const [manualName, setManualName] = useState('');

  const handleAddManual = () => {
    if (!manualName.trim()) return;
    const newCrit: Criterion = {
      id: Date.now().toString(),
      name: manualName.trim(),
      description: 'Criterio manual de Calidad',
      score: 5,
      category: 'Manual'
    };
    setCriteria([...criteria, newCrit]);
    setManualName('');
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // El Gerente termina su parte y aquí la IA genera el informe en segundo plano
      const analysis = await analyzeEvaluation(employee, criteria);
      onComplete(criteria, analysis);
    } catch (e) {
      console.error("Error en análisis IA:", e);
      onComplete(criteria, null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-32 animate-fade-in">
      <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
        <button onClick={onCancel} className="text-slate-500 mb-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={14}/> Volver
        </button>
        <p className="text-orange-500 font-black text-2xl uppercase tracking-tighter leading-none">{employee.name}</p>
        <p className="text-slate-400 text-xs font-bold uppercase mt-1">{employee.jobTitle} • {employee.department}</p>
      </div>

      <div className="space-y-4">
        {criteria.map((c, idx) => (
          <div key={c.id} className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[11px] font-black text-white uppercase tracking-tight">{c.name}</label>
              {c.category === 'Manual' && (
                <button onClick={() => setCriteria(criteria.filter((_, i) => i !== idx))} className="text-red-500/50 hover:text-red-500 transition-colors">
                  <Trash2 size={16}/>
                </button>
              )}
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
      </div>

      {/* SECCIÓN PARA CALIDAD: Agregar criterios sobre la marcha */}
      <div className="p-6 bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-800">
        <p className="text-[10px] font-black text-slate-500 uppercase mb-4 text-center tracking-widest">Criterio específico de Calidad</p>
        <div className="flex gap-2">
          <input 
            value={manualName} 
            onChange={e => setManualName(e.target.value)} 
            placeholder="Ej: Uso de elementos de seguridad..." 
            className="flex-1 bg-slate-800 p-4 rounded-2xl text-white text-xs outline-none border border-slate-700" 
          />
          <button onClick={handleAddManual} className="bg-slate-700 p-4 rounded-2xl text-white hover:bg-slate-600 transition-all">
            <Plus size={20}/>
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-6 sticky bottom-20 sm:bottom-4 z-20">
        <button onClick={onCancel} className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black uppercase text-xs border border-slate-700">
          Cancelar
        </button>
        <button 
          onClick={handleFinish} 
          disabled={loading} 
          className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-orange-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />} 
          {loading ? 'Procesando Informe...' : 'Finalizar Evaluación'}
        </button>
      </div>
    </div>
  );
};
