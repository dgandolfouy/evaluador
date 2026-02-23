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
import { Loader2, Settings, Users, LayoutDashboard, BarChart3, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [history, setHistory] = useState<SavedEvaluation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
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
    } catch (error) {
      setEmployees(INITIAL_EMPLOYEES);
      setDepartments(DEPARTMENTS);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // CRITERIOS FIJOS PARA QUE SEA ÁGIL (Producción y Calidad)
  const defaultCriteria: Criterion[] = [
    { id: '1', name: 'Productividad', description: 'Rendimiento y cumplimiento de tiempos', score: 5, category: 'Producción' },
    { id: '2', name: 'Calidad del Trabajo', description: 'Precisión y ausencia de descartes', score: 5, category: 'Calidad' },
    { id: '3', name: 'Seguridad e Higiene', description: 'Uso de EPP y orden en el puesto', score: 5, category: 'Normativa' },
    { id: '4', name: 'Trabajo en Equipo', description: 'Colaboración y comunicación', score: 5, category: 'Actitud' }
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
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: updatedEmployees, departments: updatedDepartments, evaluations: updatedHistory }),
      });
      await fetchData();
    } catch (e) {
      alert("Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) return <Login employees={employees} onLogin={(u) => { setCurrentUser(u); setIsLoggedIn(true); }} />;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50 pb-20 lg:pb-0">
      <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center px-4 justify-between sticky top-0 z-50">
        <Logo className="w-20 sm:w-28" />
        <div className="flex items-center gap-2">
          <button onClick={() => setIsAdminOpen(true)} className="p-2 bg-slate-800 rounded-xl text-orange-500 shadow-lg"><Settings size={18} /></button>
          <button onClick={() => setIsLoggedIn(false)} className="p-2 bg-red-950/20 rounded-xl text-red-500"><LogOut size={18} /></button>
        </div>
      </header>

      {/* NAVEGACIÓN INFERIOR CELULAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-8 py-4 flex justify-between items-center z-[60] shadow-[0_-10px_20px_rgba(0,0,0,0.4)]">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={state.step === 'dashboard' ? 'text-orange-500' : 'text-slate-500'}><LayoutDashboard size={24} /></button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={state.step === 'organigram' ? 'text-orange-500' : 'text-slate-500'}><Users size={24} /></button>
      </nav>

      <main className="flex-1">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history} 
            employees={employees} 
            currentUser={currentUser} 
            onNew={() => setState({ ...state, step: 'organigram' })}
            onView={(ev) => setState({ step: 'report', selectedEmployeeId: ev.employeeId, currentCriteria: ev.criteria, analysis: ev.analysis })}
            onDelete={fetchData}
          />
        )}

        {state.step === 'organigram' && (
          <div className="p-4 max-w-5xl mx-auto">
            <h2 className="text-center font-black uppercase text-xs mb-8 text-slate-500 tracking-widest">Elegí un Colaborador para Evaluar</h2>
            <Organigram employees={employees} onSelectEmployee={handleSelectEmployee} />
          </div>
        )}

        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!}
            initialCriteria={state.currentCriteria}
            onCancel={() => setState({...state, step: 'dashboard'})}
            onComplete={async (criteria, analysis) => {
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

      {isAdminOpen && <AdminPanel employees={employees} departments={departments} onClose={() => setIsAdminOpen(false)} onSave={(e, d) => handleSaveData(e, d, history)} />}
      
      {isSaving && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-orange-500" size={48} />
          <p className="text-white font-black uppercase text-xs tracking-[0.2em]">Guardando en RR Etiquetas...</p>
        </div>
      )}
    </div>
  );
};

export default App;
