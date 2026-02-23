import React, { useState, useEffect } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation, Department } from './types';
import { analyzeEvaluation } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { EvaluationForm } from './components/EvaluationForm';
import { AnalysisView } from './components/AnalysisView';
import { Login } from './components/Login';
import { Logo } from './components/Logo';
import { INITIAL_EMPLOYEES, DEPARTMENTS } from './constants';
import { LayoutDashboard, Users, BarChart3, LogOut, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [history, setHistory] = useState<SavedEvaluation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [state, setState] = useState<EvaluationState>({
    step: 'dashboard', selectedEmployeeId: null, currentCriteria: [], analysis: null,
  });

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Error al obtener datos');
      const data = await response.json();
      
      // Si la DB está vacía, cargamos los iniciales pero NO los guardamos aún
      setEmployees(data.employees?.length > 0 ? data.employees : INITIAL_EMPLOYEES);
      setHistory(data.evaluations || []);
    } catch (e) {
      setEmployees(INITIAL_EMPLOYEES);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveData = async (updatedEmployees: Employee[], updatedHistory: SavedEvaluation[]) => {
    // PROTECCIÓN: Si por algún error los empleados vienen vacíos, abortamos
    if (updatedEmployees.length === 0) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: updatedEmployees, evaluations: updatedHistory }),
      });
      if (!response.ok) throw new Error('Error en el servidor');
      await fetchData();
    } catch (e) {
      alert("Error crítico de sincronización. No se perdieron datos locales.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) return <Login employees={employees} onLogin={(u) => { setCurrentUser(u); setIsLoggedIn(true); }} />;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white font-sans">
      <header className="bg-slate-900 border-b border-slate-800 h-28 flex items-center px-12 justify-between sticky top-0 z-50">
        <Logo className="w-44" />
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{currentUser?.jobTitle}</p>
            <p className="text-sm font-bold">{currentUser?.name}</p>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-red-950/20 rounded-2xl text-red-500 hover:bg-red-950/40 transition-all"><LogOut size={22} /></button>
        </div>
      </header>

      <nav className="flex justify-center mt-6 gap-4 px-4">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${state.step === 'dashboard' ? 'bg-orange-600' : 'bg-slate-900'}`}><LayoutDashboard size={18}/> Panel</button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${state.step === 'organigram' ? 'bg-orange-600' : 'bg-slate-900'}`}><Users size={18}/> Organigrama</button>
      </nav>

      <main className="flex-1">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history} employees={employees} currentUser={currentUser} 
            onQuickStart={(id) => setState({ ...state, step: 'form', selectedEmployeeId: id })}
            onView={(ev) => setState({ ...state, step: 'report', selectedEmployeeId: ev.employeeId, currentCriteria: ev.criteria, analysis: ev.analysis })}
          />
        )}
        {state.step === 'form' && (
          <EvaluationForm 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!} 
            onComplete={async (criteria, analysis) => {
               const newEval = { id: Date.now().toString(), employeeId: state.selectedEmployeeId!, date: new Date().toISOString(), criteria, analysis, evaluatorId: currentUser?.id || '' };
               await handleSaveData(employees, [newEval, ...history]);
               setState({...state, step: 'dashboard'});
            }}
            onCancel={() => setState({...state, step: 'dashboard'})}
          />
        )}
        {state.step === 'report' && <AnalysisView employee={employees.find(e => e.id === state.selectedEmployeeId)!} criteria={state.currentCriteria} analysis={state.analysis} onReset={() => setState({...state, step: 'dashboard'})} />}
      </main>

      {isSaving && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-orange-500" size={48} />
          <p className="font-black uppercase text-xs tracking-widest">Sincronizando con RR Etiquetas...</p>
        </div>
      )}
    </div>
  );
};

export default App;
