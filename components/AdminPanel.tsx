import React, { useState, useRef } from 'react';
import { Employee, Criterion, SavedEvaluation } from '../types';
import { Plus, Trash2, Building2, Settings, Save, X, Edit2 } from 'lucide-react';

interface AdminPanelProps {
  employees: Employee[];
  departments: string[];
  criteria: Criterion[];
  evaluations: SavedEvaluation[];
  onClose: () => void;
  onSave: (employees: Employee[], departments: string[], criteria: Criterion[], evaluations: SavedEvaluation[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ employees, departments, criteria, evaluations, onClose, onSave }) => {
  const [localEmployees, setLocalEmployees] = useState(employees);
  const [localDepartments, setLocalDepartments] = useState(departments || []);
  const [localCriteria, setLocalCriteria] = useState<Criterion[]>(criteria || []);
  const [localEvaluations, setLocalEvaluations] = useState<SavedEvaluation[]>(evaluations || []);
  const [activeTab, setActiveTab] = useState<'employees' | 'departments' | 'criteria' | 'history'>('employees');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState<string | null>(null);
  const [editDeptValue, setEditDeptValue] = useState('');
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    name: '',
    department: (localDepartments && localDepartments.length > 0) ? localDepartments[0] : '',
    jobtitle: '',
    reportsto: '',
    additionalroles: []
  });
  const [newDeptName, setNewDeptName] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setNewEmp({
      name: '',
      department: (localDepartments && localDepartments.length > 0) ? localDepartments[0] : '',
      jobtitle: '',
      reportsto: '',
      additionalroles: []
    });
    setEditingId(null);
  };

  const handleSaveEmployee = () => {
    const jt = newEmp.jobtitle || newEmp.jobTitle;
    if (!newEmp.name || !jt) return alert("Faltan datos");

    const normalizedEmp: Employee = {
      id: editingId || Date.now().toString(),
      name: newEmp.name,
      department: newEmp.department || (localDepartments && localDepartments.length > 0 ? localDepartments[0] : ''),
      jobtitle: jt,
      reportsto: newEmp.reportsto || newEmp.reportsTo || '',
      additionalroles: newEmp.additionalroles || newEmp.additionalRoles || [],
      averagescore: newEmp.averagescore || newEmp.averageScore || 0
    };

    const updated = editingId
      ? localEmployees.map(e => e.id === editingId ? normalizedEmp : e)
      : [...localEmployees, normalizedEmp];

    setLocalEmployees(updated);
    onSave(updated, localDepartments, localCriteria, localEvaluations);
    resetForm();
  };

  const updateRole = (index: number, field: string, value: string) => {
    const roles = [...(newEmp.additionalroles || newEmp.additionalRoles || [])];
    roles[index] = { ...roles[index], [field]: value };
    setNewEmp({ ...newEmp, additionalroles: roles });
  };

  const handleSaveDeptEdit = () => {
    if (!editDeptValue.trim() || !editingDeptName) return;
    const updatedDepts = localDepartments.map(d => d === editingDeptName ? editDeptValue.trim() : d);
    const updatedEmps = localEmployees.map(emp => ({
      ...emp,
      department: emp.department === editingDeptName ? editDeptValue.trim() : emp.department
    }));
    setLocalDepartments(updatedDepts);
    setLocalEmployees(updatedEmps);
    onSave(updatedEmps, updatedDepts, localCriteria, localEvaluations);
    setEditingDeptName(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden font-sans">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
        <div className="flex items-center gap-2"><Settings className="text-orange-500 w-5 h-5" /><h2 className="text-sm font-black text-white uppercase tracking-tighter">RR Etiquetas Admin</h2></div>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-xl text-white hover:bg-slate-700 transition-all"><X size={20} /></button>
      </div>

      <div className="flex bg-slate-900 border-b border-slate-800 shrink-0">
        <button onClick={() => setActiveTab('employees')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'employees' ? 'border-orange-500 text-white bg-orange-500/5' : 'border-transparent text-slate-500'}`}>Colaboradores</button>
        <button onClick={() => setActiveTab('departments')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'departments' ? 'border-orange-500 text-white bg-orange-500/5' : 'border-transparent text-slate-500'}`}>Áreas</button>
        <button onClick={() => setActiveTab('criteria')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'criteria' ? 'border-orange-500 text-white bg-orange-500/5' : 'border-transparent text-slate-500'}`}>Criterios</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'history' ? 'border-orange-500 text-white bg-orange-500/5' : 'border-transparent text-slate-500'}`}>Historial</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 bg-slate-950">
        {activeTab === 'employees' ? (
          <>
            <div ref={formRef} className={`p-5 rounded-[2rem] border ${editingId ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
              <div className="space-y-4">
                <input placeholder="Nombre Completo" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} className="w-full bg-slate-800 p-3 rounded-2xl text-white text-sm border border-slate-700 outline-none focus:border-orange-500/50" />
                <input placeholder="Puesto Principal" value={newEmp.jobtitle || newEmp.jobTitle} onChange={e => setNewEmp({ ...newEmp, jobtitle: e.target.value })} className="w-full bg-slate-800 p-3 rounded-2xl text-white text-sm border border-slate-700 outline-none focus:border-orange-500/50" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value })} className="bg-slate-800 p-3 rounded-2xl text-white text-xs border border-slate-700">
                    {localDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={newEmp.reportsto || newEmp.reportsTo} onChange={e => setNewEmp({ ...newEmp, reportsto: e.target.value })} className="bg-slate-800 p-3 rounded-2xl text-white text-xs border border-slate-700">
                    <option value="">Reporta a...</option>
                    {localEmployees.filter(e => e.id !== editingId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Responsabilidades Extra (ISO 9001)</span>
                  <button onClick={() => setNewEmp({ ...newEmp, additionalroles: [...(newEmp.additionalroles || newEmp.additionalRoles || []), { jobtitle: '', department: localDepartments[0], reportsto: '' }] })} className="text-orange-500 text-[10px] font-black">+ AÑADIR</button>
                </div>
                {(newEmp.additionalroles || newEmp.additionalRoles || []).map((role, idx) => (
                  <div key={idx} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 relative space-y-4">
                    <input placeholder="Puesto" value={role.jobtitle || role.jobTitle} onChange={e => updateRole(idx, 'jobtitle', e.target.value)} className="w-full bg-slate-900 p-3 rounded-xl text-white text-xs border border-slate-800" />
                    <div className="grid grid-cols-2 gap-3">
                      <select value={role.department} onChange={e => updateRole(idx, 'department', e.target.value)} className="bg-slate-900 p-2.5 rounded-xl text-white text-[10px] border border-slate-800">{localDepartments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                      <select value={role.reportsto || role.reportsTo} onChange={e => updateRole(idx, 'reportsto', e.target.value)} className="bg-slate-900 p-2.5 rounded-xl text-white text-[10px] border border-slate-800">
                        <option value="">Superior</option>{localEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                    <button onClick={() => setNewEmp({ ...newEmp, additionalroles: (newEmp.additionalroles || newEmp.additionalRoles || []).filter((_, i) => i !== idx) })} className="absolute -top-3 -right-2 bg-red-600 p-2 rounded-full text-white shadow-xl hover:bg-red-500 transition-all"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <button onClick={handleSaveEmployee} className="w-full bg-orange-600 text-white py-4 rounded-2xl mt-6 text-xs font-black uppercase shadow-lg shadow-orange-900/20 hover:bg-orange-500 transition-all">
                {editingId ? 'Guardar Cambios' : 'Registrar Colaborador'}
              </button>
            </div>

            <div className="space-y-3 mt-8">
              {localEmployees.map(emp => (
                <div key={emp.id} className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 flex justify-between items-center shadow-sm hover:border-slate-700 transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-white text-sm truncate uppercase tracking-tighter">{emp.name}</div>
                    <div className="text-[10px] text-slate-500 font-bold">{emp.jobtitle || emp.jobTitle}</div>
                    {(emp.additionalroles || emp.additionalRoles || []).length > 0 && (
                      <div className="flex gap-1 mt-1 overflow-x-auto no-scrollbar">
                        {(emp.additionalroles || emp.additionalRoles || []).map((r, i) => (
                          <span key={i} className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[8px] font-black rounded-full border border-orange-500/20 whitespace-nowrap">+{r.jobtitle || r.jobTitle}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => { setNewEmp({ ...emp }); setEditingId(emp.id); formRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="p-3 bg-slate-800 text-orange-500 rounded-2xl hover:bg-slate-700 transition-all"><Edit2 size={18} /></button>
                    <button onClick={() => { if (confirm('¿Borrar colaborador permanentemente?')) { const u = localEmployees.filter(e => e.id !== emp.id); setLocalEmployees(u); onSave(u, localDepartments, localCriteria, localEvaluations); } }} className="p-3 bg-red-950/20 text-red-500 rounded-2xl hover:bg-red-900/40 transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : activeTab === 'departments' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Añadir Nueva Área</p>
              <div className="flex flex-col gap-3">
                <input placeholder="Nombre del área" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} className="w-full bg-slate-800 p-4 rounded-2xl text-white text-sm border border-slate-700 outline-none focus:border-orange-500/50" />
                <button onClick={() => { if (!newDeptName.trim()) return; const u = [...localDepartments, newDeptName.trim()]; setLocalDepartments(u); onSave(localEmployees, u, localCriteria, localEvaluations); setNewDeptName(''); }} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 hover:bg-orange-500 transition-all">
                  <Plus size={18} /> Agregar Área
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {localDepartments.map(dept => (
                <div key={dept} className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex justify-between items-center group">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-orange-500"><Building2 size={20} /></div>
                    {editingDeptName === dept ? <input value={editDeptValue} onChange={e => setEditDeptValue(e.target.value)} className="bg-slate-800 p-2 rounded-lg text-white text-sm border border-orange-500/50 flex-1 outline-none" autoFocus /> : <span className="text-white font-black text-sm uppercase truncate">{dept}</span>}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {editingDeptName === dept ? <button onClick={handleSaveDeptEdit} className="p-3 bg-emerald-950/20 text-emerald-500 rounded-2xl"><Save size={18} /></button> : <button onClick={() => { setEditingDeptName(dept); setEditDeptValue(dept); }} className="p-3 bg-slate-800 text-orange-500 rounded-2xl hover:bg-slate-700 transition-all"><Edit2 size={18} /></button>}
                    <button onClick={() => { if (!localEmployees.some(e => e.department === dept) && confirm(`¿Borrar ${dept}?`)) { const u = localDepartments.filter(d => d !== dept); setLocalDepartments(u); onSave(localEmployees, u, localCriteria, localEvaluations); } }} className="p-3 bg-red-950/20 text-red-500 rounded-2xl hover:bg-red-900/40 transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'criteria' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20 mb-4">
              <p className="text-[10px] font-bold text-orange-200 uppercase leading-tight">
                Nota: Estos son los pilares de evaluación.
              </p>
            </div>
            {localCriteria.map((c, idx) => (
              <div key={c.id || idx} className="bg-slate-900 p-5 rounded-[1.5rem] border border-slate-800 space-y-4 shadow-lg">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-orange-500 border border-slate-700">{idx + 1}</span>
                    <input
                      value={c.name}
                      onChange={e => {
                        const next = [...localCriteria];
                        next[idx] = { ...next[idx], name: e.target.value };
                        setLocalCriteria(next);
                      }}
                      className="bg-transparent border-b border-slate-800 focus:border-orange-500/50 outline-none font-black text-white uppercase text-sm flex-1 pb-1"
                      placeholder="Nombre del Criterio"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={c.category}
                      onChange={e => {
                        const next = [...localCriteria];
                        next[idx] = { ...next[idx], category: e.target.value };
                        setLocalCriteria(next);
                      }}
                      className="bg-slate-800 p-2 rounded-xl text-[10px] font-bold text-slate-300 border border-slate-700"
                    >
                      {['Desempeño', 'Calidad', 'Competencias Técnicas', 'Competencias Blandas', 'Actitud'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={c.description}
                    onChange={e => {
                      const next = [...localCriteria];
                      next[idx] = { ...next[idx], description: e.target.value };
                      setLocalCriteria(next);
                    }}
                    className="w-full bg-slate-950/50 p-3 rounded-xl text-xs text-slate-400 border border-slate-800 outline-none focus:border-orange-500/30 h-16 resize-none"
                    placeholder="Descripción detallada..."
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase">
                Total de evaluaciones: {localEvaluations.length}
              </p>
            </div>
            {localEvaluations.length === 0 ? (
              <div className="text-center py-12 text-slate-600 uppercase text-[10px] font-black">No hay evaluaciones registradas</div>
            ) : (
              [...localEvaluations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(ev => {
                const emp = employees.find(e => e.id === (ev.employeeid || ev.employeeId));
                return (
                  <div key={ev.id} className="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex justify-between items-center shadow-sm">
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-white text-sm truncate uppercase tracking-tighter">{emp?.name || 'Empleado Borrado'}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                        <span>{new Date(ev.date).toLocaleDateString()}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="text-orange-500">Score: {ev.finalscore || ev.finalScore}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar esta evaluación permanentemente?')) {
                          const updated = localEvaluations.filter(e => e.id !== ev.id);
                          setLocalEvaluations(updated);
                          onSave(localEmployees, localDepartments, localCriteria, updated);
                        }
                      }}
                      className="p-3 bg-red-950/20 text-red-500 rounded-2xl hover:bg-red-900/40 transition-all border border-red-500/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-[110] shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <button onClick={() => { onSave(localEmployees, localDepartments, localCriteria, localEvaluations); onClose(); }} className="w-full bg-slate-100 text-slate-950 py-4 rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-white active:scale-95 transition-all">
          Guardar Todo y Finalizar
        </button>
      </div>
    </div>
  );
};
