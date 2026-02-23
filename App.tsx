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

  const [globalCriteria, setGlobalCriteria] = useState<Criterion[]>([
    { id: '1', name: 'Productividad', description: 'Capacidad para cumplir con volúmenes y tiempos.', score: 5, category: 'Producción' },
    { id: '2', name: 'Calidad del Trabajo', description: 'Precisión técnica y estándares ISO 9001.', score: 5, category: 'Calidad' },
    { id: '3', name: 'Seguridad e Higiene', description: 'Uso de EPP y orden del puesto.', score: 5, category: 'Normativa' },
    { id: '4', name: 'Trabajo en Equipo', description: 'Actitud y colaboración grupal.', score: 5, category: 'Actitud' }
  ]);

  const startDirectEvaluation = (employeeId: string) => {
    setState({ ...state, step: 'form', selectedEmployeeId: employeeId, currentCriteria: globalCriteria });
  };

  const handleCompleteEvaluation = async (criteria: Criterion[]) => {
    setIsSaving(true);
    const empId = state.selectedEmployeeId!;
    
    // 1
