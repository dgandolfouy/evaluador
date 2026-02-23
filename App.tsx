import React, { useState, useEffect, useMemo } from 'react';
import { EvaluationState, Employee, Criterion, SavedEvaluation, AdminSettings, Department } from './types';
import { generateIsoCriteria, analyzeEvaluation } from './services/geminiService';
import { RangeSlider } from './components/RangeSlider';
import { AnalysisView } from './components/AnalysisView';
import { Dashboard } from './components/Dashboard';
import { Organigram } from './components/Organigram';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './components/Login';
import { Logo } from './components/Logo';
import { INITIAL_EMPLOYEES, DEFAULT_CRITERIA, DEPARTMENTS } from './constants';
import { Loader2, CheckCircle2, ArrowLeft, Settings, Users, LayoutDashboard, BarChart3, LogOut } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
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
        // NORMALIZACIÓN DE DATOS: Esto arregla tu problema de las 2das funciones
        const normalizedEmployees = data.employees.map((e: any) => ({
          id: e.id,
          name: e.name,
          department: e.department,
          jobTitle: e.jobTitle || e.jobtitle,
          reportsTo: e.reportsTo || e.reportsto,
          averageScore: e.averageScore || e.averagescore,
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
      setError('No se pudo sincronizar con la base de datos.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === state.selectedEmployeeId) || null
  , [employees, state.selectedEmployeeId]);

  const handleSelectEmployee = async (employee: Employee) => {
    setIsLoading(true);
    try {
      const criteria = await generateIsoCriteria(employee);
      setState(prev => ({
        ...prev,
        selectedEmployeeId: employee.id,
        currentCriteria: criteria,
        step: 'evaluating'
      }));
    } catch (e) {
      setError("Error IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (id: string, newScore: number) => {
    setState(prev => ({
      ...prev,
      currentCriteria: prev.currentCriteria.map(c => c.id === id ? { ...c, score: newScore } : c)
    }));
  };

  const handleFeedbackChange = (id: string, text: string) => {
    setState(prev => ({
      ...prev,
      currentCriteria: prev.currentCriteria.map(c => c.id === id ? { ...c, feedback: text } : c)
    }));
  };

  const finishEvaluation = async () => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    try {
      const analysis = await analyzeEvaluation(selectedEmployee, state.currentCriteria);
      const completedEvaluation: SavedEvaluation = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        employeeId: selectedEmployee.id,
        evaluatorId: currentUser?.id || '1',
        criteria: state.currentCriteria,
        analysis: analysis
      };
      const newHistory = [completedEvaluation, ...history];
      await saveData({ employees, departments, evaluations: newHistory });
      setState(prev => ({ ...prev, analysis, step: 'report', viewingEvaluatorId: currentUser?.id }));
    } catch (e) {
      setError("Error IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSave = async (updatedEmployees: Employee[], updatedDepartments: Department[]) => {
    await saveData({ 
      employees: updatedEmployees, 
      departments: updatedDepartments, 
      evaluations: history 
    });
  };

  const returnToDashboard = () => {
    setState({ step: 'dashboard', selectedEmployeeId: null, currentCriteria: [], analysis: null });
  };

  if (!isLoggedIn) {
    return <Login employees={employees} onLogin={(user) => { setCurrentUser(user); setIsLoggedIn(true); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50">
      <header className="bg-slate-900 border-b border-slate-800 h-20 flex items-center px-8 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <Logo className="w-32" />
           <div className="border-l border-slate-800 pl-4">
             <h1 className="text-xl font-black uppercase">Evaluación Competencias</h1>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setState(prev => ({ ...prev, step: 'dashboard' }))} className="p-2 text-slate-400 hover:text-white"><LayoutDashboard /></button>
          <button onClick={() => setIsAdminOpen(true)} className="p-2 text-slate-400 hover:text-white"><Settings /></button>
          <button onClick={() => setIsLoggedIn(false)} className="p-2 text-slate-400 hover:text-red-400"><LogOut /></button>
        </div>
      </header>

      <main className="flex-1">
        {error && <div className="bg-red-500/20 text-red-500 p-4 text-center font-bold">{error}</div>}
        {state.step === 'dashboard' && <Dashboard evaluations={history} employees={employees} currentUser={currentUser} onNew={() => setState(prev => ({ ...prev, step: 'organigram' }))} onView={(ev) => {
          const emp = employees.find(e => e.id === ev.employeeId);
          if (emp) setState({ step: 'report', selectedEmployeeId: emp.id, currentCriteria: ev.criteria, analysis: ev.analysis });
        }} onDelete={() => {}} />}
        {state.step === 'organigram' && <div className="py-8"><Organigram employees={employees} onSelectEmployee={handleSelectEmployee} /></div>}
        {state.step === 'evaluating' && selectedEmployee && (
          <div className="max-w-5xl mx-auto py-8">
            <button onClick={returnToDashboard} className="flex items-center gap-2 text-slate-400 mb-4"><ArrowLeft size={16}/> Volver</button>
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
               {state.currentCriteria.map(c => <RangeSlider key={c.id} label={c.name} description={c.description} value={c.score} onChange={v => handleScoreChange(c.id, v)} feedback={c.feedback} onFeedbackChange={t => handleFeedbackChange(c.id, t)} />)}
               <button onClick={finishEvaluation} className="w-full bg-orange-600 py-4 rounded-xl font-bold mt-8">Finalizar con IA</button>
            </div>
          </div>
        )}
        {state.step === 'report' && state.analysis && selectedEmployee && <div className="max-w-4xl mx-auto py-8"><AnalysisView employee={selectedEmployee} criteria={state.currentCriteria} analysis={state.analysis} onReset={returnToDashboard} /></div>}
      </main>

      {isAdminOpen && <AdminPanel employees={employees} departments={departments} onClose={() => setIsAdminOpen(false)} onSave={handleAdminSave} />}
      {(isLoading || isSaving) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-orange-500" size={40} />
            <p className="text-white font-bold">{isSaving ? 'Guardando en RR Etiquetas...' : 'Analizando...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
