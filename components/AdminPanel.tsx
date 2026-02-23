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
    if (!newEmp.name || !newEmp.jobTitle) return alert("Faltan datos obligatorios");
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
      {/* HEADER FIJO */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="text-orange-500 w-5 h-5" />
          <h2 className="text-sm font-black text-white uppercase tracking-tighter">Panel de Control RR</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-xl text-white"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 bg-slate-950">
        {/* FORMULARIO DE EDICIÓN / REGISTRO */}
        <div ref={formRef} className={`p-5 rounded-[2rem] border ${editingId ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
          <p className="text-[10px] font-black text-slate-500 uppercase mb-5 tracking-widest flex items-center gap-2">
             {editingId ? <Edit2 size={12}/> : <UserPlus size={12}/>} {editingId ? 'Modificar Colaborador' : 'Nuevo Colaborador'}
          </p>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Nombre y Apellido</label>
              <input value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full bg-slate-800 p-3 rounded-2xl text-white text-sm border border-slate-700 focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Puesto Principal</label>
              <input value={newEmp.jobTitle} onChange={e => setNewEmp({...newEmp, jobTitle: e.target.value})} className="w-full bg-slate-800 p-3 rounded-2xl text-white text-sm border border-slate-700 focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Área</label>
                <select value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="w-full bg-slate-800 p-3 rounded-2xl text-white text-xs border border-slate-700">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Superior</label>
                <select value={newEmp.reportsTo} onChange={e => setNewEmp({...newEmp, reportsTo: e.target.value})} className="w-full bg-slate-800 p-3 rounded-2xl text-white text-xs border border-slate-700">
                  <option value="">Ninguno</option>
                  {localEmployees.filter(e => e.id !== editingId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* FUNCIONES EXTRA (AQUÍ ESTÁ LA SOLUCIÓN) */}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funciones Extra (ISO 9001)</span>
              <button onClick={() => setNewEmp({...newEmp, additionalRoles: [...(newEmp.additionalRoles || []), { jobTitle: '', department: departments[0], reportsTo: '' }]})} className="bg-orange-600/10 text-orange-500 px-3 py-2 rounded-xl text-[10px] font-black">+ AÑADIR FUNCIÓN</button>
            </div>
            
            {(newEmp.additionalRoles || []).map((role, idx) => (
              <div key={idx} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 relative space-y-4 shadow-inner">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Puesto en esta función</label>
                  <input placeholder="Ej. Responsable de Calidad" value={role.jobTitle} onChange={e => updateRole(idx, 'jobTitle', e.target.value)} className="w-full bg-slate-900 p-3 rounded-xl text-white text-xs border border-slate-800" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Área</label>
                    <select value={role.department} onChange={e => updateRole(idx, 'department', e.target.value)} className="w-full bg-slate-900 p-2.5 rounded-xl text-white text-[10px] border border-slate-800">
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Responsable/Superior</label>
                    <select value={role.reportsTo} onChange={e => updateRole(idx, 'reportsTo', e.target.value)} className="w-full bg-slate-900 p-2.5 rounded-xl text-white text-[10px] border border-slate-800">
                      <option value="">Seleccionar Superior</option>
                      {localEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                </div>
                
                <button onClick={() => setNewEmp({...newEmp, additionalRoles: (newEmp.additionalRoles || []).filter((_, i) => i !== idx)})} className="absolute -top-3 -right-2 bg-red-600 p-2 rounded-full text-white shadow-xl"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            {editingId && <button onClick={resetForm} className="flex-1 bg-slate-800 text-slate-400 py-3 rounded-2xl text-xs font-black uppercase"><RotateCcw size={16} className="mx-auto"/></button>}
            <button onClick={handleSave} className="flex-[4] bg-orange-600 text-white py-4 rounded-2xl text-xs font-black uppercase shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2">
               <Save size={18}/> {editingId ? 'Confirmar Cambios' : 'Registrar Colaborador'}
            </button>
          </div>
        </div>

        {/* LISTADO DE PERSONAL */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Personal Registrado</p>
          <div className="grid grid-cols-1 gap-3">
            {localEmployees.map(emp => (
              <div key={emp.id} className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 flex justify-between items-center shadow-sm">
                <div className="min-w-0 flex-1">
                  <div className="font-black text-white text-sm truncate uppercase tracking-tight">{emp.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{emp.jobTitle}</div>
                  {emp.additionalRoles && emp.additionalRoles.length > 0 && (
                    <div className="flex gap-1 mt-1 overflow-x-auto no-scrollbar">
                      {emp.additionalRoles.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[8px] font-black rounded-full border border-orange-500/20 whitespace-nowrap">+{r.jobTitle}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => { setNewEmp({...emp}); setEditingId(emp.id); formRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="p-3 bg-slate-800 text-orange-500 rounded-2xl"><Edit2 size={18}/></button>
                  <button onClick={() => { if(confirm('¿Eliminar colaborador?')) { const u = localEmployees.filter(e => e.id !== emp.id); setLocalEmployees(u); onSave(u, departments); }}} className="p-3 bg-red-950/20 text-red-500 rounded-2xl"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTÓN DE CIERRE FIJO TOTAL */}
      <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-[110] shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <button onClick={() => { onSave(localEmployees, departments); onClose(); }} className="w-full bg-slate-100 text-slate-950 py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2">
           Finalizar y Cerrar Configuración
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
