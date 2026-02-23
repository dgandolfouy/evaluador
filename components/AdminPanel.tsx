import React, { useState, useRef } from 'react';
import { Employee, Department } from '../types';
import { Plus, Trash2, UserPlus, Settings, Save, X, Building2, Users, Edit2, RotateCcw } from 'lucide-react';

interface AdminPanelProps {
  employees: Employee[];
  departments: Department[];
  onClose: () => void;
  onSave: (employees: Employee[], departments: Department[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ employees, departments, onClose, onSave }) => {
  const [localEmployees, setLocalEmployees] = useState(employees);
  const [localDepartments, setLocalDepartments] = useState(departments);
  const [activeTab, setActiveTab] = useState<'employees' | 'departments'>('employees');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState<string | null>(null);
  const [editDeptValue, setEditDeptValue] = useState('');
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({ 
    name: '', department: localDepartments[0] || '', jobTitle: '', reportsTo: '', additionalRoles: [] 
  });
  const [newDeptName, setNewDeptName] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setNewEmp({ name: '', department: localDepartments[0] || '', jobTitle: '', reportsTo: '', additionalRoles: [] });
    setEditingId(null);
  };

  const handleSaveEmployee = () => {
    if (!newEmp.name || !newEmp.jobTitle) return alert("Faltan datos");
    const updated = editingId 
      ? localEmployees.map(e => e.id === editingId ? { ...e, ...newEmp } as Employee : e)
      : [...localEmployees, { ...newEmp, id: Date.now().toString(), averageScore: 0 } as Employee];
    setLocalEmployees(updated);
    onSave(updated, localDepartments);
    resetForm();
  };

  const handleAddDept = () => {
    if (!newDeptName.trim() || localDepartments.includes(newDeptName.trim())) return;
    const updatedDepts = [...localDepartments, newDeptName.trim()];
    setLocalDepartments(updatedDepts);
    onSave(localEmployees, updatedDepts);
    setNewDeptName('');
  };

  const handleStartEditDept = (dept: string) => {
    setEditingDeptName(dept);
    setEditDeptValue(dept);
  };

  const handleSaveDeptEdit = () => {
    if (!editDeptValue.trim() || !editingDeptName) return;
    const updatedDepts = localDepartments.map(d => d === editingDeptName ? editDeptValue.trim() : d);
    const updatedEmps = localEmployees.map(emp => ({
      ...emp,
      department: emp.department === editingDeptName ? editDeptValue.trim() : emp.department,
      additionalRoles: emp.additionalRoles?.map(r => r.department === editingDeptName ? { ...r, department: editDeptValue.trim() } : r)
    }));
    setLocalDepartments(updatedDepts);
    setLocalEmployees(updatedEmps);
    onSave(updatedEmps, updatedDepts);
    setEditingDeptName(null);
  };

  const handleDeleteDept = (dept: string) => {
    if (localEmployees.some(e => e.department === dept)) return alert("Tiene personal asignado");
    if (confirm(`¿Borrar ${dept}?`)) {
      const updatedDepts = localDepartments.filter(d => d !== dept);
      setLocalDepartments(updatedDepts);
      onSave(localEmployees, updatedDepts);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
        <div className="flex items-center gap-2"><Settings className="text-orange-500 w-5 h-5" /><h2 className="text-sm font-black text-white uppercase">Admin RR</h2></div>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-xl text-white"><X size={20}/></button>
      </div>

      <div className="flex bg-slate-900 border-b border-slate-800 shrink-0">
        <button onClick={() => setActiveTab('employees')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 ${activeTab === 'employees' ? 'border-orange-500 text-white bg-orange-500/5' : 'border-transparent text-slate-500'}`}>Colaboradores</button>
        <button onClick={() => setActiveTab('departments')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 ${activeTab === 'departments' ? 'border-orange-500 text-white bg-orange-500/5' : 'border-transparent text-slate-500'}`}>Departamentos</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 bg-slate-950">
        {activeTab === 'employees' ? (
          <div className="space-y-6">
            <div ref={formRef} className="p-5 rounded-3xl border bg-slate-900 border-slate-800">
              <div className="space-y-4">
                <input placeholder="Nombre" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full bg-slate-800 p-3 rounded-2xl text-white text-sm border border-slate-700 outline-none" />
                <input placeholder="Puesto" value={newEmp.jobTitle} onChange={e => setNewEmp({...newEmp, jobTitle: e.target.value})} className="w-full bg-slate-800 p-3 rounded-2xl text-white text-sm border border-slate-700 outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="bg-slate-800 p-3 rounded-2xl text-white text-xs border border-slate-700">
                    {localDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={newEmp.reportsTo} onChange={e => setNewEmp({...newEmp, reportsTo: e.target.value})} className="bg-slate-800 p-3 rounded-2xl text-white text-xs border border-slate-700">
                    <option value="">Superior</option>
                    {localEmployees.filter(e => e.id !== editingId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleSaveEmployee} className="w-full bg-orange-600 text-white py-4 rounded-2xl mt-6 text-xs font-black uppercase shadow-lg shadow-orange-900/20">{editingId ? 'Confirmar' : 'Registrar'}</button>
            </div>
            <div className="space-y-3">
              {localEmployees.map(emp => (
                <div key={emp.id} className="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex justify-between items-center shadow-sm">
                  <div className="min-w-0 flex-1"><div className="font-black text-white text-sm truncate uppercase tracking-tighter">{emp.name}</div><div className="text-[10px] text-slate-500 font-bold">{emp.jobTitle}</div></div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => { setNewEmp({...emp}); setEditingId(emp.id); formRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="p-3 bg-slate-800 text-orange-500 rounded-2xl"><Edit2 size={18}/></button>
                    <button onClick={() => { if(confirm('¿Borrar?')) { const u = localEmployees.filter(e => e.id !== emp.id); setLocalEmployees(u); onSave(u, localDepartments); }}} className="p-3 bg-red-950/20 text-red-500 rounded-2xl"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Nuevo Departamento</p>
              <div className="flex flex-col gap-3">
                <input placeholder="Nombre" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} className="w-full bg-slate-800 p-4 rounded-2xl text-white text-sm border border-slate-700 outline-none" />
                <button onClick={handleAddDept} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2"><Plus size={18}/> Agregar</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {localDepartments.map(dept => (
                <div key={dept} className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex justify-between items-center group">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-orange-500"><Building2 size={20} /></div>
                    {editingDeptName === dept ? (
                      <input value={editDeptValue} onChange={e => setEditDeptValue(e.target.value)} className="bg-slate-800 p-2 rounded-lg text-white text-sm border border-orange-500/50 flex-1 outline-none" autoFocus />
                    ) : (
                      <span className="text-white font-black text-sm uppercase truncate">{dept}</span>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {editingDeptName === dept ? (
                      <button onClick={handleSaveDeptEdit} className="p-3 bg-emerald-950/20 text-emerald-500 rounded-2xl"><Save size={18}/></button>
                    ) : (
                      <button onClick={() => handleStartEditDept(dept)} className="p-3 bg-slate-800 text-orange-500 rounded-2xl"><Edit2 size={18}/></button>
                    )}
                    <button onClick={() => handleDeleteDept(dept)} className="p-3 bg-red-950/20 text-red-500 rounded-2xl"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-[110] shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <button onClick={() => { onSave(localEmployees, localDepartments); onClose(); }} className="w-full bg-slate-100 text-slate-950 py-4 rounded-2xl font-black uppercase text-xs shadow-xl">Finalizar y Cerrar</button>
      </div>
    </div>
  );
};
