import React, { useState } from 'react';
import { Employee } from '../types';
import { ChevronRight, ChevronDown, User, Plus, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrgNodeProps {
  employee: Employee;
  allEmployees: Employee[];
  onSelect: (employee: Employee) => void;
  level: number;
  supervisorId?: string;
}

const OrgNode: React.FC<OrgNodeProps> = ({ employee, allEmployees, onSelect, level, supervisorId }) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const subordinates = allEmployees.filter(e => 
    e.reportsTo === employee.id || 
    e.additionalRoles?.some(r => r.reportsTo === employee.id)
  );
  const hasSubordinates = subordinates.length > 0;

  // Filter roles relevant to this supervisor
  const isPrimarySupervised = employee.reportsTo === supervisorId;
  const relevantAdditionalRoles = employee.additionalRoles?.filter(r => r.reportsTo === supervisorId) || [];

  return (
    <div className="flex flex-col">
      <div 
        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all cursor-pointer group ${
          level === 0 ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'hover:bg-slate-800 border border-transparent hover:border-slate-700'
        }`}
        style={{ marginLeft: `${level * (window.innerWidth < 640 ? 12 : 24)}px` }}
        onClick={() => {
          if (hasSubordinates) setIsOpen(!isOpen);
        }}
      >
        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors ${level === 0 ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-orange-500 group-hover:text-white'}`}>
          <User size={window.innerWidth < 640 ? 16 : 20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm sm:text-base break-words ${level === 0 ? 'text-white' : 'text-slate-200'}`}>{employee.name}</h3>
          <div className={`text-[10px] sm:text-xs break-words ${level === 0 ? 'text-orange-200' : 'text-slate-500'}`}>
            {/* If root or primary supervised, show primary role */}
            {(level === 0 || isPrimarySupervised || (relevantAdditionalRoles.length === 0 && !supervisorId)) && (
              <div>{employee.jobTitle} • {employee.department}</div>
            )}
            {/* Show additional roles supervised by this person */}
            {relevantAdditionalRoles.map((role, idx) => (
              <div key={idx} className="opacity-80 italic">{role.jobTitle} • {role.department}</div>
            ))}
            {/* If no specific roles found but supervised here (shouldn't happen with logic above but for safety) */}
            {level > 0 && supervisorId && !isPrimarySupervised && relevantAdditionalRoles.length === 0 && (
              <div className="text-red-400">Rol no especificado para este supervisor</div>
            )}
          </div>
        </div>

        {employee.averageScore && (
          <div className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] sm:text-xs font-bold border border-amber-500/20">
            <Star size={10} fill="currentColor" />
            {employee.averageScore.toFixed(1)}
          </div>
        )}

        <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
          {level > 0 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(employee);
              }}
              className="p-1.5 sm:p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors shadow-sm"
              title="Evaluar"
            >
              <Plus size={14} />
            </button>
          )}
          
          {hasSubordinates && (
            <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
              <ChevronDown size={16} className={level === 0 ? 'text-orange-200' : 'text-slate-600'} />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && hasSubordinates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1">
              {subordinates.map(sub => (
                <OrgNode 
                  key={sub.id} 
                  employee={sub} 
                  allEmployees={allEmployees} 
                  onSelect={onSelect} 
                  level={level + 1} 
                  supervisorId={employee.id}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface OrganigramProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
}

export const Organigram: React.FC<OrganigramProps> = ({ employees, onSelectEmployee }) => {
  // An employee is a root if their primary role has no supervisor 
  // OR if they have any additional role with no supervisor.
  const rootEmployees = employees.filter(e => 
    !e.reportsTo || 
    (e.additionalRoles && e.additionalRoles.some(r => !r.reportsTo))
  );

  return (
    <div className="space-y-4 max-w-3xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Estructura Organizacional</h2>
        <p className="text-slate-400 text-sm italic">Haga clic en un superior para ver sus colaboradores directos.</p>
      </div>
      
      <div className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800">
        {rootEmployees.map(root => (
          <OrgNode 
            key={root.id} 
            employee={root} 
            allEmployees={employees} 
            onSelect={onSelectEmployee} 
            level={0} 
          />
        ))}
      </div>
    </div>
  );
};
