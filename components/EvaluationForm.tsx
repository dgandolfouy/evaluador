import React, { useState, useEffect } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation, Department } from './types';
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
        setHistory(data.evaluations || []);
      }
    } catch (e) {
      setEmployees(INITIAL_EMPLOYEES);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const defaultCriteria = [
    { id: '1', name: 'Productividad', description: 'Capacidad para cumplir con volúmenes y tiempos.', score: 5 },
    { id: '2', name: 'Calidad del Trabajo', description: 'Cumplimiento de estándares ISO 9001.', score: 5 },
    { id: '3', name: 'Seguridad e Higiene', description: 'Uso de EPP y orden del puesto.', score: 5 },
    { id: '4', name: 'Trabajo en Equipo', description: 'Colaboración y actitud grupal.', score: 5 }
  ];

  // VISIBILIDAD TOTAL: Pero solo evalúa subordinados
  const handleSelectEmployee = (emp: Employee) => {
    if (emp.id === currentUser?.id) return alert("No puedes evaluarte a ti mismo.");
    if (emp.reportsTo === currentUser?.id) {
      setState({ ...state, step: 'form', selectedEmployeeId: emp.id, currentCriteria: defaultCriteria });
    } else {
      alert(`Consulta: ${emp.name} no depende de ti directamente.`);
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

      {/* NAVEGACIÓN COMPLETA PARA LOS 4 LÍDERES */}
      <nav className="flex justify-center mt-6 gap-4 px-4">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${state.step === 'dashboard' ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white'}`}><LayoutDashboard size={18}/> Panel</button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${state.step === 'organigram' ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white'}`}><Users size={18}/> Organigrama</button>
        <button onClick={() => setState({ ...state, step: 'stats' })} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${state.step === 'stats' ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white'}`}><BarChart3 size={18}/> Estadísticas</button>
      </nav>

      <main className="flex-1 pb-20">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history} employees={employees} currentUser={currentUser} 
            onQuickStart={(id: string) => setState({ ...state, step: 'form', selectedEmployeeId: id, currentCriteria: defaultCriteria })}
            onView={(ev: any) => setState({ ...state, step: 'report', selectedEmployeeId: ev.employeeId, currentCriteria: ev.criteria, analysis: ev.analysis })}
          />
        )}
        {state.step === 'organigram' && (
          <div className="p-8 max-w-6xl mx-auto">
            <h2 className="text-2xl font-black uppercase mb-8 border-l-4 border-orange-600 pl-4 tracking-tighter">Organigrama RR Etiquetas</h2>
            <Organigram employees={employees} onSelectEmployee={handleSelectEmployee} />
          </div>
        )}
        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!} 
            initialCriteria={state.currentCriteria} 
            currentUser={currentUser}
            onComplete={async (criteria: any, analysis: any) => {
              setIsSaving(true);
              const newEval = { id: Date.now().toString(), employeeId: state.selectedEmployeeId!, date: new Date().toISOString(), criteria, analysis, evaluatorId: currentUser?.id || '' };
              await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employees, evaluations: [newEval, ...history] }) });
              await fetchData();
              setState({...state, step: 'dashboard'});
              setIsSaving(false);
            }}
            onCancel={() => setState({...state, step: 'dashboard'})}
          />
        )}
        {state.step === 'report' && <AnalysisView employee={employees.find(e => e.id === state.selectedEmployeeId)!} criteria={state.currentCriteria} analysis={state.analysis} onReset={() => setState({...state, step: 'dashboard'})} />}
        {state.step === 'stats' && <div className="p-20 text-center opacity-30 font-black uppercase tracking-widest text-2xl text-white">Módulo de Estadísticas ISO 9001</div>}
      </main>

      {isSaving && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-orange-500" size={48} />
          <p className="font-black uppercase text-xs tracking-widest">Guardando Evaluación...</p>
        </div>
      )}
    </div>
  );
};

export default App;
