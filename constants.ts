import { Employee, Criterion, Department } from './types';

export const DEPARTMENTS: Department[] = [
  'Gerencia',
  'Administración y RRHH',
  'Calidad',
  'Producción',
  'Comercialización',
  'Expedición',
  'Stock',
  'Arte'
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Gonzalo Viñas',
    department: 'Gerencia',
    jobTitle: 'Director General',
  },
  {
    id: '2',
    name: 'Daniel Gandolfo',
    department: 'Arte',
    jobTitle: 'Gerente de Arte',
    additionalRoles: [
      { jobTitle: 'Ayudante de Producción', department: 'Producción', reportsTo: '3' },
      { jobTitle: 'Ayudante de Calidad', department: 'Calidad', reportsTo: '5' }
    ],
    reportsTo: '1',
  },
  {
    id: '3',
    name: 'Pablo Candia',
    department: 'Calidad',
    jobTitle: 'Jefe de Calidad',
    reportsTo: '1',
  },
  {
    id: '4',
    name: 'Pablo Tato',
    department: 'Comercialización',
    jobTitle: 'Gerente Comercial',
    reportsTo: '1',
  },
  {
    id: '5',
    name: 'Cristina Garcia',
    department: 'Administración y RRHH',
    jobTitle: 'Jefe de Administración',
    additionalRoles: [
      { jobTitle: 'Gerente de Sección B', department: 'Producción' }
    ],
    reportsTo: '1',
  },
  {
    id: '6',
    name: 'Operario 1',
    department: 'Producción',
    jobTitle: 'Operador de Flexografía',
    reportsTo: '2',
  },
  {
    id: '7',
    name: 'Asistente Comercial 1',
    department: 'Comercialización',
    jobTitle: 'Asistente de Ventas',
    reportsTo: '4',
  }
];

export const DEFAULT_CRITERIA: Omit<Criterion, 'score' | 'feedback'>[] = [
  {
    id: 'c1',
    name: 'Conocimiento del Puesto',
    description: 'Nivel de dominio de las tareas y responsabilidades asignadas.',
    category: 'Competencias Técnicas'
  },
  {
    id: 'c2',
    name: 'Calidad de Trabajo',
    description: 'Precisión, orden y cumplimiento de estándares ISO 9001.',
    category: 'Calidad'
  },
  {
    id: 'c3',
    name: 'Productividad',
    description: 'Eficiencia en el uso del tiempo y recursos.',
    category: 'Desempeño'
  },
  {
    id: 'c4',
    name: 'Trabajo en Equipo',
    description: 'Colaboración y comunicación con compañeros y superiores.',
    category: 'Competencias Blandas'
  },
  {
    id: 'c5',
    name: 'Iniciativa',
    description: 'Capacidad para proponer mejoras y resolver problemas.',
    category: 'Actitud'
  }
];
