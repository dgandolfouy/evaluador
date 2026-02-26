import React, { useState, useEffect } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation } from './types';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { EvaluationForm } from './components/EvaluationForm';
import { EvaluationResult } from './components/EvaluationResult';
import AdminPanel from './components/AdminPanel';
import { StatsView } from './components/StatsView';
import { Login } from './components/Login';
import { Logo } from './components/Logo';
import { Toaster, toast } from 'react-hot-toast';
import { LayoutDashboard, Users, BarChart3, LogOut, Loader2, Settings, AlertCircle } from 'lucide-react';
import { INITIAL_EMPLOYEES } from './constants';

const LEADERS = ["DANIEL GANDOLFO", "CRISTINA GARCIA", "PABLO CANDIA", "GONZALO VIÑAS"];

const App: React.FC = () => {
  const [history, setHistory] = useState<SavedEvaluation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [departments, setDepartments] = useState<string[]>([]);
  const [globalCriteria, setGlobalCriteria] = useState<Criterion[]>([
    { id: '1', name: 'Productividad', description: '', score: 5, feedback: '', category: 'Desempeño' },
    { id: '2', name: 'Calidad ISO', description: '', score: 5, feedback: '', category: 'Calidad' },
    { id: '3', name: 'Seguridad e Higiene', description: '', score: 5, feedback: '', category: 'Calidad' },
    { id: '4', name: 'Trabajo en Equipo', description: '', score: 5, feedback: '', category: 'Competencias Blandas' },
    { id: '5', name: 'Mantenimiento de Puesto', description: '', score: 5, feedback: '', category: 'Actitud' }
  ]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [state, setState] = useState<EvaluationState>({
    step: 'dashboard',
    selectedEmployeeId: null,
    currentCriteria: [],
    analysis: null
  });

  const isSuper = !!(currentUser?.name && LEADERS.includes(currentUser.name.toUpperCase()));

  const [dbError, setDbError] = useState<string | null>(null);

  // FETCH DATA (API)
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'DATABASE_NOT_CONFIGURED') {
          setDbError(errorData.message);
          // Fallback to initial data but don't try to save
          setEmployees(INITIAL_EMPLOYEES);
          return;
        }
        throw new Error('Failed to fetch');
      }
      const data = await response.json();
      setDbError(null);

      if (data.employees && data.employees.length > 0) setEmployees(data.employees);
      else setEmployees(INITIAL_EMPLOYEES);

      if (data.evaluations) setHistory(data.evaluations);
      if (data.departments) setDepartments(data.departments);
      if (data.criteria && data.criteria.length > 0) setGlobalCriteria(data.criteria);
      
    } catch (e) {
      console.error("Error fetching:", e);
      setEmployees(INITIAL_EMPLOYEES);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleComplete = (criteria: any, analysis: any) => {
    if (!state.selectedEmployeeId || isSaving) return;

    const promise = (async () => {
      setIsSaving(true);
      const newEval: SavedEvaluation = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        employeeId: String(state.selectedEmployeeId),
        evaluatorId: String(currentUser?.id || '1'),
        date: new Date().toISOString(),
        criteria: criteria,
        analysis: analysis
      };

      if (dbError) {
        throw new Error("La base de datos no está configurada. Los cambios no se guardarán.");
      }

      const updatedHistory = [newEval, ...history];
      
      // Calculate new average score for the employee
      const employeeEvals = updatedHistory.filter(e => e.employeeId === state.selectedEmployeeId);
      const totalScore = employeeEvals.reduce((acc, curr) => {
        const evalScore = curr.criteria.reduce((sum: number, c: any) => sum + c.score, 0) / curr.criteria.length;
        return acc + evalScore;
      }, 0);
      const newAverage = Number((totalScore / employeeEvals.length).toFixed(1));

      // Update employee in state
      const updatedEmployees = employees.map(emp => 
        emp.id === state.selectedEmployeeId ? { ...emp, averageScore: newAverage } : emp
      );
      setEmployees(updatedEmployees);

      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees: updatedEmployees,
          departments,
          criteria: globalCriteria,
          evaluations: updatedHistory
        })
      });

      if (!response.ok) throw new Error('Error al guardar en la base de datos');

      setHistory(updatedHistory);
      setState({ ...state, step: 'report', currentCriteria: criteria, analysis: analysis });
    })();

    toast.promise(promise, {
      loading: 'Guardando evaluación...',
      success: '¡Evaluación guardada!',
      error: (err) => err.message,
    }).finally(() => setIsSaving(false));
  };

  const handleAdminSave = (newEmployees: Employee[], newDepartments: string[], newCriteria: Criterion[], newEvaluations: SavedEvaluation[]) => {
    if (isSaving) return;

    const promise = (async () => {
      if (dbError) {
        throw new Error("La base de datos no está configurada. No se pueden guardar cambios.");
      }
      setIsSaving(true);
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees: newEmployees,
          departments: newDepartments,
          criteria: newCriteria,
          evaluations: newEvaluations
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar cambios en la base de datos');
      }

      await fetchData();
    })();

    toast.promise(promise, {
      loading: 'Guardando cambios...',
      success: '¡Datos guardados con éxito!',
      error: (err) => err.message || 'Ocurrió un error.',
    }).finally(() => setIsSaving(false));
  };

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Login employees={employees} onLogin={(u) => { setCurrentUser(u); setIsLoggedIn(true); }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-orange-500/30 flex flex-col">
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#1e293b', color: 'white' } }} />
      {dbError && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-[10px] font-black uppercase text-center flex items-center justify-center gap-2">
          <AlertCircle size={14} /> {dbError}
        </div>
      )}
      <header className="bg-slate-900 border-b border-slate-800 h-28 flex items-center px-4 sm:px-12 justify-between sticky top-0 z-50 no-print">
        <Logo className="w-32 sm:w-44" />
        <div className="flex items-center gap-6 text-white">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-orange-500 uppercase">{currentUser?.jobTitle}</p>
            <p className="text-sm font-bold">{currentUser?.name}</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setState({ ...state, step: 'dashboard' })} 
              className={`p-3 rounded-2xl transition-all ${state.step === 'dashboard' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              title="Panel Principal"
            >
              <LayoutDashboard size={22} />
            </button>
            <button 
              onClick={() => setState({ ...state, step: 'organigram' })} 
              className={`p-3 rounded-2xl transition-all ${state.step === 'organigram' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              title="Organigrama"
            >
              <Users size={22} />
            </button>
            <button 
              onClick={() => setState({ ...state, step: 'stats' })} 
              className={`p-3 rounded-2xl transition-all ${state.step === 'stats' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              title="Estadísticas"
            >
              <BarChart3 size={22} />
            </button>
          </div>

          {isSuper && (
             <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
               <Settings size={22} />
             </button>
          )}
          <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-red-950/20 rounded-2xl text-red-500 hover:bg-red-900/40 transition-all"><LogOut size={22} /></button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history} 
            employees={employees} 
            currentUser={currentUser} 
            onQuickStart={(id: string) => setState({ ...state, step: 'form', selectedEmployeeId: id })} 
            onView={(ev: SavedEvaluation) => setState({ ...state, step: 'report', selectedEmployeeId: ev.employeeId, currentCriteria: ev.criteria, analysis: ev.analysis })} 
          />
        )}

        {state.step === 'organigram' && (
          <Organigram 
            employees={employees} 
            evaluations={history}
            currentUser={currentUser}
            onSelectEmployee={(emp) => setState({ ...state, step: 'form', selectedEmployeeId: emp.id })}
          />
        )}

        {state.step === 'stats' && (
          <StatsView 
            evaluations={history}
            employees={employees}
            onClose={() => setState({ ...state, step: 'dashboard' })}
          />
        )}
        
        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!} 
            initialCriteria={globalCriteria} 
            onComplete={handleComplete} 
            onCancel={() => setState({ ...state, step: 'dashboard' })} 
          />
        )}
        
        {state.step === 'report' && (
          <EvaluationResult 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!} 
            criteria={state.currentCriteria} 
            analysis={state.analysis} 
            evaluatorName={currentUser?.name || 'Supervisor'}
            onBack={() => setState({ ...state, step: 'dashboard' })} 
          />
        )}
      </main>

      {isAdminOpen && (
        <AdminPanel 
          employees={employees} 
          departments={departments}
          criteria={globalCriteria}
          evaluations={history}
          isSaving={isSaving}
          onClose={() => setIsAdminOpen(false)} 
          onSave={handleAdminSave}
          onRefresh={fetchData}
        />
      )}

      {isSaving && (
        <div className="fixed inset-0 bg-slate-950/90 z-[100] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
          <p className="font-black uppercase text-xs">Guardando...</p>
        </div>
      )}
    </div>
  );
};

export default App;
