import { Employee, Criterion, Department } from './types';

export const DEPARTMENTS: Department[] = [
  'Administración y RRHH',
  'Arte',
  'Calidad',
  'Comercial',
  'Expedición',
  'Gerencia',
  'Producción',
  'Redes Sociales',
  'Sistemas',
  'Stock'
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Gonzalo Viñas',
    department: 'Gerencia',
    jobTitle: 'Director Gerente General',
  },
  {
    id: '2',
    name: 'Daniel Gandolfo',
    department: 'Arte',
    jobTitle: 'Gerente de Arte',
    reportsTo: '1',
  },
  {
    id: '3',
    name: 'Cristina García',
    department: 'Administración y RRHH',
    jobTitle: 'Gerente de Administración y RRHH',
    reportsTo: '1',
  },
  {
    id: '4',
    name: 'Pablo Candia',
    department: 'Producción',
    jobTitle: 'Gerente de Producción',
    reportsTo: '1',
  },
  {
    id: '5',
    name: 'Maximiliano Chucarro',
    department: 'Comercial',
    jobTitle: 'Gerente Comercial',
    reportsTo: '1',
  },
  {
    id: '6',
    name: 'Cristian Recoba',
    department: 'Arte',
    jobTitle: 'Encargado de Arte',
    reportsTo: '2',
  },
  {
    id: '7',
    name: 'Gastón Hannay',
    department: 'Arte',
    jobTitle: 'Diseñador Gráfico',
    reportsTo: '2',
  },
  {
    id: '8',
    name: 'Facundo Césaro',
    department: 'Producción',
    jobTitle: 'Rebobinador',
    reportsTo: '4',
  },
  {
    id: '9',
    name: 'Sebastián Castro',
    department: 'Producción',
    jobTitle: 'Impresor Flexo',
    reportsTo: '4',
  },
  {
    id: '10',
    name: 'Aram Handalian',
    department: 'Redes Sociales',
    jobTitle: 'Asesor en Redes Sociales',
    reportsTo: '1',
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
