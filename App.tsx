import React, { useState, useEffect } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation } from './types';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { EvaluationForm } from './components/EvaluationForm';
import { EvaluationResult } from './components/EvaluationResult'; // Importación correcta
import { AdminPanel } from './components/AdminPanel';
import { StatsView } from './components/StatsView';
import { Login } from './components/Login';
import { Logo } from './components/Logo';
import { LayoutDashboard, Users, BarChart3, LogOut, Loader2, Settings } from 'lucide-react';

const LEADERS = ["DANIEL GANDOLFO", "CRISTINA GARCIA", "PABLO CANDIA", "GONZALO VIÑAS"];

const App: React.FC = () => {
  const [history, setHistory] = useState<SavedEvaluation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [globalCriteria, setGlobalCriteria] = useState<Criterion[]>([
    { id: '1', name: 'Productividad', score: 5, feedback: '', category: 'Desempeño' },
    { id: '2', name: 'Calidad ISO', score: 5, feedback: '', category: 'Calidad' },
    { id: '3', name: 'Seguridad e Higiene', score: 5, feedback: '', category: 'Calidad' },
    { id: '4', name: 'Trabajo en Equipo', score: 5, feedback: '', category: 'Competencias Blandas' },
    { id: '5', name: 'Mantenimiento de Puesto', score: 5, feedback: '', category: 'Actitud' }
  ]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [state, setState] = useState<EvaluationState>({ step: 'dashboard', selectedEmployeeId: null, currentCriteria: [], analysis: null });

  const isSuper = !!(currentUser?.name && LEADERS.includes(currentUser.name.toUpperCase()));

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/data?t=${Date.now()}`);
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      setEmployees(data.employees || []);
      setHistory(data.evaluations || []);
    } catch (e) { console.error("Error fetching:", e); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleComplete = async (criteria: any, analysis: any) => {
    if (!state.selectedEmployeeId) return;
    setIsSaving(true);
    const total = criteria.reduce((acc: number, c: any) => acc + c.score, 0) / criteria.length;
    const newEval = {
      id: Date.now().toString(),
      employeeid: String(state.selectedEmployeeId),
      evaluatorid: String(currentUser?.id || '1'),
      date: new Date().toISOString(),
      criteria: criteria,
      finalscore: Number(total.toFixed(2)),
      analysis: analysis
    };

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees, evaluations: [newEval, ...history] }),
      });
      if (res.ok) {
        await fetchData();
        setState({ ...state, step: 'report', currentCriteria: criteria, analysis: analysis });
      }
    } catch (e) { alert("Error al guardar"); }
    finally { setIsSaving(false); }
  };

  if (!isLoggedIn) return <Login employees={employees} onLogin={(u) => { setCurrentUser(u); setIsLoggedIn(true); }} />;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white font-sans">
      <header className="bg-slate-900 border-b border-slate-800 h-28 flex items-center px-12 justify-between sticky top-0 z-50 no-print">
        <Logo className="w-44" />
        <div className="flex items-center gap-6 text-white">
          <div className="text-right">
            <p className="text-[10px] font-black text-orange-500 uppercase">{currentUser?.jobtitle || currentUser?.jobTitle}</p>
            <p className="text-sm font-bold">{currentUser?.name}</p>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-red-950/20 rounded-2xl text-red-500 hover:bg-red-900/40 transition-all"><LogOut size={22} /></button>
        </div>
      </header>

      <main className="flex-1">
        {state.step === 'dashboard' && <Dashboard evaluations={history} employees={employees} currentUser={currentUser} onQuickStart={(id) => setState({ ...state, step: 'form', selectedEmployeeId: id })} onView={(ev) => setState({ ...state, step: 'report', selectedEmployeeId: ev.employeeid, currentCriteria: ev.criteria, analysis: ev.analysis })} />}
        {state.step === 'form' && state.selectedEmployeeId && <EvaluationForm employee={employees.find(e => e.id === state.selectedEmployeeId)!} initialCriteria={globalCriteria} onComplete={handleComplete} onCancel={() => setState({ ...state, step: 'dashboard' })} />}
        
        {/* CORRECCIÓN AQUÍ: Usamos EvaluationResult, no AnalysisView */}
        {state.step === 'report' && <EvaluationResult employee={employees.find(e => e.id === state.selectedEmployeeId)!} criteria={state.currentCriteria} analysis={state.analysis} onBack={() => setState({ ...state, step: 'dashboard' })} />}
      </main>

      {isSaving && <div className="fixed inset-0 bg-slate-950/90 z-[100] flex flex-col items-center justify-center"><Loader2 className="animate-spin text-orange-500 mb-4" size={48} /><p className="font-black uppercase text-xs">Guardando...</p></div>}
    </div>
  );
};

export default App;
