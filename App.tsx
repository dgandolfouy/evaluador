import React, { useState, useEffect } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation } from './types';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { EvaluationForm } from './components/EvaluationForm';
import { AnalysisView } from './components/AnalysisView';
import { AdminPanel } from './components/AdminPanel';
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Server error");
      }
      const data = await response.json();

      let loadedEmployees = data.employees || [];
      // Bootstrap logic: If DB is empty, provide a way for Admin to enter
      if (loadedEmployees.length === 0) {
        console.warn("Database empty. Adding bootstrap admins.");
        loadedEmployees = [
          {
            id: 'admin_bootstrap_1',
            name: 'DANIEL GANDOLFO',
            department: 'DIRECCIÓN',
            jobtitle: 'GERENTE GENERAL',
            reportsto: ''
          },
          {
            id: 'admin_bootstrap_2',
            name: 'GONZALO VIÑAS',
            department: 'GERENCIA',
            jobtitle: 'DIRECTOR GERENTE GENERAL',
            reportsto: ''
          }
        ];
      }

      setEmployees(loadedEmployees);

      try {
        if (data.departments) setDepartments(data.departments.map((d: any) => typeof d === 'string' ? d : d.name));
        if (data.evaluations) setHistory(data.evaluations);

        if (data.settings) {
          const critSetting = data.settings.find((s: any) => s.key === 'evaluation_criteria');
          if (critSetting) {
            const parsed = typeof critSetting.value === 'string' ? JSON.parse(critSetting.value) : critSetting.value;
            if (Array.isArray(parsed)) setGlobalCriteria(parsed);
          }
        }
      } catch (innerError) {
        console.error("Error parsing fetched data details:", innerError);
      }
    } catch (e) {
      console.error("Neon Connection Failed:", e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleComplete = async (criteria: any, analysis: any) => {
    if (!state.selectedEmployeeId) return;
    setIsSaving(true);

    const total = criteria.reduce((acc: number, c: any) => acc + c.score, 0) / criteria.length;

    // Objeto con mapeo estricto a minúsculas para Neon
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
        setState({ step: 'dashboard', selectedEmployeeId: null, currentCriteria: [], analysis: null });
      } else {
        const err = await res.json();
        alert("Fallo al guardar evaluación: " + (err.details || err.error || "Desconocido"));
        throw new Error(err.error || "Fallo en servidor");
      }
    } catch (e: any) {
      alert("Error al guardar en Neon: " + e.message);
    } finally { setIsSaving(false); }
  };

  if (!isLoggedIn) return <Login employees={employees} onLogin={(u) => { setCurrentUser(u); setIsLoggedIn(true); }} />;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white font-sans">
      <header className="bg-slate-900 border-b border-slate-800 h-28 flex items-center px-12 justify-between sticky top-0 z-50">
        <Logo className="w-44" />
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-orange-500 uppercase">{currentUser?.jobtitle || currentUser?.jobTitle}</p>
            <p className="text-sm font-bold">{currentUser?.name}</p>
          </div>
          {isSuper && <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-slate-800 rounded-2xl text-orange-500 hover:bg-slate-700 transition-all"><Settings size={22} /></button>}
          <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-red-950/20 rounded-2xl text-red-500 hover:bg-red-900/40 transition-all"><LogOut size={22} /></button>
        </div>
      </header>

      {isSuper && (
        <nav className="flex justify-center mt-6 gap-4 px-4 sticky top-32 z-40">
          <button onClick={() => setState({ ...state, step: 'dashboard' })} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${state.step === 'dashboard' ? 'bg-orange-600 shadow-lg shadow-orange-900/50' : 'bg-slate-800 hover:bg-slate-700'}`}><LayoutDashboard size={18} /> Panel</button>
          <button onClick={() => setState({ ...state, step: 'organigram' })} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${state.step === 'organigram' ? 'bg-orange-600 shadow-lg shadow-orange-900/50' : 'bg-slate-800 hover:bg-slate-700'}`}><Users size={18} /> Organigrama</button>
        </nav>
      )}

      <main className="flex-1">
        {state.step === 'dashboard' && <Dashboard evaluations={history} employees={employees} currentUser={currentUser} onQuickStart={(id: string) => setState({ ...state, step: 'form', selectedEmployeeId: id })} onView={(ev: any) => {
          const crit = typeof ev.criteria === 'string' ? JSON.parse(ev.criteria) : ev.criteria;
          const an = typeof ev.analysis === 'string' ? JSON.parse(ev.analysis) : ev.analysis;
          setState({ ...state, step: 'report', selectedEmployeeId: ev.employeeid, currentCriteria: crit, analysis: an });
        }} />}
        {state.step === 'organigram' && <div className="p-8 max-w-6xl mx-auto"><Organigram employees={employees} currentUser={currentUser} evaluations={history} onSelectEmployee={(emp: any) => setState({ ...state, step: 'form', selectedEmployeeId: emp.id })} /></div>}
        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm
            employee={employees.find(e => e.id === state.selectedEmployeeId)!}
            initialCriteria={globalCriteria}
            onComplete={handleComplete}
            onCancel={() => setState({ ...state, step: 'dashboard' })}
          />
        )}
        {state.step === 'report' && <AnalysisView employee={employees.find(e => e.id === state.selectedEmployeeId)!} criteria={state.currentCriteria} analysis={state.analysis} onReset={() => setState({ ...state, step: 'dashboard' })} />}
      </main>

      {isAdminOpen && (
        <AdminPanel
          employees={employees}
          departments={departments}
          criteria={globalCriteria}
          evaluations={history}
          onClose={() => setIsAdminOpen(false)}
          onSave={async (emp, dept, crit, evals) => {
            try {
              setIsSaving(true);
              const settings = crit ? [{ key: 'evaluation_criteria', value: crit }] : [];
              const res = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employees: emp, departments: dept, evaluations: evals, settings }),
              });
              if (!res.ok) {
                const err = await res.json();
                throw new Error(err.details || err.error || "Fallo en el servidor");
              }
              await fetchData();
            } catch (e: any) {
              alert("Error al actualizar configuración: " + e.message);
              throw e;
            } finally {
              setIsSaving(false);
            }
          }}
        />
      )}
      {isSaving && <div className="fixed inset-0 bg-slate-950/90 z-[100] flex flex-col items-center justify-center"><Loader2 className="animate-spin text-orange-500 mb-4" size={48} /><p className="font-black uppercase text-xs">Guardando...</p></div>}
    </div>
  );
};

export default App;
