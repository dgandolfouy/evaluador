import React, { useState, useEffect } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation, Department } from './types';
import { analyzeEvaluation } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { AdminPanel } from './components/AdminPanel';
import { EvaluationForm } from './components/EvaluationForm';
import { AnalysisView } from './components/AnalysisView';
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
        setEmployees(data.employees.map((e: any) => ({
          ...e, jobTitle: e.jobTitle || e.jobtitle, reportsTo: e.reportsTo || e.reportsto,
          additionalRoles: e.additionalRoles || e.additionalroles || []
        })));
        setDepartments(data.departments.map((d: any) => typeof d === 'string' ? d : d.name));
        setHistory(data.evaluations || []);
      }
    } catch (e) {
      setEmployees(INITIAL_EMPLOYEES);
      setDepartments(DEPARTMENTS);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const [globalCriteria, setGlobalCriteria] = useState<Criterion[]>([
    { id: '1', name: 'Productividad', description: 'Capacidad para cumplir con volúmenes y tiempos.', score: 5, category: 'Producción' },
    { id: '2', name: 'Calidad del Trabajo', description: 'Precisión técnica y estándares ISO 9001.', score: 5, category: 'Calidad' },
    { id: '3', name: 'Seguridad e Higiene', description: 'Uso de EPP y orden del puesto.', score: 5, category: 'Normativa' },
    { id: '4', name: 'Trabajo en Equipo', description: 'Actitud y colaboración grupal.', score: 5, category: 'Actitud' }
  ]);

  const handleQuickEvaluation = (employeeId: string) => {
    setState({ ...state, step: 'form', selectedEmployeeId: employeeId, currentCriteria: globalCriteria });
  };

  const handleCompleteEvaluation = async (criteria: Criterion[]) => {
    setIsSaving(true);
    const empId = state.selectedEmployeeId!;
    const newEval: SavedEvaluation = {
      id: Date.now().toString(),
      employeeId: empId,
      date: new Date().toISOString(),
      criteria: criteria,
      evaluatorId: currentUser?.id || '',
      analysis: null 
    };
    const updatedHistory = [newEval, ...history];
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees, departments, evaluations: updatedHistory }),
      });
      setHistory(updatedHistory);
      setState({ ...state, step: 'dashboard' });
      setIsSaving(false);
      const employee = employees.find(e => e.id === empId)!;
      analyzeEvaluation(employee, criteria).then(async (analysis) => {
        const finalHistory = updatedHistory.map(ev => ev.id === newEval.id ? { ...ev, analysis } : ev);
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employees, departments, evaluations: finalHistory }),
        });
        setHistory(finalHistory);
      });
    } catch (e) {
      alert("Error al sincronizar.");
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
          <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-slate-800 rounded-2xl text-orange-500"><Settings size={22} /></button>
          <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-red-950/20 rounded-2xl text-red-500"><LogOut size={22} /></button>
        </div>
      </header>

      <main className="flex-1 pb-24 lg:pb-8">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history} employees={employees} currentUser={currentUser} 
            onNew={() => setState({ ...state, step: 'organigram' })}
            onQuickStart={handleQuickEvaluation}
            onView={(ev: any) => setState({ step: 'report', selectedEmployeeId: ev.employeeId, currentCriteria: ev.criteria, analysis: ev.analysis })}
            onDelete={fetchData}
          />
        )}
        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!}
            initialCriteria={state.currentCriteria}
            currentUser={currentUser}
            onUpdateGlobalCriteria={setGlobalCriteria}
            onComplete={handleCompleteEvaluation}
            onCancel={() => setState({...state, step: 'dashboard'})}
          />
        )}
        {state.step === 'report' && (
          <div className="p-6 max-w-4xl mx-auto">
            <button onClick={() => setState({...state, step: 'dashboard'})} className="mb-8 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest text-slate-400 hover:text-white transition-all"><ArrowLeft size={16}/> Volver</button>
            {state.analysis ? (
              <AnalysisView employee={employees.find(e => e.id === state.selectedEmployeeId)!} criteria={state.currentCriteria} analysis={state.analysis} onReset={() => setState({...state, step: 'dashboard'})} />
            ) : (
              <div className="bg-slate-900 p-20 rounded-[3rem] border border-slate-800 text-center">
                <Loader2 className="animate-spin text-orange-500 mx-auto mb-4" size={40} />
                <p className="text-white font-black uppercase text-xs tracking-widest">IA Generando informe cualitativo...</p>
              </div>
            )}
          </div>
        )}
        {state.step === 'organigram' && (
          <div className="p-6 max-w-6xl mx-auto">
            <button onClick={() => setState({...state, step: 'dashboard'})} className="mb-8 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest text-slate-400 hover:text-white transition-all"><ArrowLeft size={16}/> Volver</button>
            <h2 className="text-xl font-black uppercase mb-8 border-l-4 border-orange-600 pl-4">Organigrama RR</h2>
            <Organigram employees={employees} onSelectEmployee={(emp) => {
                if (emp.id === currentUser?.id) return alert("No puedes evaluarte.");
                if (emp.reportsTo === currentUser?.id) handleQuickEvaluation(emp.id);
                else alert("Sin permisos.");
            }} />
          </div>
        )}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-12 py-5 flex justify-between items-center z-[60]">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={state.step === 'dashboard' ? 'text-orange-500' : 'text-slate-500'}><LayoutDashboard size={30} /></button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={state.step === 'organigram' ? 'text-orange-500' : 'text-slate-500'}><Users size={30} /></button>
      </nav>

      {isAdminOpen && <AdminPanel employees={employees} departments={departments} onClose={() => setIsAdminOpen(false)} onSave={fetchData} />}
    </div>
  );
};

export default App;
