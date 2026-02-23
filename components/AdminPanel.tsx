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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({ 
    name: '', 
    department: departments[0] || '', 
    jobTitle: '', 
    reportsTo: '', 
    additionalRoles: [] 
  });
  const formRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setNewEmp({ name: '', department: departments[0] || '', jobTitle: '', reportsTo: '', additionalRoles: [] });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!newEmp.name || !newEmp.jobTitle) return alert("Nombre y Puesto obligatorios");
    
    const updated = editingId 
      ? localEmployees.map(e => e.id === editingId ? { ...e, ...newEmp } as Employee : e)
      : [...localEmployees, { ...newEmp, id: Date.now().toString(), averageScore: 0 } as Employee];
    
    setLocalEmployees(updated);
    onSave(updated, departments);
    resetForm();
  };

  const startEdit = (emp: Employee) => {
    setNewEmp({ ...emp });
    setEditingId(emp.id);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateRole = (index: number, field: string, value: string) => {
    const roles = [...(newEmp.additionalRoles || [])];
    roles[index] = { ...roles[index], [field]: value };
    setNewEmp({ ...newEmp, additionalRoles: roles });
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col sm:p-4">
      <div className="bg-slate-900 w-full max-w-5xl mx-auto h-full sm:h-auto sm:max-h-[95vh] sm:rounded-3xl border-x sm:border border-slate-800 flex flex-col shadow-2xl">
        
        {/* HEADER FIJO */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Settings className="text-orange-500 w-5 h-5" />
            <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-tight">Admin RR Etiquetas</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-lg text-white"><X size={18}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
          {/* FORMULARIO */}
          <div ref={formRef} className={`p-4 rounded-2xl border ${editingId ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/40 border-slate-700'}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">
              {editingId ? 'Editando Colaborador' : 'Nuevo Ingreso'}
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              <input placeholder="Nombre Completo" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full bg-slate-950 p-3 rounded-xl text-white text-sm border border-slate-700" />
              <input placeholder="Cargo Principal" value={newEmp.jobTitle} onChange={e => setNewEmp({...newEmp, jobTitle: e.target.value})} className="w-full bg-slate-950 p-3 rounded-xl text-white text-sm border border-slate-700" />
              
              <div className="grid grid-cols-2 gap-2">
                <select value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="bg-slate-950 p-3 rounded-xl text-white text-xs border border-slate-700">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={newEmp.reportsTo} onChange={e => setNewEmp({...newEmp, reportsTo: e.target.value})} className="bg-slate-950 p-3 rounded-xl text-white text-xs border border-slate-700">
                  <option value="">Superior</option>
                  {localEmployees.filter(e => e.id !== editingId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>

            {/* FUNCIONES EXTRA - TARJETAS RESPONSIVAS */}
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase">Segunda/Tercera Función</span>
                <button onClick={() => setNewEmp({...newEmp, additionalRoles: [...(newEmp.additionalRoles || []), { jobTitle: '', department: departments[0], reportsTo: '' }]})} className="text-orange-500 text-[10px] font-bold">+ AGREGAR</button>
              </div>
              
              {(newEmp.additionalRoles || []).map((role, idx) => (
                <div key={idx} className="p-3 bg-slate-950/50 rounded-xl border border-slate-700 relative space-y-2">
                  <input placeholder="Puesto" value={role.jobTitle} onChange={e => updateRole(idx, 'jobTitle', e.target.value)} className="w-full bg-slate-900 p-2 rounded-lg text-white text-xs border border-slate-800" />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={role.department} onChange={e => updateRole(idx, 'department', e.target.value)} className="bg-slate-900 p-2 rounded-lg text-white text-[10px]">
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={role.reportsTo} onChange={e => updateRole(idx, 'reportsTo', e.target.value)} className="bg-slate-900 p-2 rounded-lg text-white text-[10px]">
                      <option value="">Superior</option>
                      {localEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setNewEmp({...newEmp, additionalRoles: (newEmp.additionalRoles || []).filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-600 p-1.5 rounded-full text-white shadow-lg"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              {editingId && <button onClick={resetForm} className="flex-1 bg-slate-700 text-white py-3 rounded-xl text-[10px] font-black uppercase">Cancelar</button>}
              <button onClick={handleSave} className="flex-[2] bg-orange-600 text-white py-3 rounded-xl text-[10px] font-black uppercase shadow-lg">Confirmar</button>
            </div>
          </div>

          {/* LISTADO TIPO TARJETA (MUCHO MEJOR EN MÓVIL) */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Colaboradores Activos</p>
            {localEmployees.map(emp => (
              <div key={emp.id} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm truncate">{emp.name}</div>
                  <div className="text-[10px] text-slate-500">{emp.jobTitle} • {emp.department}</div>
                  {emp.additionalRoles?.map((r, i) => (
                    <div key={i} className="text-[9px] text-orange-400 mt-1 italic">+{r.jobTitle}</div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(emp)} className="p-2 text-slate-400 bg-slate-800 rounded-lg"><Edit2 size={16}/></button>
                  <button onClick={() => { if(confirm('¿Borrar?')) { const u = localEmployees.filter(e => e.id !== emp.id); setLocalEmployees(u); onSave(u, departments); }}} className="p-2 text-red-400 bg-red-950/20 rounded-lg"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTÓN DE CIERRE FIJO ABAJO */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10">
          <button onClick={() => { onSave(localEmployees, departments); onClose(); }} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black uppercase text-xs shadow-xl shadow-orange-900/40 flex items-center justify-center gap-2">
            <Save size={18}/> Guardar y Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};
