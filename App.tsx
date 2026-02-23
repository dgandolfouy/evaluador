import React, { useState, useEffect, useMemo } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation, Department } from './types';
import { analyzeEvaluation } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { AdminPanel } from './components/AdminPanel';
import { EvaluationForm } from './components/EvaluationForm';
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

  // CARGA DE DATOS DESDE API
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

  useEffect(() => {
    fetchData();
  }, []);

  // CRITERIOS ESTÁNDAR PARA AGILIDAD (PRODUCCIÓN Y CALIDAD)
  const defaultCriteria: Criterion[] = [
    { id: '1', name: 'Productividad', description: 'Rendimiento y cumplimiento de tiempos', score: 10, category: 'Producción' },
    { id: '2', name: 'Calidad del Trabajo', description: 'Precisión y ausencia de descartes', score: 10, category: 'Calidad' },
    { id: '3', name: 'Seguridad e Higiene', description: 'Uso de EPP y orden en el puesto', score: 10, category: 'Normativa' },
    { id: '4', name: 'Trabajo en Equipo', description: 'Colaboración y comunicación', score: 10, category: 'Actitud' }
  ];

  const handleSelectEmployee = (employee: Employee) => {
    setState({
      ...state,
      step: 'form',
      selectedEmployeeId: employee.id,
      currentCriteria: defaultCriteria
    });
  };

  const handleSaveData = async (updatedEmployees: Employee[], updatedDepartments: Department[], updatedHistory: SavedEvaluation[]) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: updatedEmployees, departments: updatedDepartments, evaluations: updatedHistory }),
      });
      if (!response.ok) throw new Error('Error al guardar');
      await fetchData();
    } catch (e) {
      console.error("Error al guardar datos:", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return <Login employees={employees} onLogin={(u) => { setCurrentUser(u); setIsLoggedIn(true); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50 pb-20 lg:pb-0 font-sans">
      
      {/* HEADER CON AIRE PARA EL LOGO */}
      <header className="bg-slate-900 border-b border-slate-800 h-20 sm:h-28 flex items-center px-4 sm:px-8 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 py-4">
           <Logo className="w-24 sm:w-40 transition-all" />
           <div className="hidden md:block border-l border-slate-800 pl-6 h-12 flex flex-col justify-center">
             <h1 className="text-sm sm:text-xl font-black uppercase leading-tight tracking-tight text-white">
               RR Etiquetas
               <span className="block text-[10px] text-slate-500 font-bold tracking-widest mt-1">SISTEMA DE GESTIÓN ISO 9001</span>
             </h1>
           </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => setIsAdminOpen(true)} title="Configuración" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-orange-500 shadow-lg transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={() => { if(confirm('¿Cerrar sesión?')) setIsLoggedIn(false); }} className="p-3 bg-red-950/20 hover:bg-red-950/40 rounded-2xl text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* NAVEGACIÓN INFERIOR (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-10 py-4 flex justify-between items-center z-[60] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={state.step === 'dashboard' ? 'text-orange-500' : 'text-slate-500'}>
          <LayoutDashboard size={28} />
        </button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={state.step === 'organigram' ? 'text-orange-500' : 'text-slate-500'}>
          <Users size={28} />
        </button>
      </nav>

      {/* NAVEGACIÓN SUPERIOR (Desktop) */}
      <nav className="hidden lg:flex max-w-7xl mx-auto mt-6 gap-3 bg-slate-900/50 p-2 rounded-3xl border border-slate-800 shadow-xl">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={`px-8 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all ${state.step === 'dashboard' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
          <LayoutDashboard size={18}/> Panel Principal
        </button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={`px-8 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all ${state.step === 'organigram' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
          <Users size={18}/> Evaluar Colaborador
        </button>
      </nav>

      <main className="flex-1">
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
          <div className="p-4 max-w-6xl mx-auto animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setState({...state, step: 'dashboard'})} className="p-3 bg-slate-900 rounded-2xl text-slate-400 border border-slate-800"><ArrowLeft size={20}/></button>
               <h2 className="text-xl font-black uppercase tracking-tight">Seleccionar para Evaluación</h2>
            </div>
            <Organigram employees={employees} onSelectEmployee={handleSelectEmployee} />
          </div>
        )}

        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!}
            initialCriteria={state.currentCriteria}
            onCancel={() => setState({...state, step: 'dashboard'})}
            onComplete={async (criteria: Criterion[], analysis: any) => {
              const newEval: SavedEvaluation = {
                id: Date.now().toString(),
                employeeId: state.selectedEmployeeId!,
                date: new Date().toISOString(),
                criteria,
                analysis,
                evaluatorId: currentUser?.id || '1'
              };
              await handleSaveData(employees, departments, [newEval, ...history]);
              setState({...state, step: 'dashboard'});
            }}
          />
        )}
      </main>

      {isAdminOpen && (
        <AdminPanel 
          employees={employees} 
          departments={departments} 
          onClose={() => setIsAdminOpen(false)} 
          onSave={(e, d) => handleSaveData(e, d, history)} 
        />
      )}
      
      {isSaving && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-orange-500" size={48} />
          <p className="text-white font-black uppercase text-xs tracking-[0.2em]">Guardando en Base de Datos...</p>
        </div>
      )}
    </div>
  );
};

export default App;
