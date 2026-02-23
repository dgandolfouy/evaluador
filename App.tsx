import React, { useState, useEffect } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation, Department } from './types';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { AdminPanel } from './components/AdminPanel';
import { EvaluationForm } from './components/EvaluationForm';
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
          ...e,
          jobTitle: e.jobTitle || e.jobtitle,
          reportsTo: e.reportsTo || e.reportsto,
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

  // REGLA DE JERARQUÍA (Lo único nuevo que dejamos)
  const getSubordinates = (managerId: string) => {
    return employees.filter(emp => emp.reportsTo === managerId);
  };

  const defaultCriteria: Criterion[] = [
    { id: '1', name: 'Productividad', description: 'Capacidad para cumplir con volúmenes y tiempos.', score: 5, category: 'Producción' },
    { id: '2', name: 'Calidad del Trabajo', description: 'Precisión técnica y estándares ISO 9001.', score: 5, category: 'Calidad' },
    { id: '3', name: 'Seguridad e Higiene', description: 'Uso de EPP y orden del puesto.', score: 5, category: 'Normativa' },
    { id: '4', name: 'Trabajo en Equipo', description: 'Actitud y colaboración grupal.', score: 5, category: 'Actitud' }
  ];

  const handleSelectEmployee = (employee: Employee) => {
    if (employee.id === currentUser?.id) {
      alert("No puedes realizar tu propia evaluación.");
      return;
    }
    setState({ ...state, step: 'form', selectedEmployeeId: employee.id, currentCriteria: defaultCriteria });
  };

  const handleSaveData = async (updatedEmployees: Employee[], updatedDepartments: Department[], updatedHistory: SavedEvaluation[]) => {
    setIsSaving(true);
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: updatedEmployees, departments: updatedDepartments, evaluations: updatedHistory }),
      });
      await fetchData();
    } finally { setIsSaving(false); }
  };

  if (!isLoggedIn) return <Login employees={employees} onLogin={(u) => { setCurrentUser(u); setIsLoggedIn(true); }} />;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50 font-sans">
      
      {/* HEADER RESTAURADO CON AIRE */}
      <header className="bg-slate-900 border-b border-slate-800 h-28 flex items-center px-6 sm:px-12 justify-between sticky top-0 z-50">
        <Logo className="w-44" />
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{currentUser?.jobTitle}</p>
            <p className="text-xs font-bold text-white uppercase">{currentUser?.name}</p>
          </div>
          <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-slate-800 rounded-2xl text-orange-500 hover:bg-slate-700 transition-all">
            <Settings size={22} />
          </button>
          <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-red-950/20 rounded-2xl text-red-500 hover:bg-red-900/30 transition-all">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* NAVEGACIÓN SUPERIOR RESTAURADA */}
      <nav className="hidden lg:flex max-w-7xl mx-auto mt-6 gap-3 bg-slate-900/50 p-2 rounded-3xl border border-slate-800">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={`px-8 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all ${state.step === 'dashboard' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}>
          <LayoutDashboard size={18}/> Panel
        </button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={`px-8 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all ${state.step === 'organigram' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}>
          <Users size={18}/> Organigrama
        </button>
        <button onClick={() => setState({ ...state, step: 'stats' })} className={`px-8 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all ${state.step === 'stats' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}>
          <BarChart3 size={18}/> Estadísticas
        </button>
      </nav>

      <main className="flex-1 pb-24 lg:pb-8">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history} employees={employees} currentUser={currentUser} 
            onNew={() => setState({ ...state, step: 'organigram' })}
            onView={(ev) => setState({ ...state, step: 'report', selectedEmployeeId: ev.employeeId, currentCriteria: ev.criteria, analysis: ev.analysis })}
            onDelete={fetchData}
          />
        )}

        {state.step === 'organigram' && (
          <div className="p-6 max-w-6xl mx-auto">
            <button onClick={() => setState({...state, step: 'dashboard'})} className="mb-8 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest text-slate-400 hover:text-white transition-all">
              <ArrowLeft size={16}/> Volver
            </button>
            <h2 className="text-xl font-black uppercase mb-8 border-l-4 border-orange-600 pl-4">Personal a mi Cargo</h2>
            <Organigram 
              employees={getSubordinates(currentUser?.id || '')} 
              onSelectEmployee={handleSelectEmployee} 
            />
          </div>
        )}

        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!}
            initialCriteria={state.currentCriteria}
            onCancel={() => setState({...state, step: 'dashboard'})}
            onComplete={async (criteria: any, analysis: any) => {
              const newEval = { id: Date.now().toString(), employeeId: state.selectedEmployeeId!, date: new Date().toISOString(), criteria, analysis, evaluatorId: currentUser?.id || '' };
              await handleSaveData(employees, departments, [newEval, ...history]);
              setState({...state, step: 'dashboard'});
            }}
          />
        )}

        {state.step === 'stats' && (
          <div className="p-20 text-center opacity-30 font-black uppercase tracking-widest">Módulo de Estadísticas en Desarrollo</div>
        )}
      </main>

      {/* NAV INFERIOR MOBILE RESTAURADA */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-10 py-5 flex justify-between items-center z-[60] shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={state.step === 'dashboard' ? 'text-orange-500' : 'text-slate-500'}><LayoutDashboard size={30} /></button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={state.step === 'organigram' ? 'text-orange-500' : 'text-slate-500'}><Users size={30} /></button>
        <button onClick={() => setState({ ...state, step: 'stats' })} className={state.step === 'stats' ? 'text-orange-500' : 'text-slate-500'}><BarChart3 size={30} /></button>
      </nav>

      {isAdminOpen && <AdminPanel employees={employees} departments={departments} onClose={() => setIsAdminOpen(false)} onSave={(e, d) => handleSaveData(e, d, history)} />}
      
      {isSaving && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-orange-500" size={48} />
          <p className="text-white font-black uppercase text-xs tracking-[0.2em]">Guardando...</p>
        </div>
      )}
    </div>
  );
};

export default App;
