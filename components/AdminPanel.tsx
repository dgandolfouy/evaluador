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

  const handleSaveEmployee = () => {
    if (!newEmp.name || !newEmp.jobTitle) return alert("Faltan datos");
    const updated = editingId 
      ? localEmployees.map(e => e.id === editingId ? { ...e, ...newEmp } as Employee : e)
      : [...localEmployees, { ...newEmp, id: Date.now().toString(), averageScore: 0 } as Employee];
    setLocalEmployees(updated);
    onSave(updated, localDepartments);
    setEditingId(null);
    setNewEmp({ name: '', department: localDepartments[0] || '', jobTitle: '', reportsTo: '', additionalRoles: [] });
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

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
        <div className="flex items-center gap-2"><Settings className="text-orange-500 w-5 h-5" /><h2 className="text-sm font-black text-white uppercase">RR Admin</h2></div>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-xl text-white"><X size={20}/></button>
      </div>

      <div className="flex bg-slate-900 border-b border-slate-800 shrink-0">
        <button onClick={() => setActiveTab('employees')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 ${activeTab === 'employees' ? 'border-orange-500 text-white' : 'text-slate-500'}`}>Colaboradores</button>
        <button onClick={() => setActiveTab('departments')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 ${activeTab === 'departments' ? 'border-orange-500 text-white' : 'text-slate-500'}`}>Departamentos</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 bg-slate-950">
        {activeTab === 'employees' ? (
          <>
            <div ref={formRef} className="p-5 rounded-3xl border bg-slate-900 border-slate-800">
              <input placeholder="Nombre" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full bg-slate-800 p-3 rounded-2xl text-white text-sm mb-3" />
              <input placeholder="Puesto" value={newEmp.jobTitle} onChange={e => setNewEmp({...newEmp, jobTitle: e.target.value})} className="w-full bg-slate-800 p-3 rounded-2xl text-white text-sm mb-3" />
              <div className="grid grid-cols-2 gap-3 mb-6">
                <select value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="bg-slate-800 p-3 rounded-2xl text-white text-xs">{localDepartments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                <select value={newEmp.reportsTo} onChange={e => setNewEmp({...newEmp, reportsTo: e.target.value})} className="bg-slate-800 p-3 rounded-2xl text-white text-xs"><option value="">Superior</option>{localEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
              </div>
              <div className="space-y-4 border-t border-slate-800 pt-4">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase">Funciones Extra</span><button onClick={() => setNewEmp({...newEmp, additionalRoles: [...(newEmp.additionalRoles || []), { jobTitle: '', department: localDepartments[0], reportsTo: '' }]})} className="text-orange-500 text-[10px] font-bold">+ AÑADIR</button></div>
                {(newEmp.additionalRoles || []).map((role, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700 relative space-y-2">
                    <input placeholder="Puesto" value={role.jobTitle} onChange={e => { const r = [...newEmp.additionalRoles!]; r[idx].jobTitle = e.target.value; setNewEmp({...newEmp, additionalRoles: r}); }} className="w-full bg-slate-900 p-2 rounded-lg text-white text-xs" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={role.department} onChange={e => { const r = [...newEmp.additionalRoles!]; r[idx].department = e.target.value; setNewEmp({...newEmp, additionalRoles: r}); }} className="bg-slate-900 p-2 rounded-lg text-white text-[10px]">{localDepartments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                      <select value={role.reportsTo} onChange={e => { const r = [...newEmp.additionalRoles!]; r[idx].reportsTo = e.target.value; setNewEmp({...newEmp, additionalRoles: r}); }} className="bg-slate-900 p-2 rounded-lg text-white text-[10px]"><option value="">Superior</option>{localEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
                    </div>
                    <button onClick={() => setNewEmp({...newEmp, additionalRoles: newEmp.additionalRoles!.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-600 p-1.5 rounded-full text-white"><Trash2 size={12}/></button>
                  </div>
                ))}
              </div>
              <button onClick={handleSaveEmployee} className="w-full bg-orange-600 text-white py-4 rounded-2xl mt-6 font-black uppercase text-xs">{editingId ? 'Confirmar' : 'Registrar'}</button>
            </div>
            {localEmployees.map(emp => (
              <div key={emp.id} className="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex justify-between items-center">
                <div className="min-w-0 flex-1"><div className="font-black text-white text-sm uppercase">{emp.name}</div><div className="text-[10px] text-slate-500">{emp.jobTitle}</div></div>
                <div className="flex gap-2"><button onClick={() => { setNewEmp({...emp}); setEditingId(emp.id); formRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="p-3 bg-slate-800 text-orange-500 rounded-2xl"><Edit2 size={18}/></button></div>
              </div>
            ))}
          </>
        ) : (
          /* PESTAÑA DEPARTAMENTOS CON EDICIÓN */
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Añadir Departamento</p>
              <div className="flex flex-col gap-3">
                <input placeholder="Nombre" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} className="w-full bg-slate-800 p-4 rounded-2xl text-white text-sm border border-slate-700 outline-none" />
                <button onClick={() => { if(!newDeptName.trim()) return; setLocalDepartments([...localDepartments, newDeptName.trim()]); onSave(localEmployees, [...localDepartments, newDeptName.trim()]); setNewDeptName(''); }} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase text-xs">+ Agregar</button>
              </div>
            </div>
            {localDepartments.map(dept => (
              <div key={dept} className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Building2 className="text-orange-500" size={20} />
                  {editingDeptName === dept ? <input value={editDeptValue} onChange={e => setEditDeptValue(e.target.value)} className="bg-slate-800 p-2 rounded-lg text-white text-sm flex-1 outline-none border border-orange-500/50" autoFocus /> : <span className="text-white font-black text-sm uppercase truncate">{dept}</span>}
                </div>
                <div className="flex gap-2 ml-4">
                  {editingDeptName === dept ? <button onClick={handleSaveDeptEdit} className="p-3 bg-emerald-950/20 text-emerald-500 rounded-2xl"><Save size={18}/></button> : <button onClick={() => { setEditingDeptName(dept); setEditDeptValue(dept); }} className="p-3 bg-slate-800 text-orange-500 rounded-2xl"><Edit2 size={18}/></button>}
                  <button onClick={() => { if(confirm('¿Borrar?')) { const u = localDepartments.filter(d => d !== dept); setLocalDepartments(u); onSave(localEmployees, u); }}} className="p-3 bg-red-950/20 text-red-500 rounded-2xl"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-[110]">
        <button onClick={() => { onSave(localEmployees, localDepartments); onClose(); }} className="w-full bg-slate-100 text-slate-950 py-4 rounded-2xl font-black uppercase text-xs shadow-xl">Finalizar y Cerrar</button>
      </div>
    </div>
  );
};
