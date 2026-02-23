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

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-800">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 text-white rounded-xl shadow-lg">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Configuración RR Etiquetas</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-all">
            <X size={20} className="text-slate-500 hover:text-white" />
          </button>
        </div>

        {/* Tabs */}
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
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-white">
                    {editingEmployeeId ? <Edit2 size={14} /> : <UserPlus size={14} />} 
                    {editingEmployeeId ? 'Editando Colaborador' : 'Nuevo Colaborador'}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                      <input type="text" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Puesto Principal</label>
                      <input type="text" value={newEmployee.jobTitle} onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Departamento</label>
                      <select value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs">
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Superior Principal</label>
                      <select value={newEmployee.reportsTo} onChange={e => setNewEmployee({...newEmployee, reportsTo: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs">
                        <option value="">Sin superior</option>
                        {employees.filter(e => e.id !== editingEmployeeId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cargos Adicionales (2º y 3º Función)</h4>
                      <button onClick={handleAddAdditionalRole} className="text-[10px] font-bold text-orange-500 flex items-center gap-1">
                        <Plus size={14} /> Agregar Cargo
                      </button>
                    </div>
                    
                    {(newEmployee.additionalRoles || []).map((role, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 relative">
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Puesto Adicional</label>
                           <input value={role.jobTitle} onChange={e => handleUpdateAdditionalRole(index, 'jobTitle', e.target.value)} className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Departamento</label>
                           <select value={role.department} onChange={e => handleUpdateAdditionalRole(index, 'department', e.target.value)} className="w-full bg-slate-900 text-white text-xs px-3 py
