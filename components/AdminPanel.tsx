import React, { useState, useRef } from 'react';
import { Employee, Department } from '../types';
import { Plus, Trash2, UserPlus, Settings, Save, X, Building2, Users, Edit2, RotateCcw } from 'lucide-react';

interface AdminPanelProps {
  employees: Employee[];
  departments: Department[];
  onClose: () => void;
  onSave: (employees: Employee[], departments: Department[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ employees: initialEmployees, departments: initialDepartments, onClose, onSave }) => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [departments, setDepartments] = useState(initialDepartments);
  const [activeTab, setActiveTab] = useState<'employees' | 'departments'>('employees');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({ name: '', department: departments[0] || '', jobTitle: '', reportsTo: '', additionalRoles: [] });
  const [newDept, setNewDept] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const handleSaveEmployee = () => {
    if (!newEmployee.name || !newEmployee.jobTitle) return alert("Nombre y Puesto obligatorios");
    const updated = editingEmployeeId 
      ? employees.map(emp => emp.id === editingEmployeeId ? { ...emp, name: newEmployee.name!, department: newEmployee.department!, jobTitle: newEmployee.jobTitle!, reportsTo: newEmployee.reportsTo || '', additionalRoles: newEmployee.additionalRoles || [] } : emp)
      : [...employees, { id: Date.now().toString(), name: newEmployee.name!, department: newEmployee.department || departments[0], jobTitle: newEmployee.jobTitle!, reportsTo: newEmployee.reportsTo || '', additionalRoles: newEmployee.additionalRoles || [] }];
    setEmployees(updated);
    onSave(updated, departments);
    handleCancelEdit();
  };

  const handleEditEmployee = (emp: Employee) => {
    setNewEmployee({ name: emp.name, department: emp.department, jobTitle: emp.jobTitle, reportsTo: emp.reportsTo || '', additionalRoles: emp.additionalRoles || [] });
    setEditingEmployeeId(emp.id);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setNewEmployee({ name: '', department: departments[0] || '', jobTitle: '', reportsTo: '', additionalRoles: [] });
    setEditingEmployeeId(null);
  };

  const handleUpdateRole = (index: number, field: string, value: string) => {
    setNewEmployee(prev => ({ ...prev, additionalRoles: (prev.additionalRoles || []).map((r, i) => i === index ? { ...r, [field]: value } : r) }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[2rem] border border-slate-800 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-3"><Settings className="text-orange-500" /><h2 className="text-xl font-black text-white">Configuración RR Etiquetas</h2></div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div ref={formRef} className={`p-6 rounded-2xl border ${editingEmployeeId ? 'bg-amber-900/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
            <h3 className="text-xs font-black uppercase text-white mb-4 flex items-center gap-2">
              {editingEmployeeId ? <Edit2 size={14}/> : <UserPlus size={14}/>} {editingEmployeeId ? 'Editando' : 'Nuevo'} Colaborador
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <input placeholder="Nombre" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} className="bg-slate-900 p-2 rounded-xl text-white text-xs border border-slate-700" />
              <input placeholder="Puesto Principal" value={newEmployee.jobTitle} onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})} className="bg-slate-900 p-2 rounded-xl text-white text-xs border border-slate-700" />
              <select value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})} className="bg-slate-900 p-2 rounded-xl text-white text-xs border border-slate-700">
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={newEmployee.reportsTo} onChange={e => setNewEmployee({...newEmployee, reportsTo: e.target.value})} className="bg-slate-900 p-2 rounded-xl text-white text-xs border border-slate-700">
                <option value="">Superior Principal</option>
                {employees.filter(e => e.id !== editingEmployeeId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500">CARGOS ADICIONALES</span>
                <button onClick={() => setNewEmployee(prev => ({...prev, additionalRoles: [...(prev.additionalRoles || []), { jobTitle: '', department: departments[0], reportsTo: '' }]}))} className="text-orange-500 text-[10px] font-bold">+ AGREGAR</button>
              </div>
              {(newEmployee.additionalRoles || []).map((role, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-slate-900 rounded-xl border border-slate-700">
                  <input placeholder="Puesto" value={role.jobTitle} onChange={e => handleUpdateRole(idx, 'jobTitle', e.target.value)} className="bg-slate-800 p-2 rounded-lg text-white text-[10px]" />
                  <select value={role.department} onChange={e => handleUpdateRole(idx, 'department', e.target.value)} className="bg-slate-800 p-2 rounded-lg text-white text-[10px]">
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={role.reportsTo} onChange={e => handleUpdateRole(idx, 'reportsTo', e.target.value)} className="bg-slate-800 p-2 rounded-lg text-white text-[10px]">
                    <option value="">Superior</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                  <button onClick={() => setNewEmployee(prev => ({...prev, additionalRoles: (prev.additionalRoles || []).filter((_, i) => i !== idx)}))} className="text-red-500 flex justify-center items-center"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              {editingEmployeeId && <button onClick={handleCancelEdit} className="flex-1 bg-slate-700 text-white py-2 rounded-xl text-[10px] font-black uppercase">Cancelar</button>}
              <button onClick={handleSaveEmployee} className="flex-[2] bg-orange-600 text-white py-2 rounded-xl text-[10px] font-black uppercase">Confirmar Colaborador</button>
            </div>
          </div>

          <table className="w-full text-left">
            <thead><tr className="text-slate-500 text-[10px] uppercase font-black"><th className="p-4">Colaborador</th><th className="p-4">Puestos</th><th className="p-4 text-right">Acciones</th></tr></thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-white text-sm">{emp.name}</td>
                  <td className="p-4"><div className="text-xs text-white">{emp.jobTitle} ({emp.department})</div>
                    {emp.additionalRoles?.map((r, i) => <div key={i} className="text-orange-500/70 text-[10px] italic">{r.jobTitle} - {r.department}</div>)}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEditEmployee(emp)} className="text-slate-500 hover:text-orange-400"><Edit2 size={16}/></button>
                    <button onClick={() => { if(confirm('¿Eliminar?')) { const u = employees.filter(e => e.id !== emp.id); setEmployees(u); onSave(u, departments); }}} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900">
          <button onClick={() => { onSave(employees, departments); onClose(); }} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs">Guardar y Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
