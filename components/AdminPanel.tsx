import React, { useState, useRef } from 'react';
import { Employee, Department } from '../types';
import { Plus, Trash2, UserPlus, Settings, Save, X, Building2, Users, Edit2, RotateCcw } from 'lucide-react';

interface AdminPanelProps {
  employees: Employee[];
  departments: Department[];
  onClose: () => void;
  onSave: (employees: Employee[], departments: Department[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  employees: initialEmployees, 
  departments: initialDepartments, 
  onClose, 
  onSave 
}) => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [departments, setDepartments] = useState(initialDepartments);
  const [activeTab, setActiveTab] = useState<'employees' | 'departments'>('employees');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    department: departments[0] || '',
    jobTitle: '',
    reportsTo: '',
    additionalRoles: []
  });
  const [newDept, setNewDept] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const handleSaveAndClose = () => {
    onSave(employees, departments);
    onClose();
  };

  const handleSaveEmployee = () => {
    if (!newEmployee.name || !newEmployee.jobTitle) {
        alert("Nombre y Puesto son obligatorios");
        return;
    }
    
    let updatedEmployees;
    if (editingEmployeeId) {
      updatedEmployees = employees.map(emp => 
        emp.id === editingEmployeeId 
          ? { 
              ...emp, 
              name: newEmployee.name!, 
              department: newEmployee.department || emp.department, 
              jobTitle: newEmployee.jobTitle!, 
              reportsTo: newEmployee.reportsTo || '',
              additionalRoles: newEmployee.additionalRoles || []
            } 
          : emp
      );
    } else {
      const id = Date.now().toString();
      const employee: Employee = {
        id,
        name: newEmployee.name!,
        department: newEmployee.department || departments[0],
        jobTitle: newEmployee.jobTitle!,
        reportsTo: newEmployee.reportsTo || '',
        additionalRoles: newEmployee.additionalRoles || []
      };
      updatedEmployees = [...employees, employee];
    }

    setEmployees(updatedEmployees);
    onSave(updatedEmployees, departments);
    setEditingEmployeeId(null);
    setNewEmployee({ name: '', department: departments[0] || '', jobTitle: '', reportsTo: '', additionalRoles: [] });
  };

  const handleEditEmployee = (employee: Employee) => {
    setNewEmployee({
      name: employee.name,
      department: employee.department,
      jobTitle: employee.jobTitle,
      reportsTo: employee.reportsTo || '',
      additionalRoles: employee.additionalRoles || []
    });
    setEditingEmployeeId(employee.id);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este colaborador?')) {
      const updated = employees.filter(e => e.id !== id);
      setEmployees(updated);
      onSave(updated, departments);
    }
  };

  const handleAddAdditionalRole = () => {
    setNewEmployee(prev => ({
      ...prev,
      additionalRoles: [...(prev.additionalRoles || []), { jobTitle: '', department: departments[0] || '', reportsTo: '' }]
    }));
  };

  const handleRemoveAdditionalRole = (index: number) => {
    setNewEmployee(prev => ({
      ...prev,
      additionalRoles: (prev.additionalRoles || []).filter((_, i) => i !== index)
    }));
  };

  const handleUpdateAdditionalRole = (index: number, field: 'jobTitle' | 'department' | 'reportsTo', value: string) => {
    setNewEmployee(prev => ({
      ...prev,
      additionalRoles: (prev.additionalRoles || []).map((role, i) => 
        i === index ? { ...role, [field]: value } : role
      )
    }));
  };

  const handleAddDept = () => {
    if (!newDept || departments.includes(newDept)) return;
    const updatedDepts = [...departments, newDept];
    setDepartments(updatedDepts);
    onSave(employees, updatedDepts);
    setNewDept('');
  };

  const handleDeleteDept = (dept: string) => {
    if (window.confirm(`¿Eliminar departamento ${dept}?`)) {
      const updatedDepts = departments.filter(d => d !== dept);
      setDepartments(updatedDepts);
      onSave(employees, updatedDepts);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-800">
        
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 text-white rounded-xl shadow-lg">
              <Settings size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">Configuración RR Etiquetas</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full">
            <X size={20} className="text-slate-500 hover:text-white" />
          </button>
        </div>

        <div className="px-8 pt-4 pb-2 flex gap-8 border-b border-slate-800 bg-slate-900/50">
          <button onClick={() => setActiveTab('employees')} className={`pb-4 px-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'employees' ? 'border-orange-500 text-white' : 'border-transparent text-slate-500'}`}>
            <Users size={18} /> Colaboradores
          </button>
          <button onClick={() => setActiveTab('departments')} className={`pb-4 px-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'departments' ? 'border-orange-500 text-white' : 'border-transparent text-slate-500'}`}>
            <Building2 size={18} /> Departamentos
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'employees' ? (
            <div className="space-y-6">
              <div ref={formRef}>
                <section className={`p-6 rounded-2xl border shadow-inner ${editingEmployeeId ? 'bg-amber-900/20 border-amber-500/30' : 'bg-slate-800 border-slate-700'}`}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-white flex items-center gap-2">
                    {editingEmployeeId ? <Edit2 size={14}/> : <UserPlus size={14}/>} {editingEmployeeId ? 'Editando Colaborador' : 'Nuevo Colaborador'}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Nombre</label>
                      <input type="text" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Puesto</label>
                      <input type="text" value={newEmployee.jobTitle} onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Departamento</label>
                      <select value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs">
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase">Superior</label>
                      <select value={newEmployee.reportsTo} onChange={e => setNewEmployee({...newEmployee, reportsTo: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs">
                        <option value="">Sin superior</option>
                        {employees.filter(e => e.id !== editingEmployeeId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase">Funciones Adicionales</h4>
                      <button onClick={handleAddAdditionalRole} className="text-[10px] font-bold text-orange-500">+ Agregar Cargo</button>
                    </div>
                    {(newEmployee.additionalRoles || []).map((role, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                        <input placeholder="Puesto" value={role.jobTitle} onChange={e => handleUpdateAdditionalRole(index, 'jobTitle', e.target.value)} className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700" />
                        <select value={role.department} onChange={e => handleUpdateAdditionalRole(index, 'department', e.target.value)} className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700">
                          {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={role.reportsTo} onChange={e => handleUpdateAdditionalRole(index, 'reportsTo', e.target.value)} className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700">
                          <option value="">Superior</option>
                          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <button onClick={() => handleRemoveAdditionalRole(index)} className="text-red-500 flex justify-center"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-6">
                    {editingEmployeeId && <button onClick={handleCancelEdit} className="flex-1 bg-slate-800 text-white py-2 rounded-xl text-[10px] uppercase font-black">Cancelar</button>}
                    <button onClick={handleSaveEmployee} className="flex-[2] bg-orange-600 text-white py-2 rounded-xl text-[10px] uppercase font-black shadow-lg">Confirmar</button>
                  </div>
                </section>
              </div>

              <section className="mt-8">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="p-4">Colaborador</th>
                      <th className="p-4">Funciones</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="p-4 font-bold text-white text-sm">{emp.name}</td>
                        <td className="p-4 text-xs text-slate-400">
                          <div className="font-bold text-white">{emp.jobTitle} ({emp.department})</div>
                          {emp.additionalRoles?.map((r, i) => <div key={i} className="text-orange-500/70 text-[10px]">{r.jobTitle} - {r.department}</div>)}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleEditEmployee(emp)} className="p-2 text-slate-500 hover:text-orange-400"><Edit2 size={16}/></button>
                          <button onClick={() => handleDeleteEmployee(emp.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex gap-4 bg-slate-800 p-6 rounded-2xl">
                  <input placeholder="Nuevo Departamento" value={newDept} onChange={e => setNewDept(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 text-white text-sm" />
                  <button onClick={handleAddDept} className="bg-orange-600 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px]">Agregar</button>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map(dept => (
                  <div key={dept} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-white font-bold">{dept}</span>
                    <button onClick={() => handleDeleteDept(dept)} className="text-slate-600 hover:text-red-400"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button onClick={handleSaveAndClose} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-500">
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
