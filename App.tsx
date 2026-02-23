import React, { useState, useEffect } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation, Department } from './types';
import { analyzeEvaluation } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { AdminPanel } from './components/AdminPanel';
import { EvaluationForm } from './components/EvaluationForm';
import { Login } from './components/Login';
import { Logo } from './components/Logo';
import { INITIAL_EMPLOYEES, DEPARTMENTS } from './constants';
import { Loader2, Settings, Users, LayoutDashboard, LogOut, ArrowLeft } from 'lucide-react';

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

  // CRITERIOS QUE EMPIEZAN EN 5 PARA AGILIDAD
  const defaultCriteria: Criterion[] = [
    { id: '1', name: 'Productividad', description: 'Capacidad para cumplir con los volúmenes de producción y tiempos estipulados.', score: 5, category: 'Producción' },
    { id: '2', name: 'Calidad del Trabajo', description: 'Atención al detalle y cumplimiento de estándares técnicos para evitar descartes.', score: 5, category: 'Calidad' },
    { id: '3', name: 'Seguridad e Higiene', description: 'Uso correcto de EPP y mantenimiento del orden según normas ISO 9001.', score: 5, category: 'Normativa' },
    { id: '4', name: 'Trabajo en Equipo', description: 'Colaboración activa con el resto del personal y actitud frente a las tareas.', score: 5, category: 'Actitud' }
  ];

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
      
      {/* HEADER: Aire arriba y abajo, solo logo y botones */}
      <header className="bg-slate-900 border-b border-slate-800 h-24 sm:h-32 flex items-center px-6 sm:px-12 justify-between sticky top-0 z-50">
        <div className="flex items-center">
           <Logo className="w-28 sm:w-44" /> 
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-slate-800 rounded-2xl text-orange-500 shadow-lg hover:bg-slate-700 transition-colors">
            <Settings size={22} />
          </button>
          <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-red-950/20 rounded-2xl text-red-500 hover:bg-red-900/30 transition-colors">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24 lg:pb-8">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history} employees={employees} currentUser={currentUser} 
            onNew={() => setState({ ...state, step: 'organigram' })}
            onView={(ev) => setState({ step: 'report', selectedEmployeeId: ev.employeeId, currentCriteria: ev.criteria, analysis: ev.analysis })}
            onDelete={fetchData}
          />
        )}

        {state.step === 'organigram' && (
          <div className="p-6 max-w-6xl mx-auto">
            <button onClick={() => setState({...state, step: 'dashboard'})} className="mb-8 p-3 bg-slate-900 rounded-2xl text-slate-400 border border-slate-800 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest hover:text-white transition-all">
              <ArrowLeft size={16}/> Volver al Panel
            </button>
            <Organigram 
              employees={employees} 
              onSelectEmployee={(emp) => setState({ ...state, step: 'form', selectedEmployeeId: emp.id, currentCriteria: defaultCriteria })} 
            />
          </div>
        )}

        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!}
            initialCriteria={state.currentCriteria}
            onCancel={() => setState({...state, step: 'dashboard'})}
            onComplete={async (criteria: any, analysis: any) => {
              const newEval = { id: Date.now().toString(), employeeId: state.selectedEmployeeId!, date: new Date().toISOString(), criteria, analysis, evaluatorId: currentUser?.id || '1' };
              await handleSaveData(employees, departments, [newEval, ...history]);
              setState({...state, step: 'dashboard'});
            }}
          />
        )}
      </main>

      {/* NAV INFERIOR MOBILE */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-12 py-5 flex justify-between items-center z-[60] shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={state.step === 'dashboard' ? 'text-orange-500' : 'text-slate-500'}><LayoutDashboard size={30} /></button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={state.step === 'organigram' ? 'text-orange-500' : 'text-slate-500'}><Users size={30} /></button>
      </nav>

      {isAdminOpen && <AdminPanel employees={employees} departments={departments} onClose={() => setIsAdminOpen(false)} onSave={(e, d) => handleSaveData(e, d, history)} />}
    </div>
  );
};

export default App;
