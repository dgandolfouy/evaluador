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
    name: '', department: departments[0] || '', jobTitle: '', reportsTo: '', additionalRoles: [] 
  });
  const formRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setNewEmp({ name: '', department: departments[0] || '', jobTitle: '', reportsTo: '', additionalRoles: [] });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!newEmp.name || !newEmp.jobTitle) return alert("Faltan datos");
    const updated = editingId 
      ? localEmployees.map(e => e.id === editingId ? { ...e, ...newEmp } as Employee : e)
      : [...localEmployees, { ...newEmp, id: Date.now().toString(), averageScore: 0 } as Employee];
    setLocalEmployees(updated);
    onSave(updated, departments);
    resetForm();
  };

  const updateRole = (index: number, field: string, value: string) => {
    const roles = [...(newEmp.additionalRoles || [])];
    roles[index] = { ...roles[index], [field]: value };
    setNewEmp({ ...newEmp, additionalRoles: roles });
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden">
      {/* HEADER: Texto más chico para que no desborde */}
      <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="text-orange-500 w-4 h-4" />
          <h2 className="text-xs font-black text-white uppercase">Admin RR</h2>
        </div>
        <button onClick={onClose} className="p-1.5 bg-slate-800 rounded-lg text-white"><X size={16}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 pb-32">
        {/* FORMULARIO: Padding reducido */}
        <div ref={formRef} className={`p-4 rounded-xl border ${editingId ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-800/30 border-slate-700'}`}>
          <div className="grid grid-cols-1 gap-3">
            <input placeholder="Nombre" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full bg-slate-950 p-2.5 rounded-lg text-white text-xs border border-slate-800" />
            <input placeholder="Puesto Principal" value={newEmp.jobTitle} onChange={e => setNewEmp({...newEmp, jobTitle: e.target.value})} className="w-full bg-slate-950 p-2.5 rounded-lg text-white text-xs border border-slate-800" />
            
            <div className="grid grid-cols-2 gap-2">
              <select value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="bg-slate-950 p-2.5 rounded-lg text-white text-[11px] border border-slate-800">
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={newEmp.reportsTo} onChange={e => setNewEmp({...newEmp, reportsTo: e.target.value})} className="bg-slate-950 p-2.5 rounded-lg text-white text-[11px] border border-slate-800">
                <option value="">Superior</option>
                {localEmployees.filter(e => e.id !== editingId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>

          {/* ROLES EXTRA: Layout ultra compacto */}
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Roles Extra</span>
              <button onClick={() => setNewEmp({...newEmp, additionalRoles: [...(newEmp.additionalRoles || []), { jobTitle: '', department: departments[0], reportsTo: '' }]})} className="text-orange-500 text-[9px] font-black">+ AGREGAR</button>
            </div>
            
            {(newEmp.additionalRoles || []).map((role, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 relative space-y-2">
                <input placeholder="Puesto" value={role.jobTitle} onChange={e => updateRole(idx, 'jobTitle', e.target.value)} className="w-full bg-slate-900 p-2 rounded-md text-white text-[11px] border border-slate-800" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={role.department} onChange={e => updateRole(idx, 'department', e.target.value)} className="bg-slate-900 p-2 rounded-md text-white text-[10px]">
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button onClick={() => setNewEmp({...newEmp, additionalRoles: (newEmp.additionalRoles || []).filter((_, i) => i !== idx)})} className="bg-red-950/30 text-red-500 p-2 rounded-md flex justify-center"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            {editingId && <button onClick={resetForm} className="flex-1 bg-slate-700 text-white py-2.5 rounded-lg text-[10px] font-bold uppercase">X</button>}
            <button onClick={handleSave} className="flex-[4] bg-orange-600 text-white py-2.5 rounded-lg text-[10px] font-black uppercase">Confirmar Cambio</button>
          </div>
        </div>

        {/* LISTADO: Tarjetas con padding mínimo */}
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Colaboradores</p>
          {localEmployees.map(emp => (
            <div key={emp.id} className="bg-slate-800/20 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-xs truncate">{emp.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{emp.jobTitle}</div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => { setNewEmp({...emp}); setEditingId(emp.id); formRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="p-2 bg-slate-800 rounded-lg text-slate-400"><Edit2 size={14}/></button>
                <button onClick={() => { if(confirm('¿Borrar?')) { const u = localEmployees.filter(e => e.id !== emp.id); setLocalEmployees(u); onSave(u, departments); }}} className="p-2 bg-red-950/20 rounded-lg text-red-400"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTÓN FIJO: Ocupa todo el ancho abajo */}
      <div className="p-3 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-[110]">
        <button onClick={() => { onSave(localEmployees, departments); onClose(); }} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black uppercase text-xs shadow-lg">
          Guardar y Finalizar
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
