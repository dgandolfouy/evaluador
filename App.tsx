import React, { useState, useEffect } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation, Department } from './types';
import { analyzeEvaluation } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { AdminPanel } from './components/AdminPanel';
import { EvaluationForm } from './components/EvaluationForm';
import { AnalysisView } from './components/AnalysisView'; // Asegúrate que este archivo exista
import { Login } from './components/Login';
import { Logo } from './components/Logo';
import { INITIAL_EMPLOYEES, DEPARTMENTS } from './constants';
import { Settings, Users, LayoutDashboard, BarChart3, LogOut, ArrowLeft, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [history, setHistory] = useState<SavedEvaluation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [state, setState] = useState<EvaluationState>({
    step: 'dashboard',
    selectedEmployeeId: null,
    currentCriteria: [],
    analysis: null,
  });

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      if (data.employees) {
        setEmployees(data.employees);
        setDepartments(data.departments || DEPARTMENTS);
        setHistory(data.evaluations || []);
      }
    } catch (e) {
      setEmployees(INITIAL_EMPLOYEES);
      setDepartments(DEPARTMENTS);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const defaultCriteria: Criterion[] = [
    { id: '1', name: 'Productividad', description: 'Capacidad para cumplir con volúmenes y tiempos.', score: 5, category: 'Producción' },
    { id: '2', name: 'Calidad del Trabajo', description: 'Precisión técnica y estándares ISO 9001.', score: 5, category: 'Calidad' },
    { id: '3', name: 'Seguridad e Higiene', description: 'Uso de EPP y orden del puesto.', score: 5, category: 'Normativa' },
    { id: '4', name: 'Trabajo en Equipo', description: 'Actitud y colaboración grupal.', score: 5, category: 'Actitud' }
  ];

  const handleSaveEvaluation = async (criteria: Criterion[], analysis: any) => {
    setIsSaving(true);
    const newEval: SavedEvaluation = {
      id: Date.now().toString(),
      employeeId: state.selectedEmployeeId!,
      date: new Date().toISOString(), // Registro de fecha y hora
      criteria,
      analysis,
      evaluatorId: currentUser?.id || ''
    };

    const updatedHistory = [newEval, ...history];
    
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees, departments, evaluations: updatedHistory }),
      });
      setHistory(updatedHistory);
      // Tras guardar, mostramos el reporte para que Daniel pueda verlo
      setState({ ...state, step: 'report', analysis, currentCriteria: criteria });
    } catch (e) {
      alert("Error al guardar en la base de datos.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) return <Login employees={employees} onLogin={(u) => { setCurrentUser(u); setIsLoggedIn(true); }} />;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50 font-sans">
      <header className="bg-slate-900 border-b border-slate-800 h-28 flex items-center px-12 justify-between sticky top-0 z-50">
        <Logo className="w-44" />
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{currentUser?.jobTitle}</p>
            <p className="text-xs font-bold text-white uppercase">{currentUser?.name}</p>
          </div>
          <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-slate-800 rounded-2xl text-orange-500 hover:bg-slate-700 transition-all"><Settings size={22} /></button>
          <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-red-950/20 rounded-2xl text-red-500"><LogOut size={22} /></button>
        </div>
      </header>

      <main className="flex-1 pb-24">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history} employees={employees} currentUser={currentUser} 
            onNew={() => setState({ ...state, step: 'organigram' })}
            onQuickStart={(id) => setState({ ...state, step: 'form', selectedEmployeeId: id, currentCriteria: defaultCriteria })}
            onView={(ev) => setState({ step: 'report', selectedEmployeeId: ev.employeeId, currentCriteria: ev.criteria, analysis: ev.analysis })}
            onDelete={fetchData}
          />
        )}

        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!}
            initialCriteria={state.currentCriteria}
            currentUser={currentUser}
            onComplete={handleSaveEvaluation}
            onCancel={() => setState({...state, step: 'dashboard'})}
          />
        )}

        {state.step === 'report' && (
          <div className="p-6 max-w-4xl mx-auto">
            <button onClick={() => setState({...state, step: 'dashboard'})} className="mb-6 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest text-slate-400 hover:text-white transition-all"><ArrowLeft size={16}/> Volver al Panel</button>
            <AnalysisView 
              analysis={state.analysis} 
              criteria={state.currentCriteria} 
              employee={employees.find(e => e.id === state.selectedEmployeeId)!} 
            />
          </div>
        )}

        {/* Mantenemos el Organigrama de consulta */}
        {state.step === 'organigram' && (
          <div className="p-6 max-w-6xl mx-auto">
            <button onClick={() => setState({...state, step: 'dashboard'})} className="mb-8 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest text-slate-400 hover:text-white transition-all"><ArrowLeft size={16}/> Volver</button>
            <Organigram employees={employees} onSelectEmployee={(emp) => {
              if (emp.reportsTo === currentUser?.id) setState({ ...state, step: 'form', selectedEmployeeId: emp.id, currentCriteria: defaultCriteria });
              else alert("No tienes permisos para evaluar fuera de tu jerarquía.");
            }} />
          </div>
        )}
      </main>

      {isAdminOpen && <AdminPanel employees={employees} departments={departments} onClose={() => setIsAdminOpen(false)} onSave={fetchData} />}
      
      {isSaving && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-orange-500" size={48} />
          <p className="text-white font-black uppercase text-xs tracking-[0.2em]">Sincronizando con RR Etiquetas...</p>
        </div>
      )}
    </div>
  );
};

export default App;
