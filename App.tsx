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

  // Load data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();

        if (!data.employees || data.employees.rows.length === 0) {
          console.log("Initializing with default data.");
          setEmployees(INITIAL_EMPLOYEES);
          setDepartments(DEPARTMENTS);
          setHistory([]);
        } else {
          setEmployees(data.employees.rows.map((e: any) => ({...e, additionalRoles: e.additionalroles ? JSON.parse(e.additionalroles) : [] })) || []);
          setDepartments(data.departments.rows.map((d: any) => d.name) || []);
          setHistory(data.evaluations.rows.map((e: any) => ({...e, criteria: e.responses ? JSON.parse(e.responses) : [], analysis: e.analysis ? JSON.parse(e.analysis) : null })) || []);
        }
      } catch (error) {
        console.error('Error fetching data, using initial constants:', error);
        setEmployees(INITIAL_EMPLOYEES);
        setDepartments(DEPARTMENTS);
        setHistory([]);
      } finally {
        setIsDataLoaded(true);
      }
    };
    fetchData();
  }, []);

  // Save data to API when changes are made, but only after initial load
  useEffect(() => {
    if (!isDataLoaded) return;

    const handler = setTimeout(() => {
      const saveData = async () => {
        try {
          await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employees, departments, evaluations: history }),
          });
        } catch (error) {
          console.error('Error saving data:', error);
        }
      };
      saveData();
    }, 1000); // Debounce saves by 1 second

    return () => {
      clearTimeout(handler);
    };
  }, [employees, departments, history, isDataLoaded]);

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === state.selectedEmployeeId) || null
  , [employees, state.selectedEmployeeId]);

  const handleSelectEmployee = async (employee: Employee) => {
    setIsLoading(true);
    setError(null);
    try {
      const criteria = await generateIsoCriteria(employee);
      setState(prev => ({
        ...prev,
        selectedEmployeeId: employee.id,
        currentCriteria: criteria,
        step: 'evaluating'
      }));
    } catch (e) {
      setError("Error al conectar con el servidor de IA.");
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
      setHistory(newHistory);

      // Update employee average score
      const empHistory = newHistory.filter(h => h.employeeId === selectedEmployee.id);
      const totalScore = empHistory.reduce((acc, h) => {
        const avg = h.criteria.reduce((sum, c) => sum + c.score, 0) / h.criteria.length;
        return acc + avg;
      }, 0);
      
      setEmployees(prev => prev.map(e => 
        e.id === selectedEmployee.id 
          ? { ...e, averageScore: totalScore / empHistory.length } 
          : e
      ));

      setState(prev => ({ ...prev, analysis, step: 'report', viewingEvaluatorId: currentUser?.id }));
    } catch (e) {
      setError("Error generando el reporte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvaluation = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);

    // Recalculate averages
    setEmployees(prev => prev.map(emp => {
      const empHistory = newHistory.filter((h: SavedEvaluation) => h.employeeId === emp.id);
      if (empHistory.length === 0) return { ...emp, averageScore: undefined };
      
      const totalScore = empHistory.reduce((acc: number, h: SavedEvaluation) => {
        const avg = h.criteria.reduce((sum, c) => sum + c.score, 0) / h.criteria.length;
        return acc + avg;
      }, 0);
      
      return { ...emp, averageScore: totalScore / empHistory.length };
    }));
  };

  const returnToDashboard = () => {
    setState({
      step: 'dashboard',
      selectedEmployeeId: null,
      currentCriteria: [],
      analysis: null,
    });
  };

  const renderHeader = () => (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="w-16 h-8 sm:w-32 sm:h-16 flex items-center justify-center">
             <Logo className="w-full h-full" />
          </div>
          <div className="min-w-0 border-l border-slate-800 pl-2 sm:pl-6">
            <h1 className="text-[10px] sm:text-xl font-black text-white leading-none uppercase tracking-tight">
              Evaluación de<br />Competencias
            </h1>
            <p className="text-[6px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">ISO 9001:2015</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setState(prev => ({ ...prev, step: 'dashboard' }))}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${state.step === 'dashboard' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutDashboard size={16} /> Panel
          </button>
          <button 
            onClick={() => setState(prev => ({ ...prev, step: 'organigram' }))}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${state.step === 'organigram' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <Users size={16} /> Organigrama
          </button>
          <button 
            onClick={() => setState(prev => ({ ...prev, step: 'stats' }))}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${state.step === 'stats' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <BarChart3 size={16} /> Estadísticas
          </button>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Nav Icons */}
          <div className="flex lg:hidden items-center gap-1 mr-2 border-r border-slate-800 pr-2">
            <button 
              onClick={() => setState(prev => ({ ...prev, step: 'dashboard' }))}
              className={`p-2 rounded-lg transition-all ${state.step === 'dashboard' ? 'bg-slate-800 text-orange-500' : 'text-slate-500'}`}
            >
              <LayoutDashboard size={18} />
            </button>
            <button 
              onClick={() => setState(prev => ({ ...prev, step: 'organigram' }))}
              className={`p-2 rounded-lg transition-all ${state.step === 'organigram' ? 'bg-slate-800 text-orange-500' : 'text-slate-500'}`}
            >
              <Users size={18} />
            </button>
          </div>

          <button 
            onClick={() => setIsAdminOpen(true)}
            className="p-2 sm:p-3 hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-white"
          >
            <Settings size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="p-2 sm:p-3 hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-red-400"
            title="Cerrar Sesión"
          >
            <LogOut size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>
        </div>
      </div>
    </header>
  );

  if (!isLoggedIn) {
    return (
      <Login 
        employees={employees} 
        onLogin={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50">
      {renderHeader()}

      <main className="flex-1">
        {state.step === 'dashboard' && (
          <Dashboard 
            evaluations={history}
            employees={employees}
            currentUser={currentUser}
            onNew={() => setState(prev => ({ ...prev, step: 'organigram' }))}
            onView={(ev) => {
              const emp = employees.find(e => e.id === ev.employeeId);
              if (emp) {
                setState({
                  step: 'report',
                  selectedEmployeeId: emp.id,
                  currentCriteria: ev.criteria,
                  analysis: ev.analysis
                });
              }
            }}
            onDelete={handleDeleteEvaluation}
          />
        )}

        {state.step === 'organigram' && (
          <div className="py-8 animate-fade-in">
            <Organigram 
              employees={employees} 
              onSelectEmployee={handleSelectEmployee} 
            />
          </div>
        )}

        {state.step === 'evaluating' && selectedEmployee && (
          <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <button onClick={returnToDashboard} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-medium mb-3 transition-colors">
                    <ArrowLeft size={16} /> Cancelar
                </button>
                <h2 className="text-3xl font-bold text-white">{selectedEmployee.name}</h2>
                <div className="text-slate-400 text-lg">
                  {(selectedEmployee.reportsTo === currentUser?.id || !currentUser) && (
                    <div>{selectedEmployee.jobTitle} • {selectedEmployee.department}</div>
                  )}
                  {selectedEmployee.additionalRoles?.filter(r => r.reportsTo === currentUser?.id || !currentUser).map((r, i) => (
                    <div key={i} className="text-sm opacity-60 italic">{r.jobTitle} • {r.department}</div>
                  ))}
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-500 uppercase">ISO 9001:2015</p>
                <p className="text-xs text-slate-600">Ref: 7.2-COMP</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-800">
              <div className="hidden md:grid grid-cols-12 gap-6 p-4 bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-4">Criterio</div>
                  <div className="col-span-4 text-center">Desempeño</div>
                  <div className="col-span-4">Observaciones</div>
              </div>

              {state.currentCriteria.map((criterion) => (
                <RangeSlider 
                  key={criterion.id}
                  label={criterion.name}
                  description={criterion.description}
                  value={criterion.score}
                  onChange={(val) => handleScoreChange(criterion.id, val)}
                  feedback={criterion.feedback}
                  onFeedbackChange={(text) => handleFeedbackChange(criterion.id, text)}
                />
              ))}

              <div className="p-8 bg-slate-950 border-t border-slate-800 flex justify-end">
                <button 
                  onClick={finishEvaluation}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                  Finalizar Evaluación con IA
                </button>
              </div>
            </div>
          </div>
        )}

        {state.step === 'report' && state.analysis && selectedEmployee && (
          <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
            <div className="mb-6">
              <button onClick={returnToDashboard} className="text-slate-500 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
                <ArrowLeft size={16} /> Volver al Panel
              </button>
            </div>
            <AnalysisView 
              employee={selectedEmployee}
              criteria={state.currentCriteria}
              analysis={state.analysis}
              onReset={returnToDashboard}
              evaluatorId={state.viewingEvaluatorId}
            />
          </div>
        )}

        {state.step === 'stats' && (
          <div className="p-8 text-center text-slate-500">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-white">Estadísticas de Desempeño</h2>
            <p>Próximamente: Visualización avanzada de cumplimiento ISO 9001.</p>
          </div>
        )}
      </main>

      {isAdminOpen && (
        <AdminPanel 
          employees={employees} 
          setEmployees={setEmployees} 
          departments={departments}
          setDepartments={setDepartments}
          onClose={() => setIsAdminOpen(false)} 
        />
      )}

      {isLoading && state.step !== 'evaluating' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-slate-800">
            <Loader2 className="animate-spin text-orange-500" size={40} />
            <p className="font-bold text-white">Procesando con IA...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
