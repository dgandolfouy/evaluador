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

  const defaultCriteria: Criterion[] = [
    { id: '1', name: 'Productividad', description: 'Capacidad para cumplir con volúmenes y tiempos.', score: 5, category: 'Producción' },
    { id: '2', name: 'Calidad del Trabajo', description: 'Precisión técnica y estándares ISO 9001.', score: 5, category: 'Calidad' },
    { id: '3', name: 'Seguridad e Higiene', description: 'Uso de EPP y orden del puesto.', score: 5, category: 'Normativa' },
    { id: '4', name: 'Trabajo en Equipo', description: 'Actitud y colaboración grupal.', score: 5, category: 'Actitud' }
  ];

  const handleSelectEmployee = (employee: Employee) => {
    if (employee.id === currentUser?.id) return alert("No puedes realizar tu propia evaluación.");
    if (employee.reportsTo !== currentUser?.id) return alert("Solo puedes evaluar a tu personal directo.");

    setState({ ...state, step: 'form', selectedEmployeeId: employee.id, currentCriteria: defaultCriteria });
  };

  // ESTA ES LA FUNCIÓN QUE GUARDA Y GENERA EL INFORME PARA GASTÓN
  const handleSaveEvaluation = async (criteria: Criterion[], analysis: any) => {
    setIsSaving(true);
    const newEval: SavedEvaluation = {
      id: Date.now().toString(),
      employeeId: state.selectedEmployeeId!,
      date: new Date().toISOString(), // Fecha y hora para la ficha
      criteria,
      analysis,
      evaluatorId: currentUser?.id || ''
    };

    const updatedHistory = [newEval, ...history];
    
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees, departments, evaluations: updatedHistory }),
      });
      setHistory(updatedHistory);
      // Tras guardar, mostramos el reporte que me pasaste
      setState({ ...state, step: 'report', analysis, currentCriteria: criteria });
    } catch (e) {
      alert("Error al guardar en la base de datos.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateGlobalCriteria = (newCriteria: Criterion[]) => {
      // Daniel y Cristina pueden modificar esto, se pasa al EvaluationForm
      console.log("Criterios actualizados por Gerencia de Calidad");
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
          <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-slate-800 rounded-2xl text-orange-500 hover:bg-slate-700 transition-all"><Settings size={22} /></button>
          <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-red-950/20 rounded-2xl text-red-500"><LogOut size={22} /></button>
        </div>
      </header>

      <main className="flex-1 pb-24">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history} employees={employees} currentUser={currentUser} 
            onNew={() => setState({ ...state, step: 'organigram' })}
            onQuickStart={(id: string) => setState({ ...state, step: 'form', selectedEmployeeId: id, currentCriteria: defaultCriteria })}
            onView={(ev: any) => setState({ ...state, step: 'report', selectedEmployeeId: ev.employeeId, currentCriteria: ev.criteria, analysis: ev.analysis })}
            onDelete={fetchData}
          />
        )}

        {state.step === 'form' && state.selectedEmployeeId && (
          <EvaluationForm 
            employee={employees.find(e => e.id === state.selectedEmployeeId)!}
            initialCriteria={state.currentCriteria}
            currentUser={currentUser}
            onUpdateGlobalCriteria={handleUpdateGlobalCriteria}
            onComplete={handleSaveEvaluation}
            onCancel={() => setState({...state, step: 'dashboard'})}
          />
        )}

        {state.step === 'report' && (
          <div className="p-6">
            <button onClick={() => setState({...state, step: 'dashboard'})} className="max-w-4xl mx-auto mb-6 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest text-slate-400 hover:text-white transition-all"><ArrowLeft size={16}/> Volver al Panel</button>
            <AnalysisView 
              employee={employees.find(e => e.id === state.selectedEmployeeId)!}
              criteria={state.currentCriteria}
              analysis={state.analysis}
              onReset={() => setState({...state, step: 'dashboard'})}
              evaluatorId={currentUser?.id}
            />
          </div>
        )}

        {state.step === 'organigram' && (
          <div className="p-6 max-w-6xl mx-auto">
            <button onClick={() => setState({...state, step: 'dashboard'})} className="mb-8 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest text-slate-400 hover:text-white transition-all"><ArrowLeft size={16}/> Volver</button>
            <Organigram employees={employees} onSelectEmployee={handleSelectEmployee} />
          </div>
        )}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-10 py-5 flex justify-between items-center z-[60] shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        <button onClick={() => setState({ ...state, step: 'dashboard' })} className={state.step === 'dashboard' ? 'text-orange-500' : 'text-slate-500'}><LayoutDashboard size={30} /></button>
        <button onClick={() => setState({ ...state, step: 'organigram' })} className={state.step === 'organigram' ? 'text-orange-500' : 'text-slate-500'}><Users size={30} /></button>
      </nav>

      {isAdminOpen && <AdminPanel employees={employees} departments={departments} onClose={() => setIsAdminOpen(false)} onSave={fetchData} />}
      
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
