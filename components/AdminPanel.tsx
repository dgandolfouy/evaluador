import React, { useState, useRef } from 'react';
import { Employee, Department } from '../types';
import { Plus, Trash2, UserPlus, Settings, Save, X, Building2, Users, Edit2, RotateCcw, Lock } from 'lucide-react';

interface AdminPanelProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  employees, 
  setEmployees, 
  departments, 
  setDepartments, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'departments'>('employees');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [editDeptValue, setEditDeptValue] = useState('');
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    department: departments[0] || '',
    jobTitle: '',
    reportsTo: '',
    additionalRoles: []
  });
  const [newDept, setNewDept] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const handleSaveEmployee = () => {
    if (!newEmployee.name || !newEmployee.jobTitle) return;
    
    if (editingEmployeeId) {
      // Update existing
      setEmployees(employees.map(emp => 
        emp.id === editingEmployeeId 
          ? { 
              ...emp, 
              name: newEmployee.name!, 
              department: newEmployee.department || emp.department, 
              jobTitle: newEmployee.jobTitle!, 
              reportsTo: newEmployee.reportsTo || undefined,
              additionalRoles: newEmployee.additionalRoles || []
            } 
          : emp
      ));
      setEditingEmployeeId(null);
    } else {
      // Add new
      const id = Date.now().toString();
      const employee: Employee = {
        id,
        name: newEmployee.name!,
        department: newEmployee.department || departments[0],
        jobTitle: newEmployee.jobTitle!,
        reportsTo: newEmployee.reportsTo || undefined,
        additionalRoles: newEmployee.additionalRoles || []
      };
      setEmployees([...employees, employee]);
    }

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

  const handleCancelEdit = () => {
    setNewEmployee({ name: '', department: departments[0] || '', jobTitle: '', reportsTo: '', additionalRoles: [] });
    setEditingEmployeeId(null);
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este colaborador?')) {
      setEmployees(employees.filter(e => e.id !== id));
      if (editingEmployeeId === id) {
        handleCancelEdit();
      }
    }
  };

  const handleAddDept = () => {
    if (!newDept || departments.includes(newDept)) return;
    setDepartments([...departments, newDept]);
    setNewDept('');
  };

  const handleEditDept = (dept: string) => {
    setEditingDept(dept);
    setEditDeptValue(dept);
  };

  const handleSaveDeptEdit = () => {
    if (!editingDept || !editDeptValue || departments.includes(editDeptValue) && editDeptValue !== editingDept) return;
    
    // Update departments list
    setDepartments(departments.map(d => d === editingDept ? editDeptValue : d));
    
    // Update all employees in this department
    setEmployees(employees.map(emp => {
      let updatedEmp = { ...emp };
      if (emp.department === editingDept) {
        updatedEmp.department = editDeptValue;
      }
      if (emp.additionalRoles) {
        updatedEmp.additionalRoles = emp.additionalRoles.map(role => 
          role.department === editingDept ? { ...role, department: editDeptValue } : role
        );
      }
      return updatedEmp;
    }));

    setEditingDept(null);
    setEditDeptValue('');
  };

  const handleDeleteDept = (dept: string) => {
    // Check if any employee is in this department
    const hasEmployees = employees.some(e => 
      e.department === dept || 
      e.additionalRoles?.some(r => r.department === dept)
    );
    
    if (hasEmployees) {
      alert('No se puede eliminar un departamento que tiene colaboradores asignados. Primero cambie el departamento de esos colaboradores.');
      return;
    }
    
    if (window.confirm(`¿Está seguro de eliminar el departamento "${dept}"?`)) {
      setDepartments(departments.filter(d => d !== dept));
    }
  };

  const handleAddAdditionalRole = () => {
    setNewEmployee(prev => ({
      ...prev,
      additionalRoles: [...(prev.additionalRoles || []), { jobTitle: '', department: departments[0] || '' }]
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
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-900/20">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Configuración</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Gestione la estructura y el personal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-all">
            <X size={20} className="text-slate-500 hover:text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-1 sm:pb-2 flex gap-4 sm:gap-8 border-b border-slate-800 overflow-x-auto no-scrollbar bg-slate-900/50">
          <button 
            onClick={() => setActiveTab('employees')}
            className={`pb-3 sm:pb-4 px-1 sm:px-2 flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'employees' ? 'border-orange-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Users size={16} className="sm:w-[18px] sm:h-[18px]" /> Colaboradores
          </button>
          <button 
            onClick={() => setActiveTab('departments')}
            className={`pb-3 sm:pb-4 px-1 sm:px-2 flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'departments' ? 'border-orange-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Building2 size={16} className="sm:w-[18px] sm:h-[18px]" /> Departamentos
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {activeTab === 'employees' ? (
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
              {/* Add/Edit Employee Form */}
              <div ref={formRef}>
                <section className={`p-3 sm:p-6 rounded-2xl border shadow-inner transition-colors ${editingEmployeeId ? 'bg-amber-900/20 border-amber-500/30' : 'bg-slate-800 border-slate-700'}`}>
                  <h3 className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2 ${editingEmployeeId ? 'text-amber-500' : 'text-white'}`}>
                    {editingEmployeeId ? (
                      <><Edit2 size={14} className="sm:w-4 sm:h-4" /> Editando Colaborador</>
                    ) : (
                      <><UserPlus size={14} className="sm:w-4 sm:h-4 text-orange-500" /> Nuevo Colaborador</>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Daniel Gandolfo"
                        value={newEmployee.name}
                        onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-orange-600 bg-slate-900 text-white transition-all font-medium placeholder:text-slate-600 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Puesto</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Gerente de Sección"
                        value={newEmployee.jobTitle}
                        onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-orange-600 bg-slate-900 text-white transition-all font-medium placeholder:text-slate-600 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Departamento</label>
                      <select 
                        value={newEmployee.department}
                        onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-orange-600 bg-slate-900 text-white transition-all font-medium appearance-none text-xs"
                      >
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Superior</label>
                      <select 
                        value={newEmployee.reportsTo}
                        onChange={e => setNewEmployee({...newEmployee, reportsTo: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-orange-600 bg-slate-900 text-white transition-all font-medium appearance-none text-xs"
                      >
                        <option value="">Sin superior</option>
                        {employees.filter(e => e.id !== editingEmployeeId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Additional Roles Section */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cargos y Departamentos Adicionales</h4>
                      <button 
                        onClick={handleAddAdditionalRole}
                        className="text-[10px] font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors"
                      >
                        <Plus size={14} /> Agregar Cargo
                      </button>
                    </div>
                    
                    {(newEmployee.additionalRoles || []).map((role, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 relative group">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Puesto Adicional</label>
                          <input 
                            type="text" 
                            placeholder="Ej. Responsable de Calidad"
                            value={role.jobTitle}
                            onChange={e => handleUpdateAdditionalRole(index, 'jobTitle', e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-orange-600 bg-slate-900 text-white transition-all font-medium placeholder:text-slate-600 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Departamento Adicional</label>
                          <select 
                            value={role.department}
                            onChange={e => handleUpdateAdditionalRole(index, 'department', e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-orange-600 bg-slate-900 text-white transition-all font-medium appearance-none text-xs"
                          >
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Superior para este Cargo</label>
                          <select 
                            value={role.reportsTo || ''}
                            onChange={e => handleUpdateAdditionalRole(index, 'reportsTo', e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-orange-600 bg-slate-900 text-white transition-all font-medium appearance-none text-xs"
                          >
                            <option value="">Sin superior (Nivel Raíz)</option>
                            {employees.filter(e => e.id !== editingEmployeeId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button 
                            onClick={() => handleRemoveAdditionalRole(index)}
                            className="p-2 text-slate-600 hover:text-red-400 transition-all hover:bg-red-500/10 rounded-lg"
                            title="Eliminar cargo adicional"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-6">
                    {editingEmployeeId && (
                      <button 
                        onClick={handleCancelEdit}
                        className="w-full sm:flex-1 bg-slate-800 text-slate-400 font-black uppercase tracking-widest text-[9px] sm:text-[10px] py-2 sm:py-3 rounded-xl hover:bg-slate-700 hover:text-white transition-all border border-slate-700 flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={12} /> Cancelar
                      </button>
                    )}
                    <button 
                      onClick={handleSaveEmployee}
                      className={`w-full sm:flex-[2] text-white font-black uppercase tracking-widest text-[9px] sm:text-[10px] py-2 sm:py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${editingEmployeeId ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20'}`}
                    >
                      {editingEmployeeId ? <Save size={14} /> : <Plus size={14} />}
                      {editingEmployeeId ? 'Guardar Cambios' : 'Registrar Colaborador'}
                    </button>
                  </div>
                </section>
              </div>

              {/* Employee List */}
              <section>
                <h3 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 sm:mb-6">Personal Registrado</h3>
                <div className="overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-800 shadow-sm">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-800">
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Puesto</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Departamento</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Superior</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id} className={`border-b border-slate-800 transition-colors ${editingEmployeeId === emp.id ? 'bg-amber-900/10' : 'hover:bg-slate-800/50'}`}>
                          <td className="py-3 sm:py-4 px-4 sm:px-6 font-bold text-white text-sm">
                            {emp.name}
                            {emp.additionalRoles && emp.additionalRoles.length > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded text-[8px] font-black uppercase tracking-widest border border-slate-700">
                                +{emp.additionalRoles.length}
                              </span>
                            )}
                          </td>
                          <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-400 text-xs sm:text-sm font-medium">
                            <div>{emp.jobTitle}</div>
                            {emp.additionalRoles?.map((r, i) => (
                              <div key={i} className="text-[10px] text-slate-600 italic">{r.jobTitle}</div>
                            ))}
                          </td>
                          <td className="py-3 sm:py-4 px-4 sm:px-6">
                            <div className="flex flex-col gap-1">
                              <span className="px-2 sm:px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-slate-700 whitespace-nowrap w-fit">
                                {emp.department}
                              </span>
                              {emp.additionalRoles?.map((r, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-900/50 text-slate-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-800 whitespace-nowrap w-fit">
                                  {r.department}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-500 text-xs sm:text-sm font-medium">
                            <div>{employees.find(e => e.id === emp.reportsTo)?.name || '-'}</div>
                            {emp.additionalRoles?.map((r, i) => (
                              <div key={i} className="text-[10px] text-slate-600 italic">
                                {employees.find(e => e.id === r.reportsTo)?.name || '-'}
                              </div>
                            ))}
                          </td>
                          <td className="py-3 sm:py-4 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <button 
                                onClick={() => handleEditEmployee(emp)}
                                className="p-1.5 sm:p-2 text-slate-500 hover:text-orange-400 transition-all hover:bg-orange-500/10 rounded-lg"
                                title="Editar"
                              >
                                <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                              </button>
                              <button 
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="p-1.5 sm:p-2 text-slate-500 hover:text-red-400 transition-all hover:bg-red-500/10 rounded-lg"
                                title="Eliminar"
                              >
                                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : activeTab === 'departments' ? (
            <div className="space-y-6 sm:space-y-10 animate-fade-in">
              {/* Add Department Form */}
              <section className="bg-orange-900/10 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-orange-500/20 shadow-inner">
                <h3 className="text-[10px] sm:text-xs font-black text-orange-400 uppercase tracking-[0.2em] mb-4 sm:mb-6 flex items-center gap-2">
                  <Building2 size={16} className="text-orange-500" /> Nuevo Departamento
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <input 
                    type="text" 
                    placeholder="Ej. Expedición"
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-orange-500/30 outline-none focus:ring-2 focus:ring-orange-500 bg-slate-900 text-white transition-all font-bold text-sm sm:text-lg placeholder:text-slate-600"
                  />
                  <button 
                    onClick={handleAddDept}
                    className="bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} className="sm:w-5 sm:h-5" /> Agregar
                  </button>
                </div>
              </section>

              {/* Department List */}
              <section>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Departamentos Activos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map(dept => (
                    <div 
                      key={dept} 
                      className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center justify-between group hover:border-orange-500/50 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-orange-500/10 group-hover:text-orange-400 transition-all">
                          <Building2 size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          {editingDept === dept ? (
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={editDeptValue}
                                onChange={e => setEditDeptValue(e.target.value)}
                                className="w-full bg-slate-800 border border-orange-500/50 rounded-lg px-2 py-1 text-white font-bold outline-none"
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && handleSaveDeptEdit()}
                              />
                              <button onClick={handleSaveDeptEdit} className="text-emerald-500 p-1 hover:bg-emerald-500/10 rounded">
                                <Save size={18} />
                              </button>
                              <button onClick={() => setEditingDept(null)} className="text-slate-500 p-1 hover:bg-slate-500/10 rounded">
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="font-black text-white tracking-tight truncate">{dept}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {employees.filter(e => e.department === dept || e.additionalRoles?.some(r => r.department === dept)).length} Colaboradores
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      {!editingDept && (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEditDept(dept)}
                            className="p-2 text-slate-600 hover:text-orange-400 transition-all hover:bg-orange-500/10 rounded-xl"
                            title="Editar nombre"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteDept(dept)}
                            className="p-2 text-slate-600 hover:text-red-400 transition-all hover:bg-red-500/10 rounded-xl"
                            title="Eliminar departamento"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </div>

        <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/20 flex items-center gap-2"
          >
            <Save size={16} /> Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
