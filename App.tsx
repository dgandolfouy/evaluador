import React, { useState, useEffect } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation } from './types';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { EvaluationForm } from './components/EvaluationForm';
import { AnalysisView } from './components/AnalysisView';
import { Login } from './components/Login';
import { Logo } from './components/Logo';
import { LayoutDashboard, Users, BarChart3, LogOut, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [history, setHistory] = useState<SavedEvaluation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [state, setState] = useState<EvaluationState>({ step: 'dashboard', selectedEmployeeId: null, currentCriteria: [], analysis: null });

  const superUsers = ["DANIEL GANDOLFO", "CRISTINA GARCIA", "PABLO CANDIA", "GONZALO VIÑAS"];
  const isSuper = currentUser && superUsers.includes(currentUser.name.toUpperCase());

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      if (data.employees) setEmployees(data.employees);
      if (data.evaluations) setHistory(data.evaluations);
    } catch (e) { console.error("Error Neon"); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleComplete = async (criteria: any, analysis: any) => {
    setIsSaving(true);
    const total = criteria.reduce((acc: number, c: any) => acc + c.score, 0) / criteria.length;
    
    // Mapeo exacto a tus columnas de Neon
    const newEval = { 
      id: Date.now().toString(), 
      employeeid: state.selectedEmployeeId, 
      evaluatorid: currentUser?.id || '1', 
      date: new Date().toISOString(), 
      criteria: JSON.stringify(criteria), 
      finalscore: total, 
      analysis: JSON.stringify(analysis) 
    };

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees, evaluations: [newEval, ...history] }),
      });
      await fetchData();
      setState({ ...state, step: 'dashboard' });
    } finally { setIsSaving(false); }
  };

  if (!isLoggedIn) return <Login employees={employees} onLogin={(u) => { setCurrentUser(u); setIsLoggedIn(true); }} />;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white font-sans">
      <header className="bg-slate-900 border-b border-slate-800 h-28 flex items-center px-12 justify-between sticky top-0 z-50">
        <Logo className="w-44" />
        <div className="flex items-center gap-6">
          <div className="text-right"><p className="text-[10px] font-black text-orange-500 uppercase">{currentUser?.jobTitle}</p><p className="text-sm font-bold">{currentUser?.name}</p></div>
          <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-red-950/20 rounded-2xl text-red-500"><LogOut size={22} /></button>
        </div>
      </header>

      <nav className="flex justify-center mt-6 gap-4 px-4">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${state.step === 'dashboard' ? 'bg-orange-600' : 'bg-slate-900'}`}><LayoutDashboard size={18}/> Panel</button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${state.step === 'organigram' ? 'bg-orange-600' : 'bg-slate-900'}`}><Users size={18}/> Organigrama</button>
        <button onClick={() => setState({ ...state, step: 'stats' })} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${state.step === 'stats' ? 'bg-orange-600' : 'bg-slate-900'}`}><BarChart3 size={18}/> Estadísticas</button>
      </nav>

      <main className="flex-1">
        {state.step === 'dashboard' && <Dashboard evaluations={history} employees={employees} currentUser={currentUser} onQuickStart={(id:string) => setState({ ...state, step: 'form', selectedEmployeeId: id })} onView={(ev:any) => setState({ ...state, step: 'report', selectedEmployeeId: ev.employeeid, currentCriteria: JSON.parse(ev.criteria), analysis: JSON.parse(ev.analysis) })} />}
        {state.step === 'organigram' && <div className="p-8 max-w-6xl mx-auto"><Organigram employees={employees} onSelectEmployee={(emp:any) => setState({ ...state, step: 'form', selectedEmployeeId: emp.id })} /></div>}
        {state.step === 'form' && state.selectedEmployeeId && <EvaluationForm employee={employees.find(e => e.id === state.selectedEmployeeId)!} onComplete={handleComplete} onCancel={() => setState({...state, step: 'dashboard'})} />}
        {state.step === 'report' && <AnalysisView employee={employees.find(e => e.id === state.selectedEmployeeId)!} criteria={state.currentCriteria} analysis={state.analysis} onReset={() => setState({...state, step: 'dashboard'})} />}
      </main>

      {isSaving && <div className="fixed inset-0 bg-slate-950/90 z-[100] flex flex-col items-center justify-center"><Loader2 className="animate-spin text-orange-500 mb-4" size={48} /><p className="font-black uppercase text-xs">Guardando en Neon...</p></div>}
    </div>
  );
};

export default App;
