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
      updatedEmployees = [...employees, {
        id,
        name: newEmployee.name!,
        department: newEmployee.department || departments[0],
        jobTitle: newEmployee.jobTitle!,
        reportsTo: newEmployee.reportsTo || '',
        additionalRoles: newEmployee.additionalRoles || []
      } as Employee];
    }

    setEmployees(updatedEmployees);
    onSave(updatedEmployees, departments); // Sincronización inmediata
    
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
      <div className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-800 text-white">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black">Panel Admin RR Etiquetas</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
             <div className="grid grid-cols-2 gap-4 mb-4">
                <input placeholder="Nombre" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} className="bg-slate-900 p-2 rounded-lg" />
                <input placeholder="Puesto Principal" value={newEmployee.jobTitle} onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})} className="bg-slate-900 p-2 rounded-lg" />
             </div>
             
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">CARGOS ADICIONALES</span>
                  <button onClick={handleAddAdditionalRole} className="text-orange-500 text-xs">+ Agregar Cargo</button>
                </div>
                {newEmployee.additionalRoles?.map((role, idx) => (
                  <div key={idx} className="flex gap-2 bg-slate-900 p-2 rounded-lg">
                    <input placeholder="Puesto" value={role.jobTitle} onChange={e => handleUpdateAdditionalRole(idx, 'jobTitle', e.target.value)} className="bg-slate-800 p-1 rounded flex-1" />
                    <button onClick={() => handleRemoveAdditionalRole(idx)} className="text-red-500"><Trash2 size={16}/></button>
                  </div>
                ))}
             </div>

             <button onClick={handleSaveEmployee} className="w-full bg-orange-600 py-3 rounded-xl mt-6 font-bold">Confirmar Colaborador</button>
           </section>

           <table className="w-full">
              <thead><tr className="text-left text-slate-500 text-xs"><th>NOMBRE</th><th>PUESTOS</th><th>ACCIONES</th></tr></thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="border-t border-slate-800">
                    <td className="py-4 font-bold">{emp.name}</td>
                    <td className="py-4">
                      <div className="text-xs">{emp.jobTitle}</div>
                      {emp.additionalRoles?.map((r, i) => <div key={i} className="text-[10px] text-orange-400">{r.jobTitle}</div>)}
                    </td>
                    <td className="py-4"><button onClick={() => handleEditEmployee(emp)}><Edit2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end">
          <button onClick={handleSaveAndClose} className="bg-orange-600 px-8 py-3 rounded-xl font-black">GUARDAR Y CERRAR</button>
        </div>
      </div>
    </div>
  );
};
