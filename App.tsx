import React, { useState, useEffect } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation, Department } from './types';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { EvaluationForm } from './components/EvaluationForm';
import { AnalysisView } from './components/AnalysisView';
import { Login } from './components/Login';
import { Logo } from './components/Logo';
import { AdminPanel } from './components/AdminPanel';
import { INITIAL_EMPLOYEES, DEPARTMENTS } from './constants';
import { LayoutDashboard, Users, BarChart3, LogOut, Loader2, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [history, setHistory] = useState<SavedEvaluation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [state, setState] = useState<EvaluationState>({
    step: 'dashboard', selectedEmployeeId: null, currentCriteria: [], analysis: null,
  });

  const superUsers = ["DANIEL GANDOLFO", "CRISTINA GARCIA", "PABLO CANDIA", "GONZALO VIÑAS"];
  const isSuperUser = currentUser && superUsers.includes(currentUser.name.toUpperCase());

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Error en la conexión con la base de datos');
      const data = await response.json();
      
      // PRIORIDAD: Si hay datos en la DB, los usamos. Si no, cargamos los iniciales.
      if (data.employees && data.employees.length > 0) {
        setEmployees(data.employees);
        setHistory(data.evaluations || []);
      } else {
        setEmployees(INITIAL_EMPLOYEES);
      }
    } catch (e) {
      console.error("Error al cargar datos:", e);
      setEmployees(INITIAL_EMPLOYEES);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveData = async (updatedEmployees: Employee[], updatedHistory: SavedEvaluation[]) => {
    // PROTECCIÓN CRÍTICA: No permite guardar si la lista de empleados viene vacía por error
    if (!updatedEmployees || updatedEmployees.length === 0) {
      console.error("Abortando guardado: No se pueden enviar datos vacíos.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: updatedEmployees, evaluations: updatedHistory }),
      });
      if (!response.ok) throw new Error('Error al sincronizar con Neon');
      await fetchData();
    } catch (e) {
      alert("Error de sincronización con RR Etiquetas. Los cambios no se guardaron en la nube.");
    } finally {
      setIsSaving(false);
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
            <p className="text-sm font-bold uppercase">{currentUser?.name}</p>
          </div>
          {isSuperUser && (
            <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-slate-800 rounded-2xl text-orange-500 hover:bg-slate-700 transition-all">
              <Settings size={22} />
            </button>
          )}
          <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-red-950/20 rounded-2xl text-red-500 hover:bg-red-950/40 transition-all">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {isSuperUser && (
        <nav className="flex justify-center mt-6 gap-4 px-4">
          <button onClick={() => setState({ ...state, step: 'dashboard' })} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${state.step === 'dashboard' ? 'bg-orange-600 shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white'}`}><LayoutDashboard size={18}/> Panel</button>
          <button onClick={() => setState({ ...state, step: 'organigram' })} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 ${state.step === 'organigram' ? 'bg-orange-600 shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white'}`}><Users size={18}/> Organigrama</button>
        </nav>
      )}

      <main className="flex-1">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history} employees={employees} currentUser={currentUser} 
            onQuickStart={(id) => setState({ ...state, step: 'form', selectedEmployeeId: id })}
            onView={(ev) => setState({ ...state, step: 'report', selectedEmployeeId: ev.employeeId, currentCriteria: ev.criteria, analysis: ev.analysis })}
          />
        )}
        {state.step === 'organigram' && (
          <div className="p-8 max-w-6xl mx-auto">
            <h2 className="text-2xl font-black uppercase mb-8 border-l-4 border-orange-600 pl-4 tracking-tighter">Estructura Organizacional</h2>
            <Organigram employees={employees} onSelectEmployee={(emp) => {
               if (emp.id === currentUser?.id) return alert("No puedes evaluarte a ti mismo.");
               setState({ ...state, step: 'form', selectedEmployeeId: emp.id });
            }} />
          </div>
        )}
        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!} 
            onComplete={async (criteria, analysis) => {
               const newEval = { id: Date.now().toString(), employeeId: state.selectedEmployeeId!, date: new Date().toISOString(), criteria, analysis, evaluatorId: currentUser?.id || '' };
               await handleSaveData(employees, [newEval, ...history]);
               setState({...state, step: 'dashboard'});
            }}
            onCancel={() => setState({...state, step: 'dashboard'})}
          />
        )}
      </main>

      {isAdminOpen && <AdminPanel employees={employees} departments={DEPARTMENTS} onClose={() => setIsAdminOpen(false)} onSave={(e) => handleSaveData(e, history)} />}
    </div>
  );
};

export default App;
