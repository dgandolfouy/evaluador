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
  const [activeTab, setActiveTab] = useState<'employees' | 'departments'>('employees');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({ name: '', department: departments[0] || '', jobTitle: '', reportsTo: '', additionalRoles: [] });
  const formRef = useRef<HTMLDivElement>(null);

  const handleCancelEdit = () => {
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
    handleCancelEdit();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col sm:items-center sm:justify-center sm:p-4">
      <div className="bg-slate-900 w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[2rem] border-x sm:border border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header Responsivo */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Settings className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-base sm:text-xl font-black text-white">Configuración</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-24 sm:pb-6">
          {/* Formulario Adaptable */}
          <div ref={formRef} className={`p-4 sm:p-6 rounded-2xl border ${editingId ? 'bg-amber-900/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
            <h3 className="text-[10px] font-black uppercase text-white mb-4 flex items-center gap-2">
              {editingId ? <Edit2 size={14}/> : <UserPlus size={14}/>} {editingId ? 'Editar' : 'Nuevo'} Colaborador
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Nombre</label>
                <input value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full bg-slate-900 p-3 rounded-xl text-white text-sm border border-slate-700 focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Puesto Principal</label>
                <input value={newEmp.jobTitle} onChange={e => setNewEmp({...newEmp, jobTitle: e.target.value})} className="w-full bg-slate-900 p-3 rounded-xl text-white text-sm border border-slate-700 focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Departamento</label>
                <select value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="w-full bg-slate-900 p-3 rounded-xl text-white text-sm border border-slate-700">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Superior</label>
                <select value={newEmp.reportsTo} onChange={e => setNewEmp({...newEmp, reportsTo: e.target.value})} className="w-full bg-slate-900 p-3 rounded-xl text-white text-sm border border-slate-700">
                  <option value="">Sin Superior</option>
                  {localEmployees.filter(e => e.id !== editingId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>

            {/* Cargos Adicionales (Móvil-Friendly) */}
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Funciones Extra</span>
                <button onClick={() => setNewEmp(prev => ({...prev, additionalRoles: [...(prev.additionalRoles || []), { jobTitle: '', department: departments[0], reportsTo: '' }]}))} className="bg-orange-600/10 text-orange-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-orange-600/20 transition-all">+ Agregar</button>
              </div>
              
              {(newEmp.additionalRoles || []).map((role, idx) => (
                <div key={idx} className="p-4 bg-slate-950/50 rounded-2xl border border-slate-700 space-y-3 relative">
                  <input placeholder="Puesto adicional" value={role.jobTitle} onChange={e => setNewEmp(prev => ({ ...prev, additionalRoles: (prev.additionalRoles || []).map((r, i) => i === idx ? { ...r, jobTitle: e.target.value } : r) }))} className="w-full bg-slate-900 p-2 rounded-lg text-white text-xs" />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={role.department} onChange={e => setNewEmp(prev => ({ ...prev, additionalRoles: (prev.additionalRoles || []).map((r, i) => i === idx ? { ...r, department: e.target.value } : r) }))} className="bg-slate-900 p-2 rounded-lg text-white text-[10px]">
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={role.reportsTo} onChange={e => setNewEmp(prev => ({ ...prev, additionalRoles: (prev.additionalRoles || []).map((r, i) => i === idx ? { ...r, reportsTo: e.target.value } : r) }))} className="bg-slate-900 p-2 rounded-lg text-white text-[10px]">
                      <option value="">Superior</option>
                      {localEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setNewEmp(prev => ({...prev, additionalRoles: (prev.additionalRoles || []).filter((_, i) => i !== idx)}))} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-8">
              {editingId && <button onClick={handleCancelEdit} className="flex-1 bg-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase"><RotateCcw size={14} className="inline mr-1"/> Cancelar</button>}
              <button onClick={handleSave} className="flex-[2] bg-orange-600 text-white py-3 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-orange-900/20">Confirmar</button>
            </div>
          </div>

          {/* Tabla de Colaboradores (Adaptada a Móvil) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase ml-1">Personal Registrado</h3>
            <div className="grid grid-cols-1 gap-3">
              {localEmployees.map(emp => (
                <div key={emp.id} className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800 flex items-center justify-between group">
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm truncate">{emp.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{emp.jobTitle} • {emp.department}</div>
                    {emp.additionalRoles?.map((r, i) => (
                      <div key={i} className="text-[9px] text-orange-500/60 italic">+{r.jobTitle} ({r.department})</div>
                    ))}
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button onClick={() => handleEditEmployee(emp)} className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-xl transition-all"><Edit2 size={18}/></button>
                    <button onClick={() => { if(confirm('¿Eliminar?')) { const u = localEmployees.filter(e => e.id !== emp.id); setLocalEmployees(u); onSave(u, departments); }}} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botón Flotante/Fijo de Guardado */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900 shrink-0">
          <button onClick={() => { onSave(localEmployees, departments); onClose(); }} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black uppercase text-xs shadow-xl shadow-orange-900/40 flex items-center justify-center gap-2">
            <Save size={18}/> Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
  
  function handleEditEmployee(emp: Employee) {
    setNewEmp({ ...emp });
    setEditingId(emp.id);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
};

export default AdminPanel;
