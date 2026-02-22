import React, { useState, useMemo } from 'react';
import { Employee } from '../types';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';

interface LoginProps {
  employees: Employee[];
  systemPassword: string;
  onLogin: (employee: Employee) => void;
}

export const Login: React.FC<LoginProps> = ({ employees, systemPassword, onLogin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [password, setPassword] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return [];
    return employees.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [employees, searchTerm]);

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setSearchTerm(emp.name);
    setShowDropdown(false);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setError('Por favor seleccione su nombre de la lista.');
      return;
    }
    if (password !== systemPassword) {
      setError('Contraseña incorrecta.');
      return;
    }
    onLogin(selectedEmployee);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="w-48 h-24 sm:w-64 sm:h-32 flex items-center justify-center">
              <Logo className="w-full h-full" />
            </div>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-black text-white mb-2">Sistema de Evaluación</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Colaborador</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Buscar su nombre..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    if (selectedEmployee && e.target.value !== selectedEmployee.name) {
                      setSelectedEmployee(null);
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-white placeholder:text-slate-600 transition-all font-medium text-sm sm:text-base"
                />
              </div>
              
              {showDropdown && searchTerm && !selectedEmployee && filteredEmployees.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  {filteredEmployees.map(emp => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => handleSelectEmployee(emp)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{emp.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{emp.jobTitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-white placeholder:text-slate-600 transition-all font-medium text-sm sm:text-base"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-[10px] sm:text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs py-3.5 sm:py-4 rounded-xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
            >
              Ingresar <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
