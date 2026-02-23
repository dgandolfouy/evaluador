import React, { useState, useEffect, useMemo } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation, Department } from './types';
import { analyzeEvaluation } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { AdminPanel } from './components/AdminPanel';
import { EvaluationForm } from './components/EvaluationForm'; // Nuevo componente
import { Login } from './components/Login';
import { Logo } from './components/Logo';
import { INITIAL_EMPLOYEES, DEPARTMENTS } from './constants';
import { Loader2, Settings, Users, LayoutDashboard, BarChart3, LogOut, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [history, setHistory] = useState<SavedEvaluation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  
  const [state, setState] = useState<EvaluationState>({
    step: 'dashboard',
    selectedEmployeeId: null,
    currentCriteria: [],
    analysis: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();

      if (!data.employees || data.employees.length === 0) {
        setEmployees(INITIAL_EMPLOYEES);
        setDepartments(DEPARTMENTS);
      } else {
        const normalizedEmployees = data.employees.map((e: any) => ({
          ...e,
          jobTitle: e.jobTitle || e.jobtitle,
          reportsTo: e.reportsTo || e.reportsto,
          additionalRoles: e.additionalRoles || e.additionalroles || []
        }));
        setEmployees(normalizedEmployees);
        setDepartments(data.departments.map((d: any) => typeof d === 'string' ? d : d.name));
        setHistory(data.evaluations || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setEmployees(INITIAL_EMPLOYEES);
      setDepartments(DEPARTMENTS);
    } finally {
      setIsDataLoaded(true);
    }
  };

  const saveData = async (dataToSave: { employees: Employee[], departments: Department[], evaluations: SavedEvaluation[] }) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });
      if (!response.ok) throw new Error('Error al guardar');
      await fetchData(); 
    } catch (error) {
      console.error('Error de sincronización.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdminSave = async (updatedEmployees: Employee[], updatedDepartments: Department[]) => {
    await saveData({ employees: updatedEmployees, departments: updatedDepartments, evaluations: history });
  };

  if (!isLoggedIn) {
    return <Login employees={employees} onLogin={(user) => { setCurrentUser(user); setIsLoggedIn(true); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50 pb-20 lg:pb-0">
      
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 h-16 sm:h-20 flex items-center px-4 sm:px-8 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <Logo className="w-20 sm:w-32" />
           <div className="hidden sm:block border-l border-slate-800 pl-4">
             <h1 className="text-sm sm:text-xl font-black uppercase leading-tight">RR Etiquetas<br/><span className="text-[10px] text-slate-500">ISO 9001:2015</span></h1>
           </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-3">
          <button onClick={() => setIsAdminOpen(true)} className="p-2 sm:p-3 bg-slate-800 rounded-xl text-orange-500 shadow-lg"><Settings size={18} /></button>
          <button onClick={() => setIsLoggedIn(false)} className="p-2 sm:p-3 bg-red-950/20 rounded-xl text-red-500"><LogOut size={18} /></button>
        </div>
      </header>

      {/* NAVEGACIÓN INFERIOR (Solo Celular) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-3 flex justify-between items-center z-[60] shadow-[0_-10px_20px_rgba(0,0,0,0.4)]">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={`flex flex-col items-center gap-1 ${state.step === 'dashboard' ? 'text-orange-500' : 'text-slate-500'}`}>
          <LayoutDashboard size={20} /><span className="text-[8px] font-black uppercase">Panel</span>
        </button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={`flex flex-col items-center gap-1 ${state.step === 'organigram' ? 'text-orange-500' : 'text-slate-500'}`}>
          <Users size={20} /><span className="text-[8px] font-black uppercase">Evaluar</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-700 opacity-30">
          <BarChart3 size={20} /><span className="text-[8px] font-black uppercase">Stats</span>
        </button>
      </nav>

      {/* NAVEGACIÓN SUPERIOR (Desktop) */}
      <nav className="hidden lg:flex max-w-7xl mx-auto mt-4 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={`px-6 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all ${state.step === 'dashboard' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}><LayoutDashboard size={16}/> Panel</button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={`px-6 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all ${state.step === 'organigram' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}><Users size={16}/> Organigrama</button>
      </nav>

      <main className="flex-1 pb-10">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history} 
            employees={employees} 
            currentUser={currentUser} 
            onNew={() => setState({ ...state, step: 'organigram' })} 
            onView={(ev) => setState({ ...state, step: 'report', selectedEmployeeId: ev.employeeId, currentCriteria: ev.criteria, analysis: ev.analysis })} 
            onDelete={fetchData} 
          />
        )}
        
        {state.step === 'organigram' && (
          <div className="py-4 sm:py-8 max-w-5xl mx-auto px-4">
             <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setState({...state, step: 'dashboard'})} className="p-2 bg-slate-800 rounded-lg text-slate-400"><ArrowLeft size={20}/></button>
                <h2 className="text-xl font-black uppercase">Elegí a quién evaluar</h2>
             </div>
             <Organigram 
                employees={employees} 
                onSelectEmployee={(emp) => setState({ ...state, step: 'form', selectedEmployeeId: emp.id })} 
             />
          </div>
        )}

        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm 
             employee={employees.find(e => e.id === state.selectedEmployeeId)!}
             onComplete={async (criteria, analysis) => {
                const newEval: SavedEvaluation = {
                  id: Date.now().toString(),
                  date: new Date().toISOString(),
                  employeeId: state.selectedEmployeeId!,
                  evaluatorId: currentUser?.id || '1',
                  criteria,
                  analysis
                };
                const updatedHistory = [newEval, ...history];
                await saveData({ employees, departments, evaluations: updatedHistory });
                setState({ ...state, step: 'dashboard' });
             }}
             onCancel={() => setState({ ...state, step: 'dashboard' })}
          />
        )}
      </main>

      {isAdminOpen && <AdminPanel employees={employees} departments={departments} onClose={() => setIsAdminOpen(false)} onSave={handleAdminSave} />}
    </div>
  );
};

export default App;
