import React, { useState, useMemo } from 'react';
import { SavedEvaluation, Employee } from '../types';
import { Search, Calendar, FileText, ChevronRight, Filter, Award, TrendingUp, Users, CheckCircle2, Trash2 } from 'lucide-react';

interface DashboardProps {
  evaluations: SavedEvaluation[];
  employees: Employee[];
  currentUser: Employee | null;
  onNew: () => void;
  onView: (evalData: SavedEvaluation) => void;
  onDelete: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ evaluations, employees, currentUser, onNew, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(ev => {
      const emp = employees.find(e => e.id === ev.employeeId);
      if (!emp) return false;
      
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = departmentFilter ? emp.department === departmentFilter : true;

      return matchesSearch && matchesDept;
    });
  }, [evaluations, employees, searchTerm, departmentFilter]);

  const stats = useMemo(() => {
    const total = evaluations.length;
    const avgScore = evaluations.reduce((acc, ev) => {
      const avg = ev.criteria.reduce((sum, c) => sum + c.score, 0) / ev.criteria.length;
      return acc + avg;
    }, 0) / (total || 1);

    const highCompliance = evaluations.filter(ev => 
      ev.analysis.isoComplianceLevel.includes('Excelente') || 
      ev.analysis.isoComplianceLevel.includes('Alto')
    ).length;

    return { total, avgScore, highCompliance };
  }, [evaluations]);

  const uniqueDepartments = Array.from(new Set(employees.map(e => e.department)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Está seguro de eliminar esta evaluación? Esta acción no se puede deshacer.')) {
      onDelete(id);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Welcome & User Roles */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Panel de Control</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Bienvenido al sistema de gestión de competencias ISO 9001.</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 min-w-[240px]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sus Cargos y Departamentos</p>
          <div className="flex flex-col gap-1.5 mt-1">
            {currentUser && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                  <p className="text-xs font-bold text-white">{currentUser.jobTitle} <span className="text-slate-500 font-medium">• {currentUser.department}</span></p>
                </div>
                {currentUser.additionalRoles?.map((role, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                    <p className="text-xs font-bold text-slate-300">{role.jobTitle} <span className="text-slate-500 font-medium">• {role.department}</span></p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Evaluaciones</p>
            <h3 className="text-2xl font-black text-white">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Promedio General</p>
            <h3 className="text-2xl font-black text-white">{stats.avgScore.toFixed(1)} / 10</h3>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cumplimiento Alto</p>
            <h3 className="text-2xl font-black text-white">{stats.highCompliance} <span className="text-sm font-medium text-slate-500">empleados</span></h3>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Filters & List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Historial Reciente
              <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {filteredEvaluations.length}
              </span>
            </h2>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-600 outline-none text-sm transition-all text-white placeholder:text-slate-600"
                />
              </div>
              <select 
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-600 outline-none text-sm appearance-none text-white"
              >
                <option value="">Todos los Deptos</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredEvaluations.length === 0 ? (
              <div className="text-center py-16 bg-slate-900 rounded-3xl border border-dashed border-slate-800">
                <FileText size={40} className="mx-auto text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">No hay evaluaciones que coincidan</p>
              </div>
            ) : (
              filteredEvaluations.map((ev) => {
                const emp = employees.find(e => e.id === ev.employeeId);
                if (!emp) return null;
                return (
                  <div 
                    key={ev.id}
                    onClick={() => onView(ev)}
                    className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md hover:border-slate-700 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-base sm:text-lg border border-slate-700">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white group-hover:text-orange-400 transition-colors truncate text-sm sm:text-base">{emp.name}</h3>
                        <div className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-tight truncate">
                          <div>{emp.jobTitle} • {emp.department}</div>
                          {emp.additionalRoles?.map((r, i) => (
                            <div key={i} className="opacity-60 italic">{r.jobTitle} • {r.department}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] sm:text-xs font-bold uppercase">
                        <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                        {formatDate(ev.date)}
                      </div>
                      <div className={`px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                        ev.analysis.isoComplianceLevel.includes('Excelente') || ev.analysis.isoComplianceLevel.includes('Alto')
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {ev.analysis.isoComplianceLevel}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => handleDelete(e, ev.id)}
                          className="p-1.5 sm:p-2 text-slate-600 hover:text-red-400 transition-all hover:bg-red-500/10 rounded-lg"
                          title="Eliminar evaluación"
                        >
                          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors hidden sm:block" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Quick Actions & Tips */}
        <div className="space-y-6">
          <div className="bg-orange-600 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Nueva Evaluación</h3>
              <p className="text-orange-200 text-sm mb-6">Inicie una nueva auditoría de competencia para cumplir con la norma ISO 9001.</p>
              <button 
                onClick={onNew}
                className="w-full bg-white text-orange-900 font-bold py-3 rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
              >
                Ir al Organigrama <ChevronRight size={18} />
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <Award size={160} />
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Tips ISO 9001
            </h3>
            <ul className="space-y-4">
              <li className="text-sm text-slate-400 leading-relaxed">
                <span className="font-bold text-white block mb-1">Cláusula 7.2: Competencia</span>
                Asegúrese de que los colaboradores sean competentes basándose en su educación, formación o experiencia.
              </li>
              <li className="text-sm text-slate-400 leading-relaxed">
                <span className="font-bold text-white block mb-1">Toma de Conciencia</span>
                El personal debe conocer la política de calidad y cómo su trabajo contribuye a la eficacia del sistema.
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
